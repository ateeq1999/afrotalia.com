import type { Database } from "@afrotalia/db";
import { order, wallet, walletTransaction } from "@afrotalia/db/schema/mnada";
import { eq } from "drizzle-orm";

import { DomainError } from "../errors";
import { logAudit } from "./db-helpers";

export interface ConfirmWinPaymentResult {
  orderId: string;
}

/**
 * Finalizes an `AUCTION_WIN` order: the winning bid amount is already
 * reserved in the buyer's wallet (held since the winning bid was placed),
 * so this releases that reservation and immediately re-charges it as the
 * purchase payment — net zero balance change, but an explicit ledger pair
 * instead of silently repurposing the bid reservation.
 */
export async function confirmWinPayment(
  db: Database,
  params: { orderId: string; userId: string; now?: Date },
): Promise<ConfirmWinPaymentResult> {
  const now = params.now ?? new Date();

  return db.transaction(async (tx) => {
    const [orderRow] = await tx.select().from(order).where(eq(order.id, params.orderId)).for("update");
    if (!orderRow || orderRow.userId !== params.userId || orderRow.type !== "AUCTION_WIN") {
      throw new DomainError("ORDER_NOT_FOUND");
    }
    if (orderRow.status !== "PENDING_PAYMENT") throw new DomainError("ORDER_ALREADY_PROCESSED");
    if (orderRow.paymentDueAt && orderRow.paymentDueAt < now) throw new DomainError("PAYMENT_WINDOW_EXPIRED");

    const [w] = await tx.select().from(wallet).where(eq(wallet.userId, params.userId)).for("update");
    if (!w) throw new DomainError("INSUFFICIENT_FUNDS");

    const releasedBalance = w.balance + orderRow.totalAmount;
    await tx.insert(walletTransaction).values({
      walletId: w.id,
      kind: "BID_RELEASE",
      amount: orderRow.totalAmount,
      balanceAfter: releasedBalance,
      reference: orderRow.auctionId ?? orderRow.id,
    });
    const paidBalance = releasedBalance - orderRow.totalAmount;
    await tx.insert(walletTransaction).values({
      walletId: w.id,
      kind: "AUCTION_PAYMENT",
      amount: -orderRow.totalAmount,
      balanceAfter: paidBalance,
      reference: orderRow.auctionId ?? orderRow.id,
    });
    await tx.update(wallet).set({ balance: paidBalance }).where(eq(wallet.id, w.id));

    await tx.update(order).set({ status: "PROCESSING" }).where(eq(order.id, orderRow.id));
    await logAudit(tx, {
      actorUserId: params.userId,
      entityType: "order",
      entityId: orderRow.id,
      action: "PAYMENT_CONFIRMED",
      metadata: { amount: orderRow.totalAmount },
    });

    return { orderId: orderRow.id };
  });
}
