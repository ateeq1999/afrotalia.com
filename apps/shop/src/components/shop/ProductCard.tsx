import { Link } from "@tanstack/react-router";

import { formatTZS } from "@/lib/shop";
import type { ProductListItem } from "@/functions/products";

import ConditionBadge from "./ConditionBadge";
import ProductImage from "./ProductImage";

export default function ProductCard({ product }: { product: ProductListItem }) {
  const outOfStock = product.stock <= 0;

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group block overflow-hidden rounded-xl border border-[#E4E4E7] bg-white transition-colors hover:border-[#18181B]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-700"
      aria-label={`${product.name}, ${formatTZS(product.price)}${outOfStock ? ", out of stock" : ""}`}
    >
      <div className="relative">
        <ProductImage name={product.name} image={product.image} />
        <div className="absolute left-3 top-3">
          <ConditionBadge condition={product.condition} isWorking={product.isWorking} />
        </div>
        {outOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="rounded-full border border-[#E4E4E7] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.8px] text-[#52525B]">
              Out of stock
            </span>
          </div>
        ) : null}
      </div>
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[#52525B]">
          {product.categoryName}
        </p>
        <h3 className="mt-1 text-[15px] font-semibold leading-tight text-[#18181B]">{product.name}</h3>
        <p className="mt-2 text-[15px] font-bold tabular-nums text-[#18181B]">{formatTZS(product.price)}</p>
      </div>
    </Link>
  );
}
