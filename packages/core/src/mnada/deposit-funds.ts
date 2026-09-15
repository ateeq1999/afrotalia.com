import type { Database } from "@afrotalia/db";
import { wallet, walletTransaction } from "@afrotalia/db/schema/mnada";
import { eq } from "drizzle-orm";

import { mockCharge, type PaymentMethod } from "../payments/mock-provider";
import { logAudit } from "./db-helpers";

export interface DepositFundsResult {
  balance: number;
}

/** Mock top-up: charges the mock provider, credits the wallet, logs both. */
export async function depositFunds(
  db: Database,
  params: { userId: string; amount: number; method: PaymentMethod },
): Promise<DepositFundsResult> {
  return db.transaction(async (tx) => {
    await mockCharge({ method: params.method, amountMinor: params.amount });

    const [existing] = await tx.select().from(wallet).where(eq(wallet.userId, params.userId)).for("update");
    let walletId: string;
    let balance: number;
    if (existing) {
      balance = existing.balance + params.amount;
      walletId = existing.id;
      await tx.update(wallet).set({ balance }).where(eq(wallet.id, existing.id));
    } else {
      const [inserted] = await tx
        .insert(wallet)
        .values({ userId: params.userId, balance: params.amount })
        .returning({ id: wallet.id });
      walletId = inserted!.id;
      balance = params.amount;
    }

    await tx.insert(walletTransaction).values({
      walletId,
      kind: "DEPOSIT",
      amount: params.amount,
      balanceAfter: balance,
      reference: "mock-deposit",
    });
    await logAudit(tx, {
      actorUserId: params.userId,
      entityType: "wallet",
      entityId: params.userId,
      action: "DEPOSIT",
      metadata: { amount: params.amount, method: params.method },
    });

    return { balance };
  });
}
