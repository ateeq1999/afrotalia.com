import { createFileRoute, Link } from "@tanstack/react-router";

import ProductCard from "@/components/shop/ProductCard";
import { listProducts } from "@/functions/products";

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: () => listProducts({ data: { sort: "newest" } }),
});

function HomePage() {
  const { products } = Route.useLoaderData();
  const featured = products.slice(0, 6);

  return (
    <main className="bg-white font-sans text-[#18181B] antialiased">
      <section className="border-b border-[#E4E4E7]">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-16 sm:px-5 sm:py-20">
          <p className="text-[13px] font-semibold uppercase tracking-[0.8px] text-brand-green-700">
            Afrotalia Shop
          </p>
          <h1 className="mt-3 max-w-[640px] text-[36px] font-bold leading-[1.1] tracking-tight sm:text-[48px]">
            Your reliable partner in Tanzania.
          </h1>
          <p className="mt-4 max-w-[520px] text-[16px] leading-relaxed text-[#52525B]">
            New, used, and as-is electronics, appliances, furniture, and equipment — clearly graded, fairly priced,
            delivered across Tanzania.
          </p>
          <Link
            to="/products"
            className="mt-7 inline-flex h-12 items-center justify-center rounded-lg bg-brand-green-700 px-7 text-[14px] font-bold text-white transition-colors hover:bg-brand-green-700/90"
          >
            Browse products
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1100px] px-4 py-14 sm:px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold tracking-tight">Latest arrivals</h2>
          <Link to="/products" className="text-[13px] font-semibold text-brand-green-700 hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
