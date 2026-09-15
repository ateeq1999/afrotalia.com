import { createFileRoute } from "@tanstack/react-router";

import SectionRule from "@/components/web/SectionRule";

export const Route = createFileRoute("/mnada")({
  component: MnadaPromoPage,
});

const FEATURES = [
  { title: "Server-timed countdowns", body: "Every auction closes on the server's clock — never a visitor's, never disputable." },
  { title: "Wallet-backed bidding", body: "Funds are reserved when you bid and released the moment you're outbid. No surprises at settlement." },
  { title: "Anti-snipe protection", body: "A bid in the closing minute extends the clock, so the last word is never a last-second sniper." },
];

function MnadaPromoPage() {
  return (
    <main className="bg-white font-sans text-ink antialiased">
      <section className="border-b-2 border-ink bg-dark-ground text-white">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-20 sm:px-8 sm:py-28">
          <p className="text-[13px] font-bold uppercase tracking-[0.8px] text-brand-amber-400">Afrotalia Mnada</p>
          <h1 className="mt-4 max-w-[680px] text-[40px] font-bold leading-[1.05] tracking-tight sm:text-[56px]">
            Live auctions, run fairly.
          </h1>
          <p className="mt-6 max-w-[520px] text-[16px] leading-relaxed text-caption">
            Bid on watches, electronics, furniture, and equipment across Tanzania. Registration, wallet funding, and
            bidding all happen on mnada.afrotalia.com.
          </p>
          <a
            href="https://mnada.afrotalia.com"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-brand-amber-400 px-7 text-[14px] font-bold text-black transition-colors hover:bg-brand-amber-400/90"
          >
            Visit Mnada
          </a>
        </div>
      </section>

      <SectionRule />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 sm:py-20">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.8px] text-muted-ink">How it works</h2>
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
