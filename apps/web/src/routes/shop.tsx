import { createFileRoute } from "@tanstack/react-router";

import SectionRule from "@/components/web/SectionRule";

export const Route = createFileRoute("/shop")({
  component: ShopPromoPage,
});

const FEATURES = [
  { title: "Condition, clearly graded", body: "Every listing is New, Used, or Not working — never guesswork." },
  { title: "Server-checked totals", body: "Stock and pricing are re-verified at checkout, never trusted from the browser." },
  { title: "Delivery across Tanzania", body: "Standard, express, or warehouse pickup — pick what suits the order." },
];

function ShopPromoPage() {
  return (
    <main className="bg-white font-sans text-ink antialiased">
      <section className="border-b-2 border-ink">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-20 sm:px-8 sm:py-28">
          <p className="text-[13px] font-bold uppercase tracking-[0.8px] text-brand-green-700">Afrotalia Shop</p>
          <h1 className="mt-4 max-w-[680px] text-[40px] font-bold leading-[1.05] tracking-tight sm:text-[56px]">
            Fixed-price goods, fairly graded.
          </h1>
          <p className="mt-6 max-w-[520px] text-[16px] leading-relaxed text-muted-ink">
            Electronics, appliances, furniture, and equipment — new, used, and as-is — browsed and bought on
            shop.afrotalia.com.
          </p>
          <a
            href="https://shop.afrotalia.com"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-brand-green-700 px-7 text-[14px] font-bold text-white transition-colors hover:bg-brand-green-700/90"
          >
            Visit Shop
          </a>
        </div>
      </section>

      <SectionRule />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 sm:py-20">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.8px] text-muted-ink">Why shop here</h2>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="border-t-2 border-ink pt-4">
              <h3 className="text-[16px] font-bold">{f.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-ink">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
