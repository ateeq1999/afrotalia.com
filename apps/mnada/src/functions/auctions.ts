import { auction, bid, mnadaProfile, wallet } from "@afrotalia/db/schema/mnada";
import { createServerFn } from "@tanstack/react-start";
import { asc, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { iconForLot } from "@/lib/mnada";
import { authMiddleware } from "@/middleware/auth";
import { getDb } from "@/services";

export const listAuctions = createServerFn({ method: "GET" }).handler(async () => {
  const db = getDb();
  const rows = await db.select().from(auction).orderBy(asc(auction.startsAt));
  const bidRows = await db.select({ auctionId: bid.auctionId, userId: bid.userId }).from(bid);

  const biddersByAuction = new Map<string, Set<string>>();
  for (const row of bidRows) {
    const set = biddersByAuction.get(row.auctionId) ?? new Set<string>();
    set.add(row.userId);
    biddersByAuction.set(row.auctionId, set);
  }

  return {
    serverTime: Date.now(),
    auctions: rows.map((row) => ({
      id: row.id,
      lotNumber: row.lotNumber,
      title: row.title,
      description: row.description,
      image: row.image,
      icon: iconForLot(row.lotNumber),
      dbStatus: row.status,
      currentBid: row.currentBid,
      openingBid: row.openingBid,
      minimumIncrement: row.minimumIncrement,
      startsAt: row.startsAt.getTime(),
      endsAt: row.endsAt.getTime(),
      bidderCount: biddersByAuction.get(row.id)?.size ?? 0,
    })),
  };
});

function bidderLabel(bidderId: string, viewerId: string | null): string {
  if (viewerId && bidderId === viewerId) return "You";
  return `Bidder ${bidderId.slice(-4).toUpperCase()}`;
}

const auctionIdSchema = z.object({ auctionId: z.string().min(1) });

export const getAuctionDetail = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(auctionIdSchema)
  .handler(async ({ data, context }) => {
    const db = getDb();
    const [row] = await db.select().from(auction).where(eq(auction.id, data.auctionId)).limit(1);
    if (!row) return null;

    const bidRows = await db
      .select()
      .from(bid)
      .where(eq(bid.auctionId, data.auctionId))
      .orderBy(desc(bid.amount))
      .limit(50);

    const viewerId = context.session?.user.id ?? null;

    let walletBalance: number | null = null;
    let accountStatus: "PENDING_PAYMENT" | "ACTIVE" | "BLOCKED" | null = null;
    if (viewerId) {
      const [viewerWallet] = await db.select().from(wallet).where(eq(wallet.userId, viewerId)).limit(1);
      walletBalance = viewerWallet?.balance ?? 0;
      const [profile] = await db
        .select()
        .from(mnadaProfile)
        .where(eq(mnadaProfile.userId, viewerId))
        .limit(1);
      accountStatus = profile?.status ?? "PENDING_PAYMENT";
    }

    return {
      serverTime: Date.now(),
      auction: {
        id: row.id,
        lotNumber: row.lotNumber,
        title: row.title,
        description: row.description,
        condition: row.condition,
        image: row.image,
        icon: iconForLot(row.lotNumber),
        dbStatus: row.status,
        currentBid: row.currentBid,
        openingBid: row.openingBid,
        minimumIncrement: row.minimumIncrement,
        startsAt: row.startsAt.getTime(),
        endsAt: row.endsAt.getTime(),
      },
      bids: bidRows.map((b) => ({
        id: b.id,
        bidder: bidderLabel(b.userId, viewerId),
        amount: b.amount,
        placedAt: b.createdAt.getTime(),
        isCurrentUser: viewerId !== null && b.userId === viewerId,
      })),
      bidderCount: new Set(bidRows.map((b) => b.userId)).size,
      viewer: {
        signedIn: viewerId !== null,
        walletBalance,
        accountStatus,
      },
    };
  });

export type AuctionDetailPayload = NonNullable<Awaited<ReturnType<typeof getAuctionDetail>>>;
export type AuctionListPayload = Awaited<ReturnType<typeof listAuctions>>;
