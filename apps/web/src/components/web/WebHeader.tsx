import { Link } from "@tanstack/react-router";

import { cn } from "@afrotalia/ui/lib/utils";

const NAV_LINKS = [
  { to: "/about" as const, label: "About" },
  { to: "/services" as const, label: "Services" },
  { to: "/projects" as const, label: "Projects" },
  { to: "/mnada" as const, label: "Mnada" },
  { to: "/shop" as const, label: "Shop" },
  { to: "/contact" as const, label: "Contact" },
];

export default function WebHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="border-b-2 border-[#18181B] bg-white">
      <div className="mx-auto flex h-[76px] w-full max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" className="flex shrink-0 items-center" aria-label="Afrotalia home">
          <img src="/logos/afrotalia-logo.svg" alt="Afrotalia" className="h-7 w-auto sm:h-8" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeProps={{ className: "text-[#18181B]" }}
              className="rounded-md px-3 py-2 text-[14px] font-medium text-[#52525B] transition-colors hover:text-[#18181B]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to={signedIn ? "/dashboard" : "/login"}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-lg border-2 border-[#18181B] px-4 text-[13px] font-bold transition-colors",
              "hover:bg-[#18181B] hover:text-white",
            )}
          >
            {signedIn ? "Account" : "Sign in"}
          </Link>
        </div>
      </div>

      <nav className="flex items-center gap-3 overflow-x-auto border-t border-[#E4E4E7] px-5 py-2 md:hidden" aria-label="Primary">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="shrink-0 text-[13px] font-medium text-[#52525B] transition-colors hover:text-[#18181B]"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
