/** Non-payment strikes before a Mnada profile is blocked. */
export const NON_PAYMENT_VIOLATION_BLOCK_THRESHOLD = 2;

export interface HighestBid {
  userId: string;
  amount: number;
}

export interface SettlementDecisionInput {
  /** Null = no reserve; any bid meets it. */
  reservePrice: number | null;
  highestBid: HighestBid | null;
}

export type SettlementDecision =
  | { outcome: "SETTLED"; winnerId: string; winAmount: number }
  | { outcome: "CLOSED"; reason: "NO_BIDS" | "RESERVE_NOT_MET" };

/** Pure decision: does a closed lot sell (reserve met) or go unsold? */
export function decideAuctionSettlement(input: SettlementDecisionInput): SettlementDecision {
  if (!input.highestBid) return { outcome: "CLOSED", reason: "NO_BIDS" };
  const reserveMet = input.reservePrice === null || input.highestBid.amount >= input.reservePrice;
  if (!reserveMet) return { outcome: "CLOSED", reason: "RESERVE_NOT_MET" };
  return { outcome: "SETTLED", winnerId: input.highestBid.userId, winAmount: input.highestBid.amount };
}

export function computePaymentDueAt(now: Date, paymentWindowHours: number): Date {
  return new Date(now.getTime() + paymentWindowHours * 60 * 60 * 1000);
}

/** True once the violation count after this strike reaches the block threshold. */
export function isViolationBlocking(violationCountAfterIncrement: number): boolean {
  return violationCountAfterIncrement >= NON_PAYMENT_VIOLATION_BLOCK_THRESHOLD;
}
