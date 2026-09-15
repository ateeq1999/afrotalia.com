import { useMemo } from "react";
import { Link } from "@tanstack/react-router";

import type { AuctionListItem } from "@/lib/mnada";
import { formatTZS, resolveAuctionStatus } from "@/lib/mnada";
import { useRemainingSeconds } from "@/lib/use-now";

import AuctionImage from "./AuctionImage";
import AuctionStatusBadge from "./AuctionStatusBadge";
import CountdownTimer from "./CountdownTimer";

interface AuctionCardProps {
  auction: AuctionListItem;
}

export default function AuctionCard({ auction }: AuctionCardProps) {
  const remaining = useRemainingSeconds(auction.endsAt);
  const status = useMemo(
    () => resolveAuctionStatus(auction.dbStatus, remaining),
    [auction.dbStatus, remaining],
  );
  const displayBid = auction.currentBid > 0 ? auction.currentBid : auction.openingBid;

  return (
    <Link
      id={`auction-${auction.id}`}
      to="/auctions/$auctionId"
      params={{ auctionId: auction.id }}
      className="group block scroll-mt-24 overflow-hidden rounded-xl border border-white/[0.08] bg-[#171719] transition-colors duration-150 hover:border-white/[0.16] hover:bg-[#1B1B1D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFBF19]"
      aria-label={`${auction.title}, current bid ${formatTZS(displayBid)}`}
    >
      <div className="relative">
        <AuctionImage title={auction.title} icon={auction.icon} image={auction.image ?? undefined} />
        <div className="absolute left-3.5 top-3.5">
          <AuctionStatusBadge status={status} />
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-[15px] font-semibold leading-tight text-[#F5F5F5]">
          {auction.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 min-h-[36px] text-[13px] leading-snug text-[#929296]">
          {auction.description}
        </p>
        <p className="mt-3 text-[15px] font-bold tabular-nums text-[#FFBF19]">
          {formatTZS(displayBid)}
        </p>
        <p className="mt-1.5 text-[12px] text-[#929296]">
          {status === "ended" ? (
            <span className="tabular-nums">00:00:00 ended</span>
          ) : (
            <CountdownTimer endsAt={auction.endsAt} />
          )}
        </p>
      </div>
    </Link>
  );
}
