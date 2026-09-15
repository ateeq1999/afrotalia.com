import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";

import AuctionCard from "../components/mnada/AuctionCard";
import AuctionSection from "../components/mnada/AuctionSection";
import HowMnadaWorks from "../components/mnada/HowMnadaWorks";
import LiveAuctionBanner from "../components/mnada/LiveAuctionBanner";
import UpcomingAuctionCard from "../components/mnada/UpcomingAuctionCard";
import { auctions, upcomingAuctions } from "@/lib/mnada";

export const Route = createFileRoute("/")({
  component: MnadaAuctionsPage,
});

function MnadaAuctionsPage() {
  const deadlines = useMemo(() => {
    const now = Date.now();
    return {
      endsAt: Object.fromEntries(
        auctions.map((a) => [a.id, now + a.initialRemainingSeconds * 1000]),
      ) as Record<string, number>,
      opensAt: Object.fromEntries(
        upcomingAuctions.map((a) => [a.id, now + a.initialOpensInSeconds * 1000]),
      ) as Record<string, number>,
    };
  }, []);

  const flashLot = auctions.find((a) => a.id === "seiko-5-flash-lot") ?? auctions[3];
  const bannerEndsAt =
    deadlines.endsAt[flashLot.id] ?? Date.now() + flashLot.initialRemainingSeconds * 1000;

  return (
    <main className="bg-[#08090A] font-sans text-[#F5F5F5] antialiased">
      <div className="mx-auto w-full max-w-[858px] px-[18px] pb-[62px] pt-[18px]">
        <LiveAuctionBanner
          endsAt={bannerEndsAt}
          currentBid={flashLot.currentBid}
          targetId={`auction-${flashLot.id}`}
        />

        <AuctionSection id="live-auctions" title="Live auctions" aside="Updating in real time">
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {auctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                endsAt={deadlines.endsAt[auction.id] ?? Date.now()}
              />
            ))}
          </div>
        </AuctionSection>

        <AuctionSection id="upcoming" title="Upcoming">
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
            {upcomingAuctions.map((auction) => (
              <UpcomingAuctionCard
                key={auction.id}
                auction={auction}
                opensAt={deadlines.opensAt[auction.id] ?? Date.now()}
              />
            ))}
          </div>
        </AuctionSection>

        <HowMnadaWorks />
      </div>
    </main>
  );
}
