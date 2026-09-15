import { describe, expect, it } from "vitest";

import {
  computePaymentDueAt,
  decideAuctionSettlement,
  isViolationBlocking,
  NON_PAYMENT_VIOLATION_BLOCK_THRESHOLD,
} from "./settlement-rules";

describe("decideAuctionSettlement", () => {
  it("closes a lot with no bids", () => {
    const decision = decideAuctionSettlement({ reservePrice: null, highestBid: null });
    expect(decision).toEqual({ outcome: "CLOSED", reason: "NO_BIDS" });
  });

  it("settles when there's no reserve and any bid exists", () => {
    const decision = decideAuctionSettlement({
      reservePrice: null,
      highestBid: { userId: "u1", amount: 100_000 },
    });
    expect(decision).toEqual({ outcome: "SETTLED", winnerId: "u1", winAmount: 100_000 });
  });

  it("settles when the highest bid meets the reserve exactly", () => {
    const decision = decideAuctionSettlement({
      reservePrice: 500_000,
      highestBid: { userId: "u1", amount: 500_000 },
    });
    expect(decision).toEqual({ outcome: "SETTLED", winnerId: "u1", winAmount: 500_000 });
  });

  it("closes as reserve-not-met when the highest bid falls short", () => {
    const decision = decideAuctionSettlement({
      reservePrice: 500_000,
      highestBid: { userId: "u1", amount: 499_999 },
    });
    expect(decision).toEqual({ outcome: "CLOSED", reason: "RESERVE_NOT_MET" });
  });
});

describe("computePaymentDueAt", () => {
  it("adds the payment window in hours to now", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    expect(computePaymentDueAt(now, 24).toISOString()).toBe("2026-01-02T00:00:00.000Z");
  });
});

describe("isViolationBlocking", () => {
  it("is false below the threshold", () => {
    expect(isViolationBlocking(NON_PAYMENT_VIOLATION_BLOCK_THRESHOLD - 1)).toBe(false);
  });

  it("is true at and beyond the threshold", () => {
    expect(isViolationBlocking(NON_PAYMENT_VIOLATION_BLOCK_THRESHOLD)).toBe(true);
    expect(isViolationBlocking(NON_PAYMENT_VIOLATION_BLOCK_THRESHOLD + 1)).toBe(true);
  });
});
