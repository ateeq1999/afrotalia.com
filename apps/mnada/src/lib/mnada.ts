export type AuctionStatus = "live" | "closing" | "scheduled" | "ended";

export type AuctionIconKind =
  | "watch"
  | "camera"
  | "door"
  | "zap"
  | "gem"
  | "laptop"
  | "generator";

export interface Auction {
  id: string;
  title: string;
  description: string;
  image?: string;
  icon: AuctionIconKind;
  status: Exclude<AuctionStatus, "scheduled" | "ended">;
  currentBid: number;
  /** Seconds remaining at first render. `endsAt` is derived from this. */
  initialRemainingSeconds: number;
}

export interface UpcomingAuction {
  id: string;
  title: string;
  description: string;
  image?: string;
  icon: AuctionIconKind;
  openingBid: number;
  /** Seconds until opening at first render. `opensAt` is derived from this. */
  initialOpensInSeconds: number;
}

export const auctions: Auction[] = [
  {
    id: "rolex-submariner",
    title: "Rolex Submariner",
    description: "Pre-owned luxury automatic, serviced 2025, box and papers.",
    icon: "watch",
    status: "live",
    currentBid: 1450000,
    initialRemainingSeconds: 1 * 3600 + 24 * 60 + 46,
  },
  {
    id: "canon-eos-r6",
    title: "Canon EOS R6 body",
    description: "Shutter count 12k, two batteries, original strap.",
    icon: "camera",
    status: "live",
    currentBid: 1170000,
    initialRemainingSeconds: 41 * 60 + 46,
  },
  {
    id: "lamu-door-panel",
    title: "Lamu carved door panel",
    description: "Nineteenth-century coastal woodwork, reclaimed and stabilised.",
    icon: "door",
    status: "closing",
    currentBid: 3500000,
    initialRemainingSeconds: 10 * 60 + 46,
  },
  {
    id: "seiko-5-flash-lot",
    title: "Seiko 5 — flash lot",
    description: "Two-minute flash close. Bid to see the win and payment flow.",
    icon: "zap",
    status: "closing",
    currentBid: 120000,
    initialRemainingSeconds: 1 * 60 + 45,
  },
  {
    id: "maasai-beadwork",
    title: "Maasai beadwork collection",
    description: "Twelve pieces, documented makers, Arusha region.",
    icon: "gem",
    status: "live",
    currentBid: 360000,
    initialRemainingSeconds: 2 * 3600 + 59 * 60 + 45,
  },
];

export const upcomingAuctions: UpcomingAuction[] = [
  {
    id: "macbook-pro-14-m3",
    title: 'MacBook Pro 14" M3',
    description: "Sealed retail unit, regional warranty included.",
    icon: "laptop",
    openingBid: 2500000,
    initialOpensInSeconds: 1 * 86400 + 23 * 3600 + 59 * 60,
  },
  {
    id: "yamaha-5kva-generator",
    title: "Yamaha 5kVA generator",
    description: "Spares or repair — engine turns, alternator faulty.",
    icon: "generator",
    openingBid: 300000,
    initialOpensInSeconds: 1 * 86400 + 1 * 3600 + 59 * 60,
  },
];

export function formatTZS(amount: number): string {
  return `TZS ${amount.toLocaleString("en-US")}`;
}

export function formatHMS(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function formatOpensIn(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const d = Math.floor(clamped / 86400);
  const h = Math.floor((clamped % 86400) / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  return `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
}

/** Derive display status: once the timer hits zero the lot is ended. */
export function resolveAuctionStatus(
  base: Auction["status"],
  remainingSeconds: number,
): AuctionStatus {
  if (remainingSeconds <= 0) return "ended";
  return base;
}
