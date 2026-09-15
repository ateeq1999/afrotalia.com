export default function AppHeader() {
  return (
    <header className="border-b border-white/[0.08] bg-[#08090A]">
      <div className="mx-auto flex h-[62px] w-full max-w-[858px] items-center justify-between gap-3 px-[18px]">
        <a href="/" className="flex shrink-0 items-center" aria-label="Afrotalia Mnada home">
          <img
            src="/logos/afrotalia-mnada-dark.svg"
            alt="Afrotalia Mnada — live auctions and bidding"
            className="h-7 w-auto sm:h-8"
          />
        </a>

        <nav className="flex min-w-0 items-center gap-0.5 text-[13px] font-medium sm:gap-1" aria-label="Marketplace">
          <a
            href="/"
            aria-current="page"
            className="rounded-full bg-[#1E1E20] px-[14px] py-2 text-[#F5F5F5] transition-colors hover:bg-[#262628]"
          >
            Auctions
          </a>
          <a
            href="#live-auctions"
            className="hidden px-3 py-2 text-[#929296] transition-colors hover:text-[#F5F5F5] sm:block"
          >
            My bids
          </a>
          <a
            href="#live-auctions"
            className="hidden px-3 py-2 text-[#929296] transition-colors hover:text-[#F5F5F5] sm:block"
          >
            Won
          </a>
          <button
            type="button"
            className="cursor-pointer px-2 py-2 text-[#929296] transition-colors hover:text-[#F5F5F5]"
          >
            TZS 0
          </button>
          <span className="ml-1 rounded-full border border-white/[0.12] px-3 py-[5px] text-[11px] font-semibold tracking-[0.8px] text-[#929296]">
            GUEST
          </span>
        </nav>
      </div>
    </header>
  );
}
