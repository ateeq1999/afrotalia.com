import { cn } from "@afrotalia/ui/lib/utils";

import { formatTZS } from "@/lib/mnada";

import { WalletPill } from "./WalletBalance";

export type HeaderNav = "auctions" | "my-bids" | "won";

interface AppHeaderProps {
  /** "guest" = listing header · "member" = signed-in header. */
  variant?: "guest" | "member";
  /** Displayed in the member wallet pill. */
  walletBalance?: number;
  maxWidthClassName?: string;
  activeNav?: HeaderNav;
}

export default function AppHeader({
  variant = "guest",
  walletBalance = 12000000,
  maxWidthClassName,
  activeNav = "auctions",
}: AppHeaderProps) {
  const member = variant === "member";
  const navItem = (active: boolean) =>
    active
      ? "rounded-full bg-[#1E1E20] px-[14px] py-2 text-[#F5F5F5] transition-colors hover:bg-[#262628]"
      : "px-3 py-2 text-[#929296] transition-colors hover:text-[#F5F5F5]";

  return (
    <header className="border-b border-white/[0.08] bg-[#08090A]">
      <div
        className={cn(
          "mx-auto flex w-full items-center justify-between gap-2 px-4 sm:gap-3 sm:px-5",
          member ? "h-[60px]" : "h-[62px]",
          maxWidthClassName ?? (member ? "max-w-[1070px]" : "max-w-[858px]"),
        )}
      >
        <a
          href="/"
          className="flex shrink-0 items-center"
          aria-label="Afrotalia Mnada home"
        >
          {member ? (
            <>
              <img
                src="/logos/mnada-icon-dark.svg"
                alt="Afrotalia Mnada"
                className="h-7 w-7 sm:hidden"
              />
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
        </a>

        <nav
          className="flex min-w-0 items-center gap-0.5 text-[13px] font-medium sm:gap-1"
          aria-label="Marketplace"
        >
          <a
            href="/"
            aria-current={activeNav === "auctions" ? "page" : undefined}
            className={navItem(activeNav === "auctions")}
          >
            Auctions
          </a>
          <a
            href="/my-bids"
            aria-current={activeNav === "my-bids" ? "page" : undefined}
            className={cn(navItem(activeNav === "my-bids"), "hidden sm:block")}
          >
            My bids
          </a>
          <a
            href="/#live-auctions"
            aria-current={activeNav === "won" ? "page" : undefined}
            className={cn(navItem(activeNav === "won"), "hidden sm:block")}
          >
            Won
          </a>
          {member ? (
            <>
              <span className="ml-1 hidden min-[420px]:inline-flex">
                <WalletPill balance={walletBalance} />
              </span>
              <span className="ml-1 inline-flex items-center rounded-full border border-[#00D99A]/25 bg-[#00D99A]/10 px-2.5 py-1 text-[10px] font-bold uppercase leading-none tracking-[0.8px] text-[#00D99A] sm:text-[11px]">
                Active
              </span>
            </>
          ) : (
            <>
              <button
                type="button"
                className="cursor-pointer px-2 py-2 text-[#929296] transition-colors hover:text-[#F5F5F5]"
              >
                {formatTZS(0)}
              </button>
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
