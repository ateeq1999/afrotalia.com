export type AuctionStatus = "live" | "closing" | "scheduled" | "ended";
export type AuctionDbStatus = "SCHEDULED" | "LIVE" | "CLOSED";

export type AuctionIconKind =
  | "watch"
  | "camera"
  | "door"
  | "zap"
  | "gem"
  | "laptop"
  | "generator";

const ICON_CYCLE: AuctionIconKind[] = [
  "watch",
  "camera",
  "door",
  "zap",
  "gem",
  "laptop",
  "generator",
];

/** Deterministic decorative icon — the schema carries no category yet. */
export function iconForLot(lotNumber: number): AuctionIconKind {
  return ICON_CYCLE[lotNumber % ICON_CYCLE.length] ?? "gem";
}

export interface AuctionListItem {
  id: string;
  lotNumber: number;
  title: string;
  description: string;
  image?: string | null;
  icon: AuctionIconKind;
  dbStatus: AuctionDbStatus;
  currentBid: number;
  openingBid: number;
  minimumIncrement: number;
  /** Epoch ms, server time. */
  startsAt: number;
  /** Epoch ms, server time. */
  endsAt: number;
  bidderCount: number;
}

/** Auctions closing within this many seconds render as "closing" (amber urgency). */
export const CLOSING_SOON_SECONDS = 15 * 60;

/**
 * Derived display status — never stored. `remainingSeconds` must be computed
 * from server-authoritative time (see `useServerNow`), not the client clock.
 */
export function resolveAuctionStatus(
  dbStatus: AuctionDbStatus,
  remainingSeconds: number,
): AuctionStatus {
  if (dbStatus === "SCHEDULED") return "scheduled";
  if (dbStatus === "CLOSED" || remainingSeconds <= 0) return "ended";
  return remainingSeconds <= CLOSING_SOON_SECONDS ? "closing" : "live";
}

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
