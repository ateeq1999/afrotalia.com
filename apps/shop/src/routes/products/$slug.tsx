import { useState } from "react";
import { createFileRoute, getRouteApi, notFound, useRouter } from "@tanstack/react-router";

import { cn } from "@afrotalia/ui/lib/utils";

import ConditionBadge from "@/components/shop/ConditionBadge";
import ProductImage from "@/components/shop/ProductImage";
import QuantityStepper from "@/components/shop/QuantityStepper";
import { addToCart as addToCartFn } from "@/functions/cart";
import { getProductBySlug } from "@/functions/products";
import { addToGuestCart } from "@/lib/guest-cart";
import { formatTZS } from "@/lib/shop";

const rootRoute = getRouteApi("__root__");

export const Route = createFileRoute("/products/$slug")({
  component: ProductDetailPage,
  loader: async ({ params }) => {
    const detail = await getProductBySlug({ data: { slug: params.slug } });
    if (!detail) throw notFound();
    return detail;
  },
  notFoundComponent: () => (
    <main className="bg-white font-sans text-ink antialiased">
      <div className="mx-auto w-full max-w-[1100px] px-4 py-16 text-center sm:px-5">
        <h1 className="text-[20px] font-bold">Product not found</h1>
        <p className="mt-2 text-[14px] text-muted-ink">This item doesn&apos;t exist or was removed.</p>
      </div>
    </main>
  ),
});

function ProductDetailPage() {
  const product = Route.useLoaderData();
  const shopContext = rootRoute.useLoaderData();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const outOfStock = product.stock <= 0;

  const addToCart = async () => {
    if (adding || outOfStock) return;
    setAdding(true);
    setAdded(false);
    try {
      if (shopContext.signedIn) {
        await addToCartFn({ data: { productId: product.id, quantity } });
      } else {
        addToGuestCart(
          { id: product.id, name: product.name, slug: product.slug, image: product.image, price: product.price, stock: product.stock },
          quantity,
        );
      }
      setAdded(true);
      router.invalidate();
    } finally {
      setAdding(false);
    }
  };

  return (
    <main className="bg-white font-sans text-ink antialiased">
      <div className="mx-auto w-full max-w-[1100px] px-4 pb-16 pt-8 sm:px-5">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,480px)_1fr]">
          <div className="overflow-hidden rounded-xl border border-hairline">
            <ProductImage name={product.name} image={product.image} className="h-[320px] sm:h-[420px]" />
          </div>

          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.6px] text-muted-ink">
              {product.categoryName}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <ConditionBadge condition={product.condition} isWorking={product.isWorking} />
              <span className="text-[12px] text-muted-ink">SKU {product.sku}</span>
            </div>
            <h1 className="mt-3 text-[26px] font-bold leading-tight tracking-tight sm:text-[30px]">
              {product.name}
            </h1>
            <p className="mt-3 text-[26px] font-bold tabular-nums text-ink">{formatTZS(product.price)}</p>
            <p className="mt-4 text-[14px] leading-relaxed text-muted-ink">{product.description}</p>

            <p className={cn("mt-4 text-[13px] font-medium", outOfStock ? "text-danger" : "text-muted-ink")}>
              {outOfStock ? "Out of stock" : `${product.stock} in stock`}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <QuantityStepper
                quantity={quantity}
                max={Math.max(1, product.stock)}
                onChange={setQuantity}
                disabled={outOfStock}
              />
              <button
                type="button"
                disabled={outOfStock || adding}
                onClick={() => void addToCart()}
                className={cn(
                  "h-11 flex-1 rounded-lg px-6 text-[14px] font-bold transition-colors sm:flex-none sm:min-w-[200px]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-700",
                  outOfStock || adding
                    ? "cursor-not-allowed bg-surface-muted text-caption"
                    : "bg-brand-green-700 text-white hover:bg-brand-green-700/90 active:translate-y-px",
                )}
              >
                {adding ? "Adding…" : outOfStock ? "Out of stock" : "Add to cart"}
              </button>
            </div>

            <div aria-live="polite" role="status" className="mt-3 min-h-[20px]">
              {added ? <p className="text-[13px] font-medium text-brand-green-700">Added to cart.</p> : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
