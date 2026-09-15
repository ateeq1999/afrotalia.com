import { useLocation } from "@tanstack/react-router";

import type { MnadaAccountStatus } from "@/functions/registration";

import AppHeader, { type HeaderNav } from "./mnada/AppHeader";

export default function Header({ status }: { status: MnadaAccountStatus }) {
  const pathname = useLocation({ select: (s) => s.pathname });

  const activeNav: HeaderNav =
    pathname === "/my-bids"
      ? "my-bids"
      : pathname === "/won"
        ? "won"
        : pathname === "/wallet"
          ? "wallet"
          : "auctions";

  const maxWidthClassName = pathname === "/my-bids" ? "max-w-[730px]" : undefined;

  return (
    <AppHeader
      signedIn={status.signedIn}
      profileStatus={status.profileStatus}
      walletBalance={status.walletBalance}
      activeNav={activeNav}
      maxWidthClassName={maxWidthClassName}
    />
  );
}
