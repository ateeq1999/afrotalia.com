import { describe, expect, it } from "vitest";

import { DomainError } from "../errors";
import {
  ANTI_SNIPE_EXTENSION_SECONDS,
  ANTI_SNIPE_WINDOW_SECONDS,
  computeBidOutcome,
  extendEndsAt,
  isAuctionLive,
  isWithinAntiSnipeWindow,
  minimumNextBid,
  type AuctionSnapshot,
  type BidderSnapshot,
  type PlaceBidInput,
} from "./rules";

const NOW = new Date("2026-01-01T12:00:00.000Z");

function auction(overrides: Partial<AuctionSnapshot> = {}): AuctionSnapshot {
  return {
    status: "LIVE",
    startsAt: new Date(NOW.getTime() - 60 * 60 * 1000),
    endsAt: new Date(NOW.getTime() + 30 * 60 * 1000),
    openingBid: 800_000,
    currentBid: 1_800_000,
    minimumIncrement: 50_000,
    ...overrides,
  };
}

function bidder(overrides: Partial<BidderSnapshot> = {}): BidderSnapshot {
  return {
    userId: "user-bidder",
    accountStatus: "ACTIVE",
    walletBalance: 5_000_000,
    ...overrides,
  };
}

function input(overrides: Partial<PlaceBidInput> = {}): PlaceBidInput {
  return {
    now: NOW,
    auction: auction(),
    bidder: bidder(),
    currentLeader: { userId: "user-leader", amount: 1_800_000 },
    amount: 1_850_000,
    ...overrides,
  };
}

describe("minimumNextBid", () => {
  it("adds the increment to the current bid when bids exist", () => {
    expect(minimumNextBid({ currentBid: 1_800_000, openingBid: 800_000, minimumIncrement: 50_000 })).toBe(1_850_000);
  });

  it("falls back to the opening bid plus increment when no bids exist yet", () => {
    expect(minimumNextBid({ currentBid: 0, openingBid: 800_000, minimumIncrement: 50_000 })).toBe(850_000);
  });
});

describe("isAuctionLive", () => {
  it("is true only when status is LIVE and now falls within the window", () => {
    expect(isAuctionLive(auction(), NOW)).toBe(true);
  });

  it("is false before startsAt", () => {
    expect(isAuctionLive(auction(), new Date(NOW.getTime() - 2 * 60 * 60 * 1000))).toBe(false);
  });

  it("is false at or after endsAt", () => {
    const a = auction();
    expect(isAuctionLive(a, a.endsAt)).toBe(false);
  });

  it("is false when status is not LIVE even if within the time window", () => {
    expect(isAuctionLive(auction({ status: "SCHEDULED" }), NOW)).toBe(false);
  });
});

describe("anti-snipe window", () => {
  it("triggers inside the window", () => {
    const endsAt = new Date(NOW.getTime() + (ANTI_SNIPE_WINDOW_SECONDS - 1) * 1000);
    expect(isWithinAntiSnipeWindow(endsAt, NOW)).toBe(true);
  });

  it("does not trigger outside the window", () => {
    const endsAt = new Date(NOW.getTime() + (ANTI_SNIPE_WINDOW_SECONDS + 1) * 1000);
    expect(isWithinAntiSnipeWindow(endsAt, NOW)).toBe(false);
  });

  it("does not trigger once the auction has already ended", () => {
    const endsAt = new Date(NOW.getTime() - 1000);
    expect(isWithinAntiSnipeWindow(endsAt, NOW)).toBe(false);
  });

  it("extends endsAt by the configured extension length", () => {
    const endsAt = new Date(NOW.getTime() + 10 * 1000);
    expect(extendEndsAt(endsAt).getTime()).toBe(endsAt.getTime() + ANTI_SNIPE_EXTENSION_SECONDS * 1000);
  });
});

describe("computeBidOutcome", () => {
  it("accepts a valid bid above the current leader and releases their reservation", () => {
    const outcome = computeBidOutcome(input());
    expect(outcome.amount).toBe(1_850_000);
    expect(outcome.newCurrentBid).toBe(1_850_000);
    expect(outcome.releasesPreviousLeader).toBe(true);
    expect(outcome.previousLeaderId).toBe("user-leader");
    expect(outcome.extendedEndsAt).toBeNull();
  });

  it("accepts the first bid on a lot with no leader yet", () => {
    const outcome = computeBidOutcome(
      input({ currentLeader: null, auction: auction({ currentBid: 0 }), amount: 850_000 }),
    );
    expect(outcome.minimumNextBid).toBe(850_000);
    expect(outcome.releasesPreviousLeader).toBe(false);
    expect(outcome.previousLeaderId).toBeNull();
  });

  it("extends endsAt when the bid lands inside the anti-snipe window", () => {
    const endsAt = new Date(NOW.getTime() + 30 * 1000);
    const outcome = computeBidOutcome(input({ auction: auction({ endsAt }) }));
    expect(outcome.extendedEndsAt).toEqual(extendEndsAt(endsAt));
  });

  it("rejects a bid on an auction that is not live", () => {
    expect(() => computeBidOutcome(input({ auction: auction({ status: "SCHEDULED" }) }))).toThrowError(
      expect.objectContaining({ code: "AUCTION_NOT_LIVE" } satisfies Partial<DomainError>),
    );
  });

  it("rejects a bid from a non-active account", () => {
    expect(() =>
      computeBidOutcome(input({ bidder: bidder({ accountStatus: "PENDING_PAYMENT" }) })),
    ).toThrowError(expect.objectContaining({ code: "ACCOUNT_NOT_ACTIVE" }));
  });

  it("rejects a bid from the current leader against themselves", () => {
    expect(() =>
      computeBidOutcome(input({ currentLeader: { userId: "user-bidder", amount: 1_800_000 } })),
    ).toThrowError(expect.objectContaining({ code: "SELF_OUTBID" }));
  });

  it("rejects a bid below the minimum increment", () => {
    expect(() => computeBidOutcome(input({ amount: 1_820_000 }))).toThrowError(
      expect.objectContaining({ code: "BID_TOO_LOW" }),
    );
  });

  it("rejects a bid the wallet cannot cover", () => {
    expect(() =>
      computeBidOutcome(input({ bidder: bidder({ walletBalance: 1_000_000 }) })),
    ).toThrowError(expect.objectContaining({ code: "INSUFFICIENT_FUNDS" }));
  });
});
