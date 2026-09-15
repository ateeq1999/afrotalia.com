import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { cn } from "@afrotalia/ui/lib/utils";

import ProductCard from "@/components/shop/ProductCard";
import { listProducts, type ProductSort } from "@/functions/products";

const searchSchema = z.object({
  q: z.string().max(200).optional(),
  category: z.string().max(200).optional(),
  condition: z.enum(["NEW", "USED", "NOT_WORKING"]).optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "name"]).default("newest"),
});

export const Route = createFileRoute("/products/")({
  component: ProductsPage,
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    listProducts({
      data: { search: deps.q, categorySlug: deps.category, condition: deps.condition, sort: deps.sort },
    }),
});

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

const CONDITION_OPTIONS = [
  { value: "NEW" as const, label: "New" },
  { value: "USED" as const, label: "Used" },
  { value: "NOT_WORKING" as const, label: "Not working" },
];

function ProductsPage() {
  const { products, categories } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const setSearch = (patch: Partial<z.infer<typeof searchSchema>>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch }) });
  };

  return (
    <main className="bg-white font-sans text-[#18181B] antialiased">
      <div className="mx-auto w-full max-w-[1100px] px-4 pb-16 pt-8 sm:px-5">
        <h1 className="text-[28px] font-bold tracking-tight">Products</h1>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            placeholder="Search products…"
            defaultValue={search.q ?? ""}
            onChange={(e) => setSearch({ q: e.target.value || undefined })}
            className="h-11 w-full rounded-lg border border-[#E4E4E7] bg-white px-4 text-[14px] outline-none transition-colors placeholder:text-[#8F8F98] focus:border-brand-green-700 sm:max-w-[320px]"
          />
          <select
            value={search.sort}
            onChange={(e) => setSearch({ sort: e.target.value as ProductSort })}
            className="h-11 rounded-lg border border-[#E4E4E7] bg-white px-3 text-[14px] outline-none focus:border-brand-green-700"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSearch({ category: undefined })}
            className={cn(
              "h-9 rounded-full border px-3 text-[13px] font-medium transition-colors",
              !search.category
                ? "border-brand-green-700 bg-brand-green-700/10 text-brand-green-700"
                : "border-[#E4E4E7] text-[#52525B] hover:border-[#18181B]/20",
            )}
          >
            All categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setSearch({ category: cat.slug })}
              className={cn(
                "h-9 rounded-full border px-3 text-[13px] font-medium transition-colors",
                search.category === cat.slug
                  ? "border-brand-green-700 bg-brand-green-700/10 text-brand-green-700"
                  : "border-[#E4E4E7] text-[#52525B] hover:border-[#18181B]/20",
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div role="group" aria-label="Filter by condition" className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSearch({ condition: undefined })}
            className={cn(
              "h-8 rounded-full px-3 text-[12px] font-medium transition-colors",
              !search.condition ? "bg-[#F4F4F5] text-[#18181B]" : "text-[#52525B] hover:text-[#18181B]",
            )}
          >
            Any condition
          </button>
          {CONDITION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSearch({ condition: opt.value })}
              className={cn(
                "h-8 rounded-full px-3 text-[12px] font-medium transition-colors",
                search.condition === opt.value ? "bg-[#F4F4F5] text-[#18181B]" : "text-[#52525B] hover:text-[#18181B]",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {products.length === 0 ? (
            <div className="rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] px-4 py-16 text-center">
              <p className="text-[15px] font-semibold">No products match your filters.</p>
              <p className="mx-auto mt-2 max-w-[380px] text-[13px] leading-relaxed text-[#52525B]">
                Try a different search term or clear a filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
