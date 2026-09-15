import { Link } from "@tanstack/react-router";

import { GavelIcon } from "@afrotalia/ui/brand";
import AfrotaliaMnadaLogo from "@afrotalia/ui/brand/AfrotaliaMnadaLogo";
import { Badge, type BadgeProps } from "@afrotalia/ui/components/badge";
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
  { label: string; tone: BadgeProps["tone"]; to?: string }
> = {
  ACTIVE: { label: "Active", tone: "success" },
  PENDING_PAYMENT: { label: "Activate", tone: "warning", to: "/activate" },
  BLOCKED: { label: "Blocked", tone: "danger" },
  unverified: { label: "Verify phone", tone: "warning", to: "/register" },
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
          <GavelIcon className="h-7 w-7 text-brand-amber-400 sm:hidden" />
          <AfrotaliaMnadaLogo variant="dark" className="hidden sm:inline-flex" />
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
                <Link to={badge.to} className="ml-1 transition-opacity hover:opacity-80">
                  <Badge tone={badge.tone} surface="dark">
                    {badge.label}
                  </Badge>
                </Link>
              ) : (
                <Badge tone={badge.tone} surface="dark" className="ml-1">
                  {badge.label}
                </Badge>
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
              <Badge tone="neutral" surface="dark" className="ml-1">
                Guest
              </Badge>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
