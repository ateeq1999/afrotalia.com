import { useLocation } from "@tanstack/react-router";

import AppHeader from "./mnada/AppHeader";

export default function Header() {
  const pathname = useLocation({ select: (s) => s.pathname });

  if (pathname === "/my-bids") {
    return <AppHeader variant="member" activeNav="my-bids" maxWidthClassName="max-w-[730px]" />;
  }
  if (pathname.startsWith("/auctions/")) {
    return <AppHeader variant="member" />;
  }
  return <AppHeader />;
}
