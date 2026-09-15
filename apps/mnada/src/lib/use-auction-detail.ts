import { useEffect, useMemo, useRef, useState } from "react";

import { formatTZS, resolveAuctionStatus } from "./mnada";
import { useNow, useRemainingSeconds } from "./use-now";
import {
  suggestedBids,
  validateBid,
  type AuctionDetail,
  type BidEntry,
} from "./auction-detail";

export interface BidNotice {
  kind: "success" | "error";
  message: string;
}

/**
 * Auction detail state machine (local-state demo).
 *
 * Owns: derived end timestamp, live countdown, current bid, bid history,
 * wallet reservation, and bid submission. UI components stay presentational
 * so a future realtime subscription / bid API can plug in here without
 * touching them: it only needs to feed `bids`, `walletBalance`,
 * `bidderCount`, and `endsAt`.
 */
export function useAuctionDetail(detail: AuctionDetail) {
  const endsAt = useMemo(
    () => Date.now() + detail.initialRemainingSeconds * 1000,
    [detail],
  );
  const startsAt = endsAt - detail.durationSeconds * 1000;

  const [bids, setBids] = useState<BidEntry[]>(() => {
    const loadedAt = Date.now();
    return detail.bidSeeds.map((seed, index) => ({
      id: `seed-${index}`,
      bidder: seed.bidder,
      amount: seed.amount,
      placedAt: loadedAt - seed.minutesAgo * 60000,
      isCurrentUser: seed.isCurrentUser,
    }));
  });
  const [bidderCount, setBidderCount] = useState(detail.initialBidderCount);
  const [walletBalance, setWalletBalance] = useState(detail.initialWalletBalance);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<BidNotice | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // Refresh "Xm ago" labels without ticking every second.
  const now = useNow(20000);
  const remaining = useRemainingSeconds(endsAt);
  const isLive = remaining > 0;
  const status = useMemo(
    () => resolveAuctionStatus(detail.baseStatus, remaining),
    [detail.baseStatus, remaining],
  );

  const currentBid = bids[0]?.amount ?? detail.openingBid;
  const minimumBid = currentBid + detail.minimumIncrement;
  const suggestions = useMemo(
    () => suggestedBids(currentBid, detail.minimumIncrement),
    [currentBid, detail.minimumIncrement],
  );

  const placeBid = (amount: number | null) => {
    if (submitting) return;
    const error = validateBid(amount, {
      currentBid,
      minimumIncrement: detail.minimumIncrement,
      walletBalance,
      isLive,
    });
    if (error || amount === null) {
      setNotice({ kind: "error", message: error ?? "Enter a bid amount." });
      return;
    }
    const confirmed = amount;
    setSubmitting(true);
    setNotice(null);
    timer.current = setTimeout(() => {
      setBids((prev) => [
        {
          id: `bid-${Date.now()}`,
          bidder: "You",
          amount: confirmed,
          placedAt: Date.now(),
          isCurrentUser: true,
        },
        ...prev,
      ]);
      setBidderCount((c) => c + 1);
      // Demo reservation: the winning bid amount is held against the wallet.
      // A real backend would reconcile this (releasing the previous hold).
      setWalletBalance((w) => Math.max(0, w - confirmed));
      setSubmitting(false);
      setNotice({
        kind: "success",
        message: `Bid placed — ${formatTZS(confirmed)} reserved from your wallet.`,
      });
    }, 600);
  };

  return {
    endsAt,
    startsAt,
    bids,
    bidderCount,
    walletBalance,
    submitting,
    notice,
    now,
    remaining,
    isLive,
    status,
    currentBid,
    minimumBid,
    suggestions,
    placeBid,
    dismissNotice: () => setNotice(null),
  };
}

export type AuctionDetailState = ReturnType<typeof useAuctionDetail>;
