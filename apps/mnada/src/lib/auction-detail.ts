import { computeBidOutcome, DomainError } from "@afrotalia/core";

import type { AuctionDetailPayload } from "@/functions/auctions";

export type BidEntry = AuctionDetailPayload["bids"][number];
export type AuctionSummary = AuctionDetailPayload["auction"];
export type Viewer = AuctionDetailPayload["viewer"];

/** [min+1 increment, min+2, min+4] — e.g. 1.92M / 1.97M / 2.07M. */
export function suggestedBids(currentBid: number, minimumIncrement: number): number[] {
  return [
    currentBid + minimumIncrement,
    currentBid + minimumIncrement * 2,
    currentBid + minimumIncrement * 4,
  ];
}

/** Strip everything but digits: "1,920,000" -> 1920000. Null when empty. */
export function parseBidInput(raw: string): number | null {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const value = Number(digits);
  return Number.isSafeInteger(value) ? value : null;
}

export function formatBidInput(value: number): string {
  return value.toLocaleString("en-US");
}

/** "0m ago", "2m ago", … */
export function formatBidAgo(placedAt: number, now: number): string {
  const minutes = Math.max(0, Math.floor((now - placedAt) / 60000));
  return `${minutes}m ago`;
}

/** "15 Sept, 18:25" */
export function formatAuctionDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(timestamp));
}

export interface ClientBidValidationInput {
  amount: number | null;
  now: number;
  auction: AuctionSummary;
  viewer: Viewer;
  viewerId: string | null;
  currentLeader: { userId: string; amount: number } | null;
}

/**
 * UX-only dry run of the same rule the server enforces (see
 * `computeBidOutcome` in `@afrotalia/core`). The server re-validates inside
 * its own transaction — this only lets the UI fail fast with the same
 * message before a round trip.
 */
export function validateBidClientSide(input: ClientBidValidationInput): string | null {
  if (!input.viewer.signedIn) return "Sign in to place a bid.";
  if (input.amount === null || input.amount <= 0) return "Enter a bid amount.";

  try {
    computeBidOutcome({
      now: new Date(input.now),
      amount: input.amount,
      auction: {
        status: input.auction.dbStatus,
        startsAt: new Date(input.auction.startsAt),
        endsAt: new Date(input.auction.endsAt),
        openingBid: input.auction.openingBid,
        currentBid: input.auction.currentBid,
        minimumIncrement: input.auction.minimumIncrement,
      },
      bidder: {
        userId: input.viewerId ?? "",
        accountStatus: input.viewer.accountStatus ?? "PENDING_PAYMENT",
        walletBalance: input.viewer.walletBalance ?? 0,
      },
      currentLeader: input.currentLeader,
    });
    return null;
  } catch (err) {
    if (err instanceof DomainError) return err.message;
    throw err;
  }
}
