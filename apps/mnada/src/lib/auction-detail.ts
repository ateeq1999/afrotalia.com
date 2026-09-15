import {
  auctions,
  formatTZS,
  type AuctionIconKind,
  type AuctionStatus,
} from "./mnada";

/**
 * Local/mock domain layer for the auction detail page.
 *
 * There is currently no auction / wallet / bid API in the Mnada app
 * (only auth), so this module owns the detail model, bid history seeds,
 * and pure bidding rules. It is deliberately UI-free so a future
 * WebSocket/SSE subscription or server function can replace the seeds
 * without touching components.
 */

export interface BidSeed {
  bidder: string;
  amount: number;
  /** Minutes before page load that the bid was placed. */
  minutesAgo: number;
  isCurrentUser?: boolean;
}

export interface BidEntry {
  id: string;
  bidder: string;
  amount: number;
  placedAt: number;
  isCurrentUser?: boolean;
}

export interface AuctionDetail {
  id: string;
  lotNumber: number;
  title: string;
  description: string;
  /** e.g. "USED · WORKING" */
  condition: string;
  image?: string;
  icon: AuctionIconKind;
  baseStatus: Exclude<AuctionStatus, "scheduled" | "ended">;
  openingBid: number;
  minimumIncrement: number;
  initialBidderCount: number;
  initialWalletBalance: number;
  /** Seconds until close at first render; `endsAt` is derived from this. */
  initialRemainingSeconds: number;
  /** Auction length in seconds; `startsAt` = endsAt - duration. */
  durationSeconds: number;
  bidSeeds: BidSeed[];
}

const CANON_DETAIL: AuctionDetail = {
  id: "canon-eos-r6",
  lotNumber: 42,
  title: "Canon EOS R6 body",
  description: "Shutter count 12k, two batteries, original strap.",
  condition: "USED · WORKING",
  icon: "camera",
  baseStatus: "live",
  openingBid: 800000,
  minimumIncrement: 50000,
  initialBidderCount: 21,
  initialWalletBalance: 12000000,
  initialRemainingSeconds: 30 * 60 + 6,
  durationSeconds: 102 * 60,
  bidSeeds: [
    { bidder: "Bidder 6070", amount: 1870000, minutesAgo: 0 },
    { bidder: "You", amount: 1820000, minutesAgo: 0, isCurrentUser: true },
    { bidder: "Bidder 4471", amount: 1770000, minutesAgo: 2 },
    { bidder: "Bidder 2290", amount: 1720000, minutesAgo: 8 },
    { bidder: "Bidder 8812", amount: 1670000, minutesAgo: 15 },
  ],
};

const LOT_NUMBERS: Record<string, number> = {
  "rolex-submariner": 18,
  "canon-eos-r6": 42,
  "lamu-door-panel": 27,
  "seiko-5-flash-lot": 9,
  "maasai-beadwork": 33,
};

function incrementFor(price: number): number {
  if (price >= 1000000) return 50000;
  if (price >= 300000) return 20000;
  return 10000;
}

function detailFromListing(index: number): AuctionDetail {
  const listing = auctions[index];
  const inc = incrementFor(listing.currentBid);
  const top = listing.currentBid;
  const bidderIds = [6070, 4471, 2290, 8812, 5104];
  const ago = [0, 4, 9, 17, 26];
  return {
    id: listing.id,
    lotNumber: LOT_NUMBERS[listing.id] ?? 10 + index,
    title: listing.title,
    description: listing.description,
    condition: "USED · WORKING",
    image: listing.image,
    icon: listing.icon,
    baseStatus: listing.status,
    openingBid: top - 8 * inc,
    minimumIncrement: inc,
    initialBidderCount: 9 + ((LOT_NUMBERS[listing.id] ?? index) % 14),
    initialWalletBalance: 12000000,
    initialRemainingSeconds: listing.initialRemainingSeconds,
    durationSeconds: listing.initialRemainingSeconds + 5400,
    bidSeeds: [0, 1, 2, 3, 4].map((step) => ({
      bidder: `Bidder ${bidderIds[(index + step) % bidderIds.length]}`,
      amount: top - step * inc,
      minutesAgo: ago[step] ?? step * 5,
    })),
  };
}

/** Look up detail by slug id or lot number (e.g. "42"). */
export function getAuctionDetail(auctionId: string): AuctionDetail | null {
  const key = auctionId.trim().toLowerCase();
  if (key === "canon-eos-r6" || key === "42") return CANON_DETAIL;
  const index = auctions.findIndex(
    (a) =>
      a.id === key || String(LOT_NUMBERS[a.id] ?? "") === key,
  );
  if (index === -1) return null;
  if (auctions[index].id === "canon-eos-r6") return CANON_DETAIL;
  return detailFromListing(index);
}

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

export interface BidValidation {
  currentBid: number;
  minimumIncrement: number;
  walletBalance: number;
  isLive: boolean;
}

/** Pure bid rules; returns an error message or null when valid. */
export function validateBid(amount: number | null, rules: BidValidation): string | null {
  if (!rules.isLive) return "This auction has closed.";
  if (amount === null || amount <= 0) return "Enter a bid amount.";
  const minimum = rules.currentBid + rules.minimumIncrement;
  if (amount < minimum) return `Minimum bid is ${formatTZS(minimum)}.`;
  if (amount > rules.walletBalance)
    return "Insufficient wallet balance for this bid.";
  return null;
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
