import { useCallback, useEffect, useRef, useState } from "react";

import { getAuctionDetail, type AuctionDetailPayload } from "@/functions/auctions";
import { placeBidFn } from "@/functions/bids";

import { formatTZS, resolveAuctionStatus } from "./mnada";
import { parseBidInput, suggestedBids, validateBidClientSide } from "./auction-detail";
import { useNow } from "./use-now";

export interface BidNotice {
  kind: "success" | "error";
  message: string;
}

const POLL_INTERVAL_MS = 4000;

/**
 * Owns the auction detail page's live state. `endsAt` and every bid amount
 * come from the server; the client only supplies a clock offset
 * (`serverTime - Date.now()` measured at load/refetch) so the countdown
 * stays correct even when the visitor's clock is wrong — the client never
 * decides whether the auction is still open.
 *
 * Polls for fresh state every few seconds. A future SSE/WebSocket channel
 * can replace the poll without touching the return shape or the components
 * that consume it.
 */
export function useAuctionDetail(auctionId: string, initial: AuctionDetailPayload) {
  const [payload, setPayload] = useState(initial);
  const [clockOffsetMs, setClockOffsetMs] = useState(() => initial.serverTime - Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<BidNotice | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    const fresh = await getAuctionDetail({ data: { auctionId } });
    if (fresh && mounted.current) {
      setPayload(fresh);
      setClockOffsetMs(fresh.serverTime - Date.now());
    }
  }, [auctionId]);

  useEffect(() => {
    const id = window.setInterval(() => void refetch(), POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [refetch]);

  const tick = useNow(1000);
  const now = tick + clockOffsetMs;

  const { auction, bids, viewer } = payload;
  const remaining = Math.max(0, Math.ceil((auction.endsAt - now) / 1000));
  const isLive = remaining > 0 && auction.dbStatus === "LIVE";
  const status = resolveAuctionStatus(auction.dbStatus, remaining);

  const minimumBid = auction.currentBid > 0 ? auction.currentBid : auction.openingBid;
  const nextMinimum = minimumBid + auction.minimumIncrement;
  const suggestions = suggestedBids(
    auction.currentBid > 0 ? auction.currentBid : auction.openingBid - auction.minimumIncrement,
    auction.minimumIncrement,
  );

  const leaderBid = bids[0] ?? null;

  const placeBid = async (amount: number | null) => {
    if (submitting) return;

    const error = validateBidClientSide({
      amount,
      now,
      auction,
      viewer,
      viewerId: leaderBid?.isCurrentUser ? "self" : null,
      currentLeader: leaderBid
        ? { userId: leaderBid.isCurrentUser ? "self" : "other", amount: leaderBid.amount }
        : null,
    });
    if (error || amount === null) {
      setNotice({ kind: "error", message: error ?? "Enter a bid amount." });
      return;
    }

    setSubmitting(true);
    setNotice(null);
    try {
      const result = await placeBidFn({ data: { auctionId, amount } });
      if (!result.ok) {
        setNotice({ kind: "error", message: result.message });
        return;
      }
      setNotice({
        kind: "success",
        message: `Bid placed — ${formatTZS(amount)} reserved from your wallet.`,
      });
      await refetch();
    } catch {
      setNotice({ kind: "error", message: "Something went wrong placing your bid. Try again." });
    } finally {
      if (mounted.current) setSubmitting(false);
    }
  };

  return {
    auction,
    bids,
    bidderCount: payload.bidderCount,
    viewer,
    now,
    endsAt: auction.endsAt,
    startsAt: auction.startsAt,
    remaining,
    isLive,
    status,
    currentBid: auction.currentBid > 0 ? auction.currentBid : auction.openingBid,
    minimumBid: nextMinimum,
    suggestions,
    submitting,
    notice,
    placeBid,
    dismissNotice: () => setNotice(null),
    parseBidInput,
  };
}

export type AuctionDetailState = ReturnType<typeof useAuctionDetail>;
