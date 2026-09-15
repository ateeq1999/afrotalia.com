import { cn } from "@afrotalia/ui/lib/utils";

import type { AuctionStatus } from "@/lib/mnada";

const STATUS_STYLES: Record<AuctionStatus, string> = {
  live: "border-[#FFBF19]/25 bg-[#2B2103] text-[#FFBF19]",
  closing: "border-[#FF5C5C]/25 bg-[#2A1212] text-[#FF5C5C]",
  scheduled: "border-white/[0.08] bg-white/[0.06] text-[#929296]",
  ended: "border-white/[0.08] bg-white/[0.06] text-[#929296]",
};

const STATUS_LABELS: Record<AuctionStatus, string> = {
  live: "Live",
  closing: "Closing",
  scheduled: "Scheduled",
  ended: "Ended",
};

export default function AuctionStatusBadge({ status }: { status: AuctionStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-[3px] text-[10px] font-bold uppercase leading-none tracking-[0.8px]",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
