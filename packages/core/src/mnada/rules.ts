import { DomainError } from "../errors";

/** A bid placed inside this many seconds of close extends the auction. */
export const ANTI_SNIPE_WINDOW_SECONDS = 60;
/** Anti-snipe extension length. */
export const ANTI_SNIPE_EXTENSION_SECONDS = 60;

export type MnadaAccountStatus = "PENDING_PAYMENT" | "ACTIVE" | "BLOCKED";
export type AuctionStatus = "SCHEDULED" | "LIVE" | "CLOSED";

export interface AuctionSnapshot {
  status: AuctionStatus;
  startsAt: Date;
  endsAt: Date;
  openingBid: number;
  /** 0 when no bid has been placed yet. */
  currentBid: number;
  minimumIncrement: number;
}

export interface BidderSnapshot {
  userId: string;
  accountStatus: MnadaAccountStatus;
  /** Wallet balance already nets out active reservations. */
  walletBalance: number;
}

export interface LeaderSnapshot {
  userId: string;
  amount: number;
}

export interface PlaceBidInput {
  now: Date;
  auction: AuctionSnapshot;
  bidder: BidderSnapshot;
  /** The current highest bid on the lot, or null if none has been placed. */
  currentLeader: LeaderSnapshot | null;
  amount: number;
}

export interface BidOutcome {
  amount: number;
  minimumNextBid: number;
  newCurrentBid: number;
  /** Set when the bid falls inside the anti-snipe window; null otherwise. */
  extendedEndsAt: Date | null;
  releasesPreviousLeader: boolean;
  previousLeaderId: string | null;
}

/** Lowest amount that would be accepted right now. */
export function minimumNextBid(auction: Pick<AuctionSnapshot, "currentBid" | "openingBid" | "minimumIncrement">): number {
  const baseline = auction.currentBid > 0 ? auction.currentBid : auction.openingBid;
  return baseline + auction.minimumIncrement;
}

export function isAuctionLive(auction: Pick<AuctionSnapshot, "status" | "startsAt" | "endsAt">, now: Date): boolean {
  return auction.status === "LIVE" && now >= auction.startsAt && now < auction.endsAt;
}

/** True when `now` falls within the anti-snipe window before `endsAt`. */
export function isWithinAntiSnipeWindow(endsAt: Date, now: Date): boolean {
  const remainingMs = endsAt.getTime() - now.getTime();
  return remainingMs > 0 && remainingMs <= ANTI_SNIPE_WINDOW_SECONDS * 1000;
}

export function extendEndsAt(endsAt: Date): Date {
  return new Date(endsAt.getTime() + ANTI_SNIPE_EXTENSION_SECONDS * 1000);
}

/**
 * Pure decision core for placing a bid: validates every domain rule and
 * returns the resulting state transition. Throws `DomainError` on any
 * violation. Callers apply the transition (bid insert, ledger rows, auction
 * update) inside a locked DB transaction — this function touches no I/O so
 * every rule is unit-testable in isolation.
 */
export function computeBidOutcome(input: PlaceBidInput): BidOutcome {
  const { now, auction, bidder, currentLeader, amount } = input;

  if (!isAuctionLive(auction, now)) {
    throw new DomainError("AUCTION_NOT_LIVE");
  }
  if (bidder.accountStatus !== "ACTIVE") {
    throw new DomainError("ACCOUNT_NOT_ACTIVE");
  }
  if (currentLeader && currentLeader.userId === bidder.userId) {
    throw new DomainError("SELF_OUTBID");
  }

  const minimum = minimumNextBid(auction);
  if (amount < minimum) {
    throw new DomainError("BID_TOO_LOW");
  }
  if (amount > bidder.walletBalance) {
    throw new DomainError("INSUFFICIENT_FUNDS");
  }

  return {
    amount,
    minimumNextBid: minimum,
    newCurrentBid: amount,
    extendedEndsAt: isWithinAntiSnipeWindow(auction.endsAt, now) ? extendEndsAt(auction.endsAt) : null,
    releasesPreviousLeader: currentLeader !== null,
    previousLeaderId: currentLeader?.userId ?? null,
  };
}
