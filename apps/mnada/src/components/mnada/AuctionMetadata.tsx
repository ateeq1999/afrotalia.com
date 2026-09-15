import { formatAuctionDate, type AuctionSummary } from "@/lib/auction-detail";
import type { AuctionStatus } from "@/lib/mnada";

import AuctionStatusBadge from "./AuctionStatusBadge";

interface AuctionMetadataProps {
  detail: AuctionSummary;
  status: AuctionStatus;
  startsAt: number;
  endsAt: number;
}

export default function AuctionMetadata({
  detail,
  status,
  startsAt,
  endsAt,
}: AuctionMetadataProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <AuctionStatusBadge status={status} />
        <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-[#2A2118] px-2.5 py-1 text-[11px] font-bold uppercase leading-none tracking-[0.8px] text-[#A8A29E]">
          {detail.condition}
        </span>
        <span className="text-[12px] text-[#8F9095]">{`Lot ${detail.lotNumber}`}</span>
      </div>

      <h1 className="mt-3 text-[26px] font-bold leading-tight tracking-tight text-[#F5F5F5] sm:text-[28px]">
        {detail.title}
      </h1>
      <p className="mt-1.5 text-[14px] leading-relaxed text-[#8F9095]">
        {detail.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-1.5 text-[13px]">
        <p className="text-[#8F9095]">
          Starts ·{" "}
          <span className="tabular-nums text-[#F5F5F5]">
            {formatAuctionDate(startsAt)}
          </span>
        </p>
        <p className="text-[#8F9095]">
          Ends ·{" "}
          <span className="tabular-nums text-[#F5F5F5]">
            {formatAuctionDate(endsAt)}
          </span>
        </p>
      </div>
    </div>
  );
}
