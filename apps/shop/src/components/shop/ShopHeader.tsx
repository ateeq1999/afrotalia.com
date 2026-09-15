import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";

import AfrotaliaShopLogo from "@afrotalia/ui/brand/AfrotaliaShopLogo";
import { ToteBagIcon } from "@afrotalia/ui/brand/icons";
import { cn } from "@afrotalia/ui/lib/utils";

import { GUEST_CART_EVENT, readGuestCart } from "@/lib/guest-cart";
import type { ShopHeaderContext } from "@/functions/shop-context";

export default function ShopHeader({ context }: { context: ShopHeaderContext }) {
  const pathname = useLocation({ select: (s) => s.pathname });
  const [guestCount, setGuestCount] = useState(0);

  useEffect(() => {
    if (context.signedIn) return;
    const update = () => setGuestCount(readGuestCart().reduce((sum, l) => sum + l.quantity, 0));
    update();
    window.addEventListener(GUEST_CART_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(GUEST_CART_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, [context.signedIn]);

  const cartCount = context.signedIn ? context.cartCount : guestCount;

  const navItem = (active: boolean) =>
    cn(
      "rounded-lg px-3 py-2 text-[14px] font-medium transition-colors",
      active ? "bg-surface-muted text-ink" : "text-muted-ink hover:text-ink",
    );

  return (
    <header className="border-b border-hairline bg-white">
      <div className="mx-auto flex h-[64px] w-full max-w-[1100px] items-center justify-between gap-3 px-4 sm:px-5">
        <Link to="/" className="flex shrink-0 items-center" aria-label="Afrotalia Shop home">
          <ToteBagIcon className="h-6 w-6 text-brand-green-700 sm:hidden" />
          <AfrotaliaShopLogo variant="light" className="hidden sm:inline-flex" />
        </Link>

        <nav className="flex items-center gap-1" aria-label="Shop">
          <Link to="/products" aria-current={pathname.startsWith("/products") ? "page" : undefined} className={navItem(pathname.startsWith("/products"))}>
            Products
          </Link>
          {context.signedIn ? (
            <Link to="/orders" aria-current={pathname === "/orders" ? "page" : undefined} className={cn(navItem(pathname === "/orders"), "hidden sm:block")}>
              Orders
            </Link>
          ) : null}
          <Link
            to="/cart"
            aria-current={pathname === "/cart" ? "page" : undefined}
            className={cn(navItem(pathname === "/cart"), "relative flex items-center gap-1.5")}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-green-700 px-1 text-[11px] font-bold tabular-nums text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
          {context.signedIn ? (
            <Link to="/dashboard" className={navItem(pathname === "/dashboard")}>
              Account
            </Link>
          ) : (
            <Link to="/login" className="rounded-lg bg-brand-green-700 px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-brand-green-700/90">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
