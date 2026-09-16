import { useEffect, useState } from "react";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

import AfrotaliaLogo from "@afrotalia/ui/brand/AfrotaliaLogo";
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
  const pathname = useLocation({ select: (s) => s.pathname });
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu on navigation.
  useEffect(() => {
    const unsub = router.subscribe("onResolved", () => setMenuOpen(false));
    return unsub;
  }, [router]);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-white">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-5 sm:h-[76px] sm:px-8">
        <Link to="/" className="flex shrink-0 items-center" aria-label="Afrotalia home">
          <AfrotaliaLogo variant="light" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeProps={{ className: "text-ink" }}
              className="rounded-md px-3 py-2 text-[14px] font-medium text-muted-ink transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to={signedIn ? "/dashboard" : "/login"}
            className="hidden h-10 items-center justify-center rounded-lg border-2 border-ink px-4 text-[13px] font-bold transition-colors hover:bg-ink hover:text-white sm:inline-flex"
          >
            {signedIn ? "Account" : "Sign in"}
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-ink md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <nav
        id="mobile-nav"
        aria-label="Primary"
        className={cn("border-t-2 border-ink bg-white md:hidden", menuOpen ? "block" : "hidden")}
      >
        <ul className="flex flex-col divide-y divide-hairline px-5">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={cn(
                  "flex h-14 items-center text-[16px] font-semibold",
                  pathname === link.to ? "text-ink" : "text-muted-ink",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link to={signedIn ? "/dashboard" : "/login"} className="flex h-14 items-center text-[16px] font-semibold text-ink">
              {signedIn ? "Account" : "Sign in"}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
