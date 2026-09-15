import type { MyBid } from "@/functions/bids";

export type { MyBid };

export type BidStatus = "leading" | "outbid";

/** Derived, never stored: user leads when their bid is the highest. */
export function getBidStatus(bid: Pick<MyBid, "userBid" | "currentBid">): BidStatus {
  return bid.userBid >= bid.currentBid ? "leading" : "outbid";
}
