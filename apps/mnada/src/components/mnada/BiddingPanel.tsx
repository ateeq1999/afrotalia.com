import { useEffect, useState } from "react";

import { cn } from "@afrotalia/ui/lib/utils";

import { formatBidInput, parseBidInput, type AuctionSummary } from "@/lib/auction-detail";
import { formatTZS } from "@/lib/mnada";
import type { BidNotice } from "@/lib/use-auction-detail";

import BidInput from "./BidInput";
import CountdownTimer from "./CountdownTimer";
import SuggestedBidButtons from "./SuggestedBidButtons";
import WalletBalance from "./WalletBalance";

interface BiddingPanelProps {
  detail: AuctionSummary;
  currentBid: number;
  minimumBid: number;
  suggestions: number[];
  bidderCount: number;
  endsAt: number;
  isLive: boolean;
  walletBalance: number;
  submitting: boolean;
  notice: BidNotice | null;
  onPlaceBid: (amount: number | null) => void;
}

export default function BiddingPanel({
  detail,
  currentBid,
  minimumBid,
  suggestions,
  bidderCount,
  endsAt,
  isLive,
  walletBalance,
  submitting,
  notice,
  onPlaceBid,
}: BiddingPanelProps) {
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  // Fresh input after a successful bid; suggestions have moved on.
  useEffect(() => {
    if (notice?.kind === "success") {
      setInput("");
      setSelected(null);
    }
  }, [notice]);

  const handleSelect = (amount: number) => {
    setSelected(amount);
    setInput(formatBidInput(amount));
  };

  const handleInputChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "").slice(0, 12);
    if (!digits) {
      setInput("");
      setSelected(null);
      return;
    }
    const amount = Number(digits);
    setInput(formatBidInput(amount));
    setSelected(suggestions.includes(amount) ? amount : null);
  };

  const parsed = parseBidInput(input);
  const validationError = !isLive
    ? "This auction has closed."
    : parsed === null || parsed <= 0
      ? "Enter a bid amount."
      : parsed < minimumBid
        ? `Minimum bid is ${formatTZS(minimumBid)}.`
        : parsed > walletBalance
          ? "Insufficient wallet balance for this bid."
          : null;
  const showInvalid = input !== "" && validationError !== null;
  const disabled = !isLive || submitting || validationError !== null;

  return (
    <section
      aria-label="Bidding panel"
      className="rounded-xl border border-white/[0.08] bg-[#111113] p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#8F9095]">
            Current bid
          </p>
          <p
            className="mt-2 truncate text-[32px] font-bold tabular-nums leading-none text-[#FFBF19] sm:text-[34px]"
            aria-live="off"
          >
            {formatTZS(currentBid)}
          </p>
          <p className="mt-2.5 text-[12px] tabular-nums text-[#8F9095]">
            Opened at {formatTZS(detail.openingBid)} · {bidderCount} bidders
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#8F9095]">
            Ends in
          </p>
          <CountdownTimer
            endsAt={endsAt}
            suffix=""
            tone="bright"
            className="mt-2 text-[32px] font-bold leading-none sm:text-[34px]"
          />
          <p className="mt-2.5 text-[12px] text-[#8F9095]">Server time · EAT</p>
        </div>
      </div>

      <hr className="my-5 border-white/[0.08]" />

      <WalletBalance balance={walletBalance} />

      <div className="mt-4 space-y-3">
        <SuggestedBidButtons
          suggestions={suggestions}
          selected={selected}
          onSelect={handleSelect}
          disabled={!isLive || submitting}
        />

        <BidInput
          id="custom-bid"
          value={input}
          placeholder={`${formatTZS(minimumBid)} or more`}
          onChange={handleInputChange}
          disabled={!isLive || submitting}
          invalid={showInvalid}
        />

        <button
          type="button"
          disabled={disabled}
          onClick={() => onPlaceBid(parsed)}
          className={cn(
            "h-[50px] w-full rounded-lg text-[15px] font-bold transition-all",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFBF19]",
            disabled
              ? "cursor-not-allowed bg-[#2A2A2E] text-[#6E6E73]"
              : "bg-[#FFBF19] text-black hover:bg-[#FFC93A] active:translate-y-px active:bg-[#F0AD00]",
          )}
        >
          {submitting ? "Placing bid…" : isLive ? "Place bid" : "Auction closed"}
        </button>

        <p className="text-[12px] leading-relaxed text-[#8F9095]">
          Minimum increment {formatTZS(detail.minimumIncrement)}. Bids reserve
          funds in your wallet and cannot be withdrawn.
        </p>

        <div aria-live="polite" role="status" className="min-h-[20px]">
          {notice ? (
            <p
              className={cn(
                "text-[13px] font-medium leading-snug",
                notice.kind === "success" ? "text-[#00D99A]" : "text-[#FF5C5C]",
              )}
            >
              {notice.message}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
