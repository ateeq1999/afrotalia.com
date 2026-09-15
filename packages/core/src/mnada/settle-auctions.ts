import type { Database } from "@afrotalia/db";
import { auction, bid, order } from "@afrotalia/db/schema/mnada";
import { and, desc, eq, lte } from "drizzle-orm";

import { logAudit, readSettingNumber, releaseReservation } from "./db-helpers";
import { computePaymentDueAt, decideAuctionSettlement } from "./settlement-rules";

export interface SettleAuctionsResult {
  settled: string[];
  closed: string[];
}

/**
 * Closes every LIVE auction past `endsAt`. Settled lots (reserve met) get an
 * `AUCTION_WIN` order with a payment window; unsold lots (no bids, or
 * reserve not met) release the current leader's reservation. Each auction
 * is handled in its own locked transaction so one bad row can't block the
 * rest of the sweep.
 */
export async function settleExpiredAuctions(
  db: Database,
  now: Date = new Date(),
): Promise<SettleAuctionsResult> {
  const settled: string[] = [];
  const closed: string[] = [];

  const expired = await db
    .select({ id: auction.id })
    .from(auction)
    .where(and(eq(auction.status, "LIVE"), lte(auction.endsAt, now)));

  for (const { id } of expired) {
    const outcome = await db.transaction(async (tx) => {
      const [auctionRow] = await tx.select().from(auction).where(eq(auction.id, id)).for("update");
      // Re-check under lock: another worker may have already settled it.
      if (!auctionRow || auctionRow.status !== "LIVE" || auctionRow.endsAt > now) return null;

      const [highest] = await tx
        .select({ userId: bid.userId, amount: bid.amount })
        .from(bid)
        .where(eq(bid.auctionId, id))
        .orderBy(desc(bid.amount))
        .limit(1);

      const decision = decideAuctionSettlement({
        reservePrice: auctionRow.reservePrice,
        highestBid: highest ?? null,
      });

      if (decision.outcome === "CLOSED") {
        if (highest) {
          await releaseReservation(tx, { userId: highest.userId, amount: highest.amount, reference: id });
        }
        await tx.update(auction).set({ status: "CLOSED" }).where(eq(auction.id, id));
        await logAudit(tx, {
          entityType: "auction",
          entityId: id,
          action: "CLOSED",
          metadata: { reason: decision.reason },
        });
        return "closed" as const;
      }

      const paymentWindowHours = await readSettingNumber(tx, "paymentWindowHours", 24);
      const paymentDueAt = computePaymentDueAt(now, paymentWindowHours);

      await tx
        .update(auction)
        .set({ status: "SETTLED", winnerId: decision.winnerId, currentBid: decision.winAmount })
        .where(eq(auction.id, id));
      await tx.insert(order).values({
        userId: decision.winnerId,
        type: "AUCTION_WIN",
        status: "PENDING_PAYMENT",
        auctionId: id,
        totalAmount: decision.winAmount,
        paymentDueAt,
      });
      await logAudit(tx, {
        actorUserId: decision.winnerId,
        entityType: "auction",
        entityId: id,
        action: "SETTLED",
        metadata: { winnerId: decision.winnerId, winAmount: decision.winAmount, paymentDueAt: paymentDueAt.toISOString() },
      });
      return "settled" as const;
    });

    if (outcome === "settled") settled.push(id);
    if (outcome === "closed") closed.push(id);
  }

  return { settled, closed };
}
