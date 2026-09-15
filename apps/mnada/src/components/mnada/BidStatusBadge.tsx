import { cn } from "@afrotalia/ui/lib/utils";

import type { BidStatus } from "@/lib/my-bids";

const STATUS_STYLES: Record<BidStatus, string> = {
  leading: "border-[#00D99A]/25 bg-[#00D99A]/10 text-[#00D99A]",
  outbid: "border-[#FF5C5C]/25 bg-[#FF5C5C]/10 text-[#FF5C5C]",
};

const STATUS_LABELS: Record<BidStatus, string> = {
  leading: "Leading",
  outbid: "Outbid",
};

export default function BidStatusBadge({ status }: { status: BidStatus }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase leading-none tracking-[0.8px]",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
