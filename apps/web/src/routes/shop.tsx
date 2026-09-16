import { createFileRoute } from "@tanstack/react-router";

import EmptyState from "@/components/web/EmptyState";
import SectionRule from "@/components/web/SectionRule";
import { getCmsBlocks } from "@/functions/cms";
import { listShopCategories } from "@/functions/shop-marketing";

export const Route = createFileRoute("/shop")({
  component: ShopPromoPage,
  loader: async () => {
    const [cms, categories] = await Promise.all([
      getCmsBlocks({ data: { slugs: ["shop.header"] } }),
      listShopCategories(),
    ]);
    return { header: cms["shop.header"], categories };
  },
});

function ShopPromoPage() {
  const { header, categories } = Route.useLoaderData();

  return (
    <main className="bg-white font-sans text-ink antialiased">
      <section className="border-b-2 border-ink">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 sm:py-28">
          <p className="text-[12px] font-bold uppercase tracking-[0.8px] text-brand-green-700 sm:text-[13px]">
            Afrotalia Shop
          </p>
          <h1 className="mt-3 max-w-[680px] text-[32px] font-bold leading-[1.08] tracking-tight sm:mt-4 sm:text-[56px]">
            {header?.title ?? <EmptyState />}
          </h1>
          {header?.body ? (
            <p className="mt-4 max-w-[520px] text-[15px] leading-relaxed text-muted-ink sm:mt-6 sm:text-[16px]">
              {header.body}
            </p>
          ) : null}
          <a
            href="https://shop.afrotalia.com"
            className="mt-7 inline-flex h-12 items-center justify-center rounded-lg bg-brand-green-700 px-7 text-[14px] font-bold text-white transition-colors hover:bg-brand-green-700/90"
          >
            Visit Shop
          </a>
        </div>
      </section>

      <SectionRule />

      {/* Categories */}
      <section className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 sm:py-20">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.8px] text-muted-ink">Categories</h2>
        {categories.length === 0 ? (
          <EmptyState className="mt-6" />
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:mt-8 sm:grid-cols-4 sm:gap-6">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`https://shop.afrotalia.com/products?category=${cat.slug}`}
                className="border border-hairline p-4 transition-colors hover:border-ink/30 sm:p-5"
              >
                <h3 className="text-[15px] font-bold">{cat.name}</h3>
                <p className="mt-1 text-[13px] text-caption">
                  {cat.count} {cat.count === 1 ? "item" : "items"}
                </p>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
