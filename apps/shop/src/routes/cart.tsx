import { useEffect, useState } from "react";
import { createFileRoute, getRouteApi, Link, useRouter } from "@tanstack/react-router";

import { cn } from "@afrotalia/ui/lib/utils";

import ProductImage from "@/components/shop/ProductImage";
import QuantityStepper from "@/components/shop/QuantityStepper";
import { addToCart, getMyCart, removeFromCart, updateCartItem } from "@/functions/cart";
import { clearGuestCart, readGuestCart, removeFromGuestCart, setGuestCartQuantity, type GuestCartLine } from "@/lib/guest-cart";
import { formatTZS } from "@/lib/shop";

const rootRoute = getRouteApi("__root__");

export const Route = createFileRoute("/cart")({
  component: CartPage,
  loader: () => getMyCart(),
});

function CartPage() {
  const dbCart = Route.useLoaderData();
  const shopContext = rootRoute.useLoaderData();
  const router = useRouter();
  const [guestLines, setGuestLines] = useState<GuestCartLine[]>([]);
  const [merging, setMerging] = useState(false);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);

  // Merge leftover guest-cart items into the DB cart once, right after sign-in.
  useEffect(() => {
    if (!shopContext.signedIn) {
      setGuestLines(readGuestCart());
      return;
    }
    const pending = readGuestCart();
    if (pending.length === 0) return;
    setMerging(true);
    (async () => {
      for (const line of pending) {
        await addToCart({ data: { productId: line.productId, quantity: line.quantity } });
      }
      clearGuestCart();
      router.invalidate();
      setMerging(false);
    })();
  }, [shopContext.signedIn, router]);

  const lines = shopContext.signedIn
    ? dbCart.lines
    : guestLines.map((l) => ({
        productId: l.productId,
        productName: l.productName,
        slug: l.slug,
        image: l.image,
        unitPrice: l.unitPrice,
        quantity: l.quantity,
        stock: l.stock,
      }));
  const itemsTotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  const changeQuantity = async (productId: string, next: number) => {
    setBusyProductId(productId);
    try {
      if (shopContext.signedIn) {
        await updateCartItem({ data: { productId, quantity: next } });
        router.invalidate();
      } else {
        setGuestLines(setGuestCartQuantity(productId, next));
      }
    } finally {
      setBusyProductId(null);
    }
  };

  const remove = async (productId: string) => {
    setBusyProductId(productId);
    try {
      if (shopContext.signedIn) {
        await removeFromCart({ data: { productId } });
        router.invalidate();
      } else {
        setGuestLines(removeFromGuestCart(productId));
      }
    } finally {
      setBusyProductId(null);
    }
  };

  return (
    <main className="bg-white font-sans text-ink antialiased">
      <div className="mx-auto w-full max-w-[900px] px-4 pb-16 pt-8 sm:px-5">
        <h1 className="text-[28px] font-bold tracking-tight">Your cart</h1>

        {merging ? <p className="mt-3 text-[13px] text-muted-ink">Syncing your saved cart…</p> : null}

        {lines.length === 0 ? (
          <div className="mt-6 rounded-xl border border-hairline bg-surface-subtle px-4 py-16 text-center">
            <p className="text-[15px] font-semibold">Your cart is empty.</p>
            <Link
              to="/products"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-brand-green-700 px-6 text-[14px] font-bold text-white transition-colors hover:bg-brand-green-700/90"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <ul className="space-y-4">
              {lines.map((line) => (
                <li key={line.productId} className="flex gap-4 rounded-xl border border-hairline p-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                    <ProductImage name={line.productName} image={line.image} className="h-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link to="/products/$slug" params={{ slug: line.slug }} className="text-[14px] font-semibold hover:underline">
                      {line.productName}
                    </Link>
                    <p className="mt-1 text-[13px] tabular-nums text-muted-ink">{formatTZS(line.unitPrice)} each</p>
                    <div className="mt-3 flex items-center gap-3">
                      <QuantityStepper
                        quantity={line.quantity}
                        max={Math.max(1, line.stock)}
                        onChange={(next) => void changeQuantity(line.productId, next)}
                        disabled={busyProductId === line.productId}
                      />
                      <button
                        type="button"
                        onClick={() => void remove(line.productId)}
                        disabled={busyProductId === line.productId}
                        className="text-[13px] font-medium text-muted-ink transition-colors hover:text-danger"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="shrink-0 text-[14px] font-bold tabular-nums">
                    {formatTZS(line.unitPrice * line.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="h-fit rounded-xl border border-hairline p-5">
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-muted-ink">Items total</span>
                <span className="font-bold tabular-nums">{formatTZS(itemsTotal)}</span>
              </div>
              <p className="mt-2 text-[12px] text-muted-ink">Delivery is calculated at checkout.</p>
              <Link
                to="/checkout"
                className={cn(
                  "mt-4 flex h-11 w-full items-center justify-center rounded-lg text-[14px] font-bold text-white transition-colors",
                  "bg-brand-green-700 hover:bg-brand-green-700/90",
                )}
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
