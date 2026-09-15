import type { Database } from "@afrotalia/db";
import { order } from "@afrotalia/db/schema/mnada";
import { payment, paymentEvent } from "@afrotalia/db/schema/shop";
import { and, desc, eq } from "drizzle-orm";

import { DomainError } from "../errors";
import { logAudit } from "../mnada/db-helpers";

export interface ConfirmDeliveryResult {
  orderId: string;
}

/**
 * Buyer confirms receipt: moves the order to DELIVERED and releases escrow
 * — a `RELEASED` ledger row against the captured payment, not a mutable
 * flag flip.
 */
export async function confirmDelivery(
  db: Database,
  params: { orderId: string; userId: string },
): Promise<ConfirmDeliveryResult> {
  return db.transaction(async (tx) => {
    const [orderRow] = await tx.select().from(order).where(eq(order.id, params.orderId)).for("update");
    if (!orderRow || orderRow.userId !== params.userId || orderRow.type !== "SHOP_ORDER") {
      throw new DomainError("ORDER_NOT_FOUND");
    }
    if (orderRow.status !== "PROCESSING" && orderRow.status !== "SHIPPED") {
      throw new DomainError("ORDER_ALREADY_PROCESSED");
    }

    const [capturedPayment] = await tx
      .select()
      .from(payment)
      .where(and(eq(payment.orderId, orderRow.id), eq(payment.status, "SUCCEEDED")))
      .orderBy(desc(payment.createdAt))
      .limit(1);

    await tx.update(order).set({ status: "DELIVERED" }).where(eq(order.id, orderRow.id));

    if (capturedPayment) {
      await tx.insert(paymentEvent).values({
        paymentId: capturedPayment.id,
        kind: "RELEASED",
        amount: capturedPayment.amount,
      });
    }

    await logAudit(tx, {
      actorUserId: params.userId,
      entityType: "order",
      entityId: orderRow.id,
      action: "DELIVERY_CONFIRMED",
    });

    return { orderId: orderRow.id };
  });
}
