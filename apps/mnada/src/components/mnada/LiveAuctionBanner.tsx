import { useMemo } from "react";
import { Link } from "@tanstack/react-router";

import { formatHMS, formatTZS } from "@/lib/mnada";
import { useRemainingSeconds } from "@/lib/use-now";

interface LiveAuctionBannerProps {
  endsAt: number;
  currentBid: number;
}

export default function LiveAuctionBanner({ endsAt, currentBid }: LiveAuctionBannerProps) {
  const remaining = useRemainingSeconds(endsAt);
  const closingIn = useMemo(() => formatHMS(remaining), [remaining]);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-[#141415] px-[18px] py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="min-w-0 text-[13px] leading-relaxed">
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#FFBF19] align-middle" aria-hidden />
        <span className="font-bold uppercase tracking-[0.8px] text-[#FFBF19]">
          5 auctions live now
        </span>{" "}
        <span className="font-semibold text-[#F5F5F5]">Seiko 5 — flash lot</span>{" "}
        <span className="text-[#929296]">
          — current bid {formatTZS(currentBid)}, closing in{" "}
          <span className="tabular-nums text-[#F5F5F5]">{closingIn}</span>.
        </span>
      </p>
      <Link
        to="/auctions/$auctionId"
        params={{ auctionId: "seiko-5-flash-lot" }}
        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#FFBF19] px-[18px] py-2.5 text-[14px] font-semibold text-black transition-colors hover:bg-[#FFC93A] active:bg-[#F0AD00]"
      >
        Bid on it
      </Link>
    </div>
  );
}
