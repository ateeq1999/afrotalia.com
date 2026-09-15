/**
 * Local/mock data layer for the My Bids page.
 *
 * No bid API exists in the Mnada app yet, so this module owns the
 * "bids by current user" model and the leading/outbid derivation.
 * The UI only depends on `fetchMyBids()` — swap it for a server
 * function / query (and push live updates through the same `MyBid`
 * shape) without touching components.
 */

export type BidStatus = "leading" | "outbid";

export interface MyBid {
  auctionId: string;
  title: string;
  userBid: number;
  currentBid: number;
}

/** Derived, never stored: user leads when their bid is the highest. */
export function getBidStatus(bid: Pick<MyBid, "userBid" | "currentBid">): BidStatus {
  return bid.userBid >= bid.currentBid ? "leading" : "outbid";
}

const SEED_BIDS: MyBid[] = [
  {
    auctionId: "canon-eos-r6",
    title: "Canon EOS R6 body",
    userBid: 2020000,
    currentBid: 2220000,
  },
  {
    auctionId: "maasai-beadwork",
    title: "Maasai beadwork collection",
    userBid: 1810000,
    currentBid: 1810000,
  },
];

/** Simulated latency so loading states are exercisable. */
const FETCH_DELAY_MS = 450;

export function fetchMyBids(): Promise<MyBid[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(SEED_BIDS.map((b) => ({ ...b }))), FETCH_DELAY_MS);
  });
}
