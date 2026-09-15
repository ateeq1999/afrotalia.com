import { useMemo } from "react";

import { cn } from "@afrotalia/ui/lib/utils";

import type { UpcomingAuction } from "@/lib/mnada";
import { formatOpensIn, formatTZS } from "@/lib/mnada";
import { useRemainingSeconds } from "@/lib/use-now";

import AuctionImage from "./AuctionImage";
import AuctionStatusBadge from "./AuctionStatusBadge";

interface UpcomingAuctionCardProps {
  auction: UpcomingAuction;
  opensAt: number;
}

export default function UpcomingAuctionCard({ auction, opensAt }: UpcomingAuctionCardProps) {
  const remaining = useRemainingSeconds(opensAt, 30_000);
  const label = useMemo(() => formatOpensIn(remaining), [remaining]);

  return (
    <article
      id={`upcoming-${auction.id}`}
      className="group block scroll-mt-24 overflow-hidden rounded-xl border border-white/[0.08] bg-[#171719] transition-colors duration-150 hover:border-white/[0.16] hover:bg-[#1B1B1D]"
    >
      <div className="relative">
        <AuctionImage title={auction.title} icon={auction.icon} image={auction.image} />
        <div className="absolute left-3 top-3">
          <AuctionStatusBadge status="scheduled" />
        </div>
      </div>

      <div className="p-3.5">
        <h3 className="text-[14px] font-semibold leading-tight text-[#F5F5F5]">
          {auction.title}
        </h3>
        <p className="mt-1 line-clamp-2 min-h-[32px] text-[12px] leading-snug text-[#929296]">
          {auction.description}
        </p>
        <p className="mt-2.5 text-[14px] font-bold tabular-nums text-[#FFBF19]">
          Opens {formatTZS(auction.openingBid)}
        </p>
        <p className={cn("mt-1 text-[11px] tabular-nums text-[#929296]")}>
          Opens in {label}
        </p>
      </div>
    </article>
  );
}
