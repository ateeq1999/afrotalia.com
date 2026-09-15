import { cn } from "@afrotalia/ui/lib/utils";

import { formatBidAgo, type BidEntry } from "@/lib/auction-detail";
import { formatTZS } from "@/lib/mnada";

interface BidHistoryProps {
  bids: BidEntry[];
  now: number;
}

export function BidHistoryRow({ bid, now }: { bid: BidEntry; now: number }) {
  return (
    <li className="flex items-center gap-3 py-3 text-[13px]">
      <span
        className={cn(
          "min-w-0 flex-1 truncate font-medium",
          bid.isCurrentUser ? "text-[#00D99A]" : "text-[#F5F5F5]",
        )}
      >
        {bid.bidder}
      </span>
      <span className="shrink-0 font-semibold tabular-nums text-[#F5F5F5]">
        {formatTZS(bid.amount)}
      </span>
      <span className="w-[64px] shrink-0 text-right tabular-nums text-[#8F9095]">
        {formatBidAgo(bid.placedAt, now)}
      </span>
    </li>
  );
}

export default function BidHistory({ bids, now }: BidHistoryProps) {
  return (
    <section
      aria-label="Bid history"
      className="rounded-xl border border-white/[0.08] bg-[#111113] p-5 sm:p-6"
    >
      <h2 className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#8F9095]">
        Bid history
      </h2>
      <ol className="mt-1 divide-y divide-white/[0.06]">
        {bids.map((bid) => (
          <BidHistoryRow key={bid.id} bid={bid} now={now} />
        ))}
      </ol>
    </section>
  );
}
