import { useLocation } from "@tanstack/react-router";

import AppHeader from "./mnada/AppHeader";

export default function Header() {
  const pathname = useLocation({ select: (s) => s.pathname });
  const isAuctionDetail = pathname.startsWith("/auctions/");

  if (isAuctionDetail) {
    return <AppHeader variant="member" />;
  }
  return <AppHeader />;
}
