import { Link } from "@tanstack/react-router";

import { cn } from "@afrotalia/ui/lib/utils";

import { WalletPill } from "./WalletBalance";

export type HeaderNav = "auctions" | "my-bids" | "won" | "wallet";
export type MnadaProfileStatus = "PENDING_PAYMENT" | "ACTIVE" | "BLOCKED" | null;

interface AppHeaderProps {
  signedIn: boolean;
  profileStatus: MnadaProfileStatus;
  walletBalance: number | null;
  maxWidthClassName?: string;
  activeNav?: HeaderNav;
}

const STATUS_BADGE: Record<
  NonNullable<MnadaProfileStatus> | "unverified",
  { label: string; className: string; to?: string }
> = {
  ACTIVE: { label: "Active", className: "border-[#00D99A]/25 bg-[#00D99A]/10 text-[#00D99A]" },
  PENDING_PAYMENT: {
    label: "Activate",
    className: "border-[#FFBF19]/25 bg-[#FFBF19]/10 text-[#FFBF19]",
    to: "/activate",
  },
  BLOCKED: { label: "Blocked", className: "border-[#FF5C5C]/25 bg-[#FF5C5C]/10 text-[#FF5C5C]" },
  unverified: {
    label: "Verify phone",
    className: "border-[#FFBF19]/25 bg-[#FFBF19]/10 text-[#FFBF19]",
    to: "/register",
  },
};

export default function AppHeader({
  signedIn,
  profileStatus,
  walletBalance,
  maxWidthClassName,
  activeNav = "auctions",
}: AppHeaderProps) {
  const member = signedIn;
  const navItem = (active: boolean) =>
    active
      ? "rounded-full bg-[#1E1E20] px-[14px] py-2 text-[#F5F5F5] transition-colors hover:bg-[#262628]"
      : "px-3 py-2 text-[#929296] transition-colors hover:text-[#F5F5F5]";

  const badge = STATUS_BADGE[profileStatus ?? "unverified"];

  return (
    <header className="border-b border-white/[0.08] bg-[#08090A]">
      <div
        className={cn(
          "mx-auto flex w-full items-center justify-between gap-2 px-4 sm:gap-3 sm:px-5",
          member ? "h-[60px]" : "h-[62px]",
          maxWidthClassName ?? (member ? "max-w-[1070px]" : "max-w-[858px]"),
        )}
      >
        <Link to="/" className="flex shrink-0 items-center" aria-label="Afrotalia Mnada home">
          {member ? (
            <>
              <img src="/logos/mnada-icon-dark.svg" alt="Afrotalia Mnada" className="h-7 w-7 sm:hidden" />
              <img
                src="/logos/afrotalia-mnada-dark.svg"
                alt="Afrotalia Mnada — live auctions and bidding"
                className="hidden h-8 w-auto sm:block"
              />
            </>
          ) : (
            <img
              src="/logos/afrotalia-mnada-dark.svg"
              alt="Afrotalia Mnada — live auctions and bidding"
              className="h-7 w-auto sm:h-8"
            />
          )}
        </Link>

        <nav
          className="flex min-w-0 items-center gap-0.5 text-[13px] font-medium sm:gap-1"
          aria-label="Marketplace"
        >
          <Link to="/" aria-current={activeNav === "auctions" ? "page" : undefined} className={navItem(activeNav === "auctions")}>
            Auctions
          </Link>
          {member ? (
            <>
              <Link
                to="/my-bids"
                aria-current={activeNav === "my-bids" ? "page" : undefined}
                className={cn(navItem(activeNav === "my-bids"), "hidden sm:block")}
              >
                My bids
              </Link>
              <Link
                to="/won"
                aria-current={activeNav === "won" ? "page" : undefined}
                className={cn(navItem(activeNav === "won"), "hidden sm:block")}
              >
                Won
              </Link>
              <Link
                to="/wallet"
                aria-current={activeNav === "wallet" ? "page" : undefined}
                className="ml-1 hidden min-[420px]:inline-flex"
              >
                <WalletPill balance={walletBalance ?? 0} />
              </Link>
              {badge.to ? (
                <Link
                  to={badge.to}
                  className={cn(
                    "ml-1 inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase leading-none tracking-[0.8px] transition-colors sm:text-[11px]",
                    badge.className,
                  )}
                >
                  {badge.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "ml-1 inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase leading-none tracking-[0.8px] sm:text-[11px]",
                    badge.className,
                  )}
                >
                  {badge.label}
                </span>
              )}
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="cursor-pointer rounded-lg px-3 py-2 text-[#929296] transition-colors hover:text-[#F5F5F5]"
              >
                Sign in
              </Link>
              <span className="ml-1 rounded-full border border-white/[0.12] px-3 py-[5px] text-[11px] font-semibold tracking-[0.8px] text-[#929296]">
                GUEST
              </span>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
