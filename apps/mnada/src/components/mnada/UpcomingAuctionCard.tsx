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
        <div className="absolute left-3.5 top-3.5">
          <AuctionStatusBadge status="scheduled" />
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
          Opens {formatTZS(auction.openingBid)}
        </p>
        <p className={cn("mt-1.5 text-[12px] tabular-nums text-[#929296]")}>
          Opens in {label}
        </p>
      </div>
    </article>
  );
}
