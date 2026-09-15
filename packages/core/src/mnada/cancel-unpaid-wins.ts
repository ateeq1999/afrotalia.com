import type { Database } from "@afrotalia/db";
import { mnadaProfile, order } from "@afrotalia/db/schema/mnada";
import { and, eq, lt } from "drizzle-orm";

import { logAudit, releaseReservation } from "./db-helpers";
import { isViolationBlocking } from "./settlement-rules";

export interface CancelUnpaidWinsResult {
  cancelled: string[];
  blocked: string[];
}

/**
 * Cancels every `AUCTION_WIN` order still `PENDING_PAYMENT` past its
 * `paymentDueAt`: releases the winner's reservation, records a non-payment
 * violation, and blocks the account on the second strike.
 */
export async function cancelUnpaidWins(
  db: Database,
  now: Date = new Date(),
): Promise<CancelUnpaidWinsResult> {
  const cancelled: string[] = [];
  const blocked: string[] = [];

  const overdue = await db
    .select({ id: order.id })
    .from(order)
    .where(and(eq(order.status, "PENDING_PAYMENT"), eq(order.type, "AUCTION_WIN"), lt(order.paymentDueAt, now)));

  for (const { id } of overdue) {
    const result = await db.transaction(async (tx) => {
      const [orderRow] = await tx.select().from(order).where(eq(order.id, id)).for("update");
      // Re-check under lock: the winner may have paid in the meantime.
      if (!orderRow || orderRow.status !== "PENDING_PAYMENT") return null;

      await releaseReservation(tx, {
        userId: orderRow.userId,
        amount: orderRow.totalAmount,
        reference: orderRow.id,
      });
      await tx.update(order).set({ status: "CANCELLED" }).where(eq(order.id, id));
      await logAudit(tx, {
        actorUserId: orderRow.userId,
        entityType: "order",
        entityId: id,
        action: "CANCELLED_NON_PAYMENT",
      });

      const [profile] = await tx
        .select()
        .from(mnadaProfile)
        .where(eq(mnadaProfile.userId, orderRow.userId))
        .for("update");
      if (!profile) return "cancelled" as const;

      const violations = profile.nonPaymentViolations + 1;
      const newlyBlocked = profile.status !== "BLOCKED" && isViolationBlocking(violations);
      await tx
        .update(mnadaProfile)
        .set({ nonPaymentViolations: violations, status: newlyBlocked ? "BLOCKED" : profile.status })
        .where(eq(mnadaProfile.id, profile.id));

      if (newlyBlocked) {
        await logAudit(tx, {
          actorUserId: orderRow.userId,
          entityType: "mnada_profile",
          entityId: orderRow.userId,
          action: "BLOCKED",
          metadata: { reason: "NON_PAYMENT_TWO_STRIKES", violations },
        });
        return "blocked" as const;
      }
      return "cancelled" as const;
    });

    if (result === "cancelled" || result === "blocked") cancelled.push(id);
    if (result === "blocked") blocked.push(id);
  }

  return { cancelled, blocked };
}
