import { DomainError, type DomainErrorCode } from "@afrotalia/core";
import { placeBid as placeBidTx } from "@afrotalia/core/mnada/place-bid";
import { auction, bid, mnadaProfile } from "@afrotalia/db/schema/mnada";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { authMiddleware } from "@/middleware/auth";
import { getDb } from "@/services";

const placeBidSchema = z.object({
  auctionId: z.string().min(1),
  amount: z.number().int().positive(),
});

export type PlaceBidResult =
  | { ok: true; bidId: string; currentBid: number; endsAt: number }
  | { ok: false; code: DomainErrorCode; message: string };

export const placeBidFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(placeBidSchema)
  .handler(async ({ data, context }): Promise<PlaceBidResult> => {
    const session = context.session;
    if (!session) {
      return { ok: false, code: "ACCOUNT_NOT_ACTIVE", message: "Sign in to bid." };
    }

    const db = getDb();
    const [profile] = await db
      .select()
      .from(mnadaProfile)
      .where(eq(mnadaProfile.userId, session.user.id))
      .limit(1);
    const accountStatus = profile?.status ?? "PENDING_PAYMENT";

    try {
      const result = await placeBidTx(db, {
        auctionId: data.auctionId,
        userId: session.user.id,
        amount: data.amount,
        accountStatus,
      });
      return {
        ok: true,
        bidId: result.bidId,
        currentBid: result.outcome.newCurrentBid,
        endsAt: result.endsAt.getTime(),
      };
    } catch (err) {
      if (err instanceof DomainError) {
        return { ok: false, code: err.code, message: err.message };
      }
      throw err;
    }
  });

export interface MyBid {
  auctionId: string;
  title: string;
  dbStatus: "SCHEDULED" | "LIVE" | "CLOSED";
  userBid: number;
  currentBid: number;
}

export const listMyBids = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<MyBid[]> => {
    const session = context.session;
    if (!session) return [];

    const db = getDb();
    const rows = await db
      .select({
        auctionId: bid.auctionId,
        amount: bid.amount,
        title: auction.title,
        dbStatus: auction.status,
        currentBid: auction.currentBid,
      })
      .from(bid)
      .innerJoin(auction, eq(bid.auctionId, auction.id))
      .where(eq(bid.userId, session.user.id))
      .orderBy(desc(bid.createdAt));

    const byAuction = new Map<string, MyBid>();
    for (const row of rows) {
      // Rows are ordered newest first — keep the highest bid this user placed per lot.
      const existing = byAuction.get(row.auctionId);
      if (!existing || row.amount > existing.userBid) {
        byAuction.set(row.auctionId, {
          auctionId: row.auctionId,
          title: row.title,
          dbStatus: row.dbStatus,
          userBid: row.amount,
          currentBid: row.currentBid,
        });
      }
    }
    return Array.from(byAuction.values());
  });
