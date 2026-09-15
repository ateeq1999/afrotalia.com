import type { Database } from "@afrotalia/db";
import { auction, bid, wallet, walletTransaction } from "@afrotalia/db/schema/mnada";
import { desc, eq } from "drizzle-orm";

import { DomainError } from "../errors";
import { computeBidOutcome, type BidOutcome } from "./rules";

export interface PlaceBidParams {
  auctionId: string;
  userId: string;
  amount: number;
  accountStatus: "PENDING_PAYMENT" | "ACTIVE" | "BLOCKED";
  now?: Date;
}

export interface PlaceBidResult {
  bidId: string;
  outcome: BidOutcome;
  /** The auction's resolved close time after this bid (extended or not). */
  endsAt: Date;
}

/**
 * Places a bid inside a single serializable transaction: locks the auction
 * row, re-reads the current leader, validates every rule via
 * `computeBidOutcome`, then applies the reserve/release ledger, inserts the
 * bid, and (on an anti-snipe extension) pushes back `endsAt`.
 */
export async function placeBid(db: Database, params: PlaceBidParams): Promise<PlaceBidResult> {
  const now = params.now ?? new Date();

  return db.transaction(async (tx) => {
    const [auctionRow] = await tx
      .select()
      .from(auction)
      .where(eq(auction.id, params.auctionId))
      .for("update");

    if (!auctionRow) {
      throw new DomainError("AUCTION_NOT_LIVE", "This auction does not exist.");
    }

    const [leaderBid] = await tx
      .select({ userId: bid.userId, amount: bid.amount })
      .from(bid)
      .where(eq(bid.auctionId, params.auctionId))
      .orderBy(desc(bid.amount))
      .limit(1);

    const [bidderWallet] = await tx
      .select()
      .from(wallet)
      .where(eq(wallet.userId, params.userId))
      .for("update");

    if (!bidderWallet) {
      throw new DomainError("INSUFFICIENT_FUNDS", "No wallet found for this account.");
    }

    const outcome = computeBidOutcome({
      now,
      amount: params.amount,
      auction: {
        status: auctionRow.status,
        startsAt: auctionRow.startsAt,
        endsAt: auctionRow.endsAt,
        openingBid: auctionRow.openingBid,
        currentBid: auctionRow.currentBid,
        minimumIncrement: auctionRow.minimumIncrement,
      },
      bidder: {
        userId: params.userId,
        accountStatus: params.accountStatus,
        walletBalance: bidderWallet.balance,
      },
      currentLeader: leaderBid ? { userId: leaderBid.userId, amount: leaderBid.amount } : null,
    });

    // Reserve the new bid amount from the bidder's wallet.
    const newBalance = bidderWallet.balance - outcome.amount;
    await tx.update(wallet).set({ balance: newBalance }).where(eq(wallet.id, bidderWallet.id));
    await tx.insert(walletTransaction).values({
      walletId: bidderWallet.id,
      kind: "BID_RESERVATION",
      amount: -outcome.amount,
      balanceAfter: newBalance,
      reference: params.auctionId,
    });

    // Release the previous leader's reservation, if any.
    if (outcome.releasesPreviousLeader && outcome.previousLeaderId && leaderBid) {
      const [prevWallet] = await tx
        .select()
        .from(wallet)
        .where(eq(wallet.userId, outcome.previousLeaderId))
        .for("update");
      if (prevWallet) {
        const releasedBalance = prevWallet.balance + leaderBid.amount;
        await tx.update(wallet).set({ balance: releasedBalance }).where(eq(wallet.id, prevWallet.id));
        await tx.insert(walletTransaction).values({
          walletId: prevWallet.id,
          kind: "BID_RELEASE",
          amount: leaderBid.amount,
          balanceAfter: releasedBalance,
          reference: params.auctionId,
        });
      }
    }

    const [insertedBid] = await tx
      .insert(bid)
      .values({
        auctionId: params.auctionId,
        userId: params.userId,
        amount: outcome.amount,
      })
      .returning({ id: bid.id });

    const resolvedEndsAt = outcome.extendedEndsAt ?? auctionRow.endsAt;
    await tx
      .update(auction)
      .set({
        currentBid: outcome.newCurrentBid,
        endsAt: resolvedEndsAt,
      })
      .where(eq(auction.id, params.auctionId));

    return { bidId: insertedBid!.id, outcome, endsAt: resolvedEndsAt };
  });
}
