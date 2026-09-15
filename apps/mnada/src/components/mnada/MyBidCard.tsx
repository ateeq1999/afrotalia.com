import { Link } from "@tanstack/react-router";

import { getBidStatus, type MyBid } from "@/lib/my-bids";
import { formatTZS } from "@/lib/mnada";

import BidStatusBadge from "./BidStatusBadge";

export default function MyBidCard({ bid }: { bid: MyBid }) {
  const status = getBidStatus(bid);

  return (
    <Link
      to="/auctions/$auctionId"
      params={{ auctionId: bid.auctionId }}
      aria-label={`${bid.title}, your bid ${formatTZS(bid.userBid)}, current bid ${formatTZS(bid.currentBid)}, ${status}`}
      className="flex items-start justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#121214] px-4 py-4 transition-colors duration-150 hover:border-white/[0.16] hover:bg-[#161618] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFBF19]"
    >
      <span className="min-w-0">
        <span className="block text-[15px] font-bold leading-snug text-[#F5F5F5] sm:text-[16px]">
          {bid.title}
        </span>
        <span className="mt-1.5 block text-[12px] tabular-nums text-[#8F9095] sm:text-[13px]">
          Your bid {formatTZS(bid.userBid)} · now {formatTZS(bid.currentBid)}
        </span>
      </span>
      <span className="mt-0.5 shrink-0">
        <BidStatusBadge status={status} />
      </span>
    </Link>
  );
}

export function MyBidCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex items-start justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#121214] px-4 py-4"
    >
      <span className="min-w-0 flex-1">
        <span className="block h-[20px] w-2/3 animate-pulse rounded bg-white/[0.07]" />
        <span className="mt-2 block h-[16px] w-1/2 animate-pulse rounded bg-white/[0.05]" />
      </span>
      <span className="mt-0.5 block h-[24px] w-[76px] shrink-0 animate-pulse rounded-full bg-white/[0.07]" />
    </div>
  );
}
