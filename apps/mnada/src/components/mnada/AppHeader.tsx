import { Gavel } from "lucide-react";

export default function AppHeader() {
  return (
    <header className="border-b border-white/[0.08] bg-[#08090A]">
      <div className="mx-auto flex h-14 w-full max-w-[780px] items-center justify-between gap-3 px-4">
        <a href="/" className="flex shrink-0 items-center gap-2" aria-label="Afrotalia Mnada home">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#FFBF19]">
            <Gavel className="h-3.5 w-3.5 text-black" strokeWidth={2.25} />
          </span>
          <span className="text-[14px] font-semibold tracking-tight">
            <span className="text-[#F5F5F5]">Afrotalia</span>{" "}
            <span className="text-[#FFBF19]">Mnada</span>
          </span>
        </a>

        <nav className="flex min-w-0 items-center gap-0.5 text-[12px] font-medium sm:gap-1" aria-label="Marketplace">
          <a
            href="/"
            aria-current="page"
            className="rounded-full bg-[#1E1E20] px-3 py-1.5 text-[#F5F5F5] transition-colors hover:bg-[#262628]"
          >
            Auctions
          </a>
          <a
            href="#live-auctions"
            className="hidden px-2.5 py-1.5 text-[#929296] transition-colors hover:text-[#F5F5F5] sm:block"
          >
            My bids
          </a>
          <a
            href="#live-auctions"
            className="hidden px-2.5 py-1.5 text-[#929296] transition-colors hover:text-[#F5F5F5] sm:block"
          >
            Won
          </a>
          <button
            type="button"
            className="cursor-pointer px-2 py-1.5 text-[#929296] transition-colors hover:text-[#F5F5F5]"
          >
            TZS 0
          </button>
          <span className="ml-1 rounded-full border border-white/[0.12] px-2.5 py-1 text-[10px] font-semibold tracking-[0.8px] text-[#929296]">
            GUEST
          </span>
        </nav>
      </div>
    </header>
  );
}
