import { createFileRoute } from "@tanstack/react-router";

import AuctionCard from "../components/mnada/AuctionCard";
import AuctionSection from "../components/mnada/AuctionSection";
import HowMnadaWorks from "../components/mnada/HowMnadaWorks";
import LiveAuctionBanner from "../components/mnada/LiveAuctionBanner";
import UpcomingAuctionCard from "../components/mnada/UpcomingAuctionCard";
import { listAuctions } from "@/functions/auctions";

export const Route = createFileRoute("/")({
  component: MnadaAuctionsPage,
  loader: () => listAuctions(),
});

function MnadaAuctionsPage() {
  const { auctions } = Route.useLoaderData();

  const live = auctions.filter((a) => a.dbStatus === "LIVE");
  const scheduled = auctions.filter((a) => a.dbStatus === "SCHEDULED");
  const soonestClosing = live.length > 0
    ? [...live].sort((a, b) => a.endsAt - b.endsAt)[0]
    : undefined;

  return (
    <main className="bg-[#08090A] font-sans text-[#F5F5F5] antialiased">
      <div className="mx-auto w-full max-w-[858px] px-[18px] pb-[62px] pt-[18px]">
        {soonestClosing ? (
          <LiveAuctionBanner
            auctionId={soonestClosing.id}
            title={soonestClosing.title}
            liveCount={live.length}
            endsAt={soonestClosing.endsAt}
            currentBid={soonestClosing.currentBid > 0 ? soonestClosing.currentBid : soonestClosing.openingBid}
          />
        ) : null}

        <AuctionSection id="live-auctions" title="Live auctions" aside="Updating in real time">
          {live.length > 0 ? (
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
              {live.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[#8F9095]">No auctions are live right now.</p>
          )}
        </AuctionSection>

        <AuctionSection id="upcoming" title="Upcoming">
          {scheduled.length > 0 ? (
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
              {scheduled.map((auction) => (
                <UpcomingAuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[#8F9095]">No auctions are scheduled yet.</p>
          )}
        </AuctionSection>

        <HowMnadaWorks />
      </div>
    </main>
  );
}
