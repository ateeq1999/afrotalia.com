import { Link, createFileRoute } from "@tanstack/react-router";

import MyBidCard, { MyBidCardSkeleton } from "../../components/mnada/MyBidCard";
import { useMyBids } from "@/lib/use-my-bids";

export const Route = createFileRoute("/_auth/my-bids")({
  component: MyBidsPage,
});

function MyBidsPage() {
  const { bids, error, retry, loading } = useMyBids();

  return (
    <main className="bg-[#08090A] font-sans text-[#F5F5F5] antialiased">
      <div className="mx-auto w-full max-w-[730px] px-4 pb-14 pt-9">
        <h1 className="text-[28px] font-bold tracking-tight">My bids</h1>

        <div className="mt-5">
          {loading ? (
            <div className="space-y-5" aria-label="Loading your bids">
              <MyBidCardSkeleton />
              <MyBidCardSkeleton />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-white/[0.08] bg-[#121214] px-4 py-8 text-center">
              <p className="text-[14px] font-semibold">Unable to load your bids.</p>
              <button
                type="button"
                onClick={retry}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-[#FFBF19] px-5 text-[14px] font-bold text-black transition-colors hover:bg-[#FFC93A] active:bg-[#F0AD00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFBF19]"
              >
                Try again
              </button>
            </div>
          ) : bids && bids.length > 0 ? (
            <div className="space-y-5">
              {bids.map((bid) => (
                <MyBidCard key={bid.auctionId} bid={bid} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.08] bg-[#121214] px-4 py-8 text-center">
              <p className="text-[14px] font-semibold">You haven&apos;t placed any bids yet.</p>
              <p className="mx-auto mt-2 max-w-[380px] text-[13px] leading-relaxed text-[#8F9095]">
                Browse live auctions to find something worth bidding on.
              </p>
              <Link
                to="/"
                className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-[#FFBF19] px-5 text-[14px] font-bold text-black transition-colors hover:bg-[#FFC93A] active:bg-[#F0AD00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFBF19]"
              >
                Browse auctions
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
