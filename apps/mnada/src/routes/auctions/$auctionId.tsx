import { createFileRoute, notFound } from "@tanstack/react-router";

import AuctionImage from "../../components/mnada/AuctionImage";
import AuctionMetadata from "../../components/mnada/AuctionMetadata";
import BackToAuctions from "../../components/mnada/BackToAuctions";
import BidHistory from "../../components/mnada/BidHistory";
import BiddingPanel from "../../components/mnada/BiddingPanel";
import { getAuctionDetail } from "@/functions/auctions";
import { useAuctionDetail } from "@/lib/use-auction-detail";

export const Route = createFileRoute("/auctions/$auctionId")({
  component: AuctionDetailPage,
  loader: async ({ params }) => {
    const detail = await getAuctionDetail({ data: { auctionId: params.auctionId } });
    if (!detail) throw notFound();
    return detail;
  },
  notFoundComponent: () => (
    <main className="bg-[#08090A] font-sans text-[#F5F5F5] antialiased">
      <div className="mx-auto w-full max-w-[1070px] px-4 pb-14 pt-5 sm:px-5">
        <BackToAuctions />
        <div className="mt-5 rounded-xl border border-white/[0.08] bg-[#111113] p-6 text-center">
          <h1 className="text-[18px] font-bold">Auction not found</h1>
          <p className="mt-2 text-[13px] text-[#8F9095]">
            This lot doesn&apos;t exist or is no longer available.
          </p>
        </div>
      </div>
    </main>
  ),
});

function AuctionDetailPage() {
  const { auctionId } = Route.useParams();
  const initial = Route.useLoaderData();

  // Reset local state when navigating between lots client-side.
  return <DetailView key={auctionId} auctionId={auctionId} initial={initial} />;
}

function DetailView({
  auctionId,
  initial,
}: {
  auctionId: string;
  initial: ReturnType<typeof Route.useLoaderData>;
}) {
  const state = useAuctionDetail(auctionId, initial);

  return (
    <main className="bg-[#08090A] font-sans text-[#F5F5F5] antialiased">
      <div className="mx-auto w-full max-w-[1070px] px-4 pb-14 pt-5 sm:px-5">
        <BackToAuctions />

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[53%_1fr]">
          <div className="min-w-0">
            <div className="overflow-hidden rounded-xl border border-white/[0.08]">
              <AuctionImage
                title={state.auction.title}
                icon={state.auction.icon}
                image={state.auction.image ?? undefined}
                tone="light"
                className="h-[280px] sm:h-[340px] lg:h-[395px]"
              />
            </div>
            <div className="mt-5">
              <AuctionMetadata
                detail={state.auction}
                status={state.status}
                startsAt={state.startsAt}
                endsAt={state.endsAt}
              />
            </div>
          </div>

          <div className="min-w-0">
            <BiddingPanel
              detail={state.auction}
              currentBid={state.currentBid}
              minimumBid={state.minimumBid}
              suggestions={state.suggestions}
              bidderCount={state.bidderCount}
              endsAt={state.endsAt}
              isLive={state.isLive}
              walletBalance={state.viewer.walletBalance ?? 0}
              submitting={state.submitting}
              notice={state.notice}
              onPlaceBid={state.placeBid}
            />
            <div className="mt-6">
              <BidHistory bids={state.bids} now={state.now} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
