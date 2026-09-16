import { createFileRoute } from "@tanstack/react-router";

import EmptyState from "@/components/web/EmptyState";
import SectionRule from "@/components/web/SectionRule";
import { getCmsBlocks } from "@/functions/cms";
import { getMnadaMarketingContext } from "@/functions/mnada-marketing";
import { formatTZS } from "@/lib/format";

const CMS_SLUGS = ["mnada.header", "mnada.step.1", "mnada.step.2", "mnada.step.3", "mnada.step.4", "mnada.step.5", "mnada.featured-lots-footnote"];

export const Route = createFileRoute("/mnada")({
  component: MnadaPromoPage,
  loader: async () => {
    const [cms, marketing] = await Promise.all([getCmsBlocks({ data: { slugs: CMS_SLUGS } }), getMnadaMarketingContext()]);
    return { cms, marketing };
  },
});

function MnadaPromoPage() {
  const { cms, marketing } = Route.useLoaderData();
  const header = cms["mnada.header"];

  // Fee and payment window come live from mnada_setting — completed into
  // the step copy here, never printed as a literal in content or code.
  const stepBodies: Record<string, string | undefined> = {
    "mnada.step.2": cms["mnada.step.2"]?.body
      ? `${cms["mnada.step.2"].body} Currently ${formatTZS(marketing.registrationFeeMinor)}.`
      : undefined,
    "mnada.step.5": cms["mnada.step.5"]?.body
      ? `${cms["mnada.step.5"].body} You have ${marketing.paymentWindowHours} hours from winning.`
      : undefined,
  };

  const steps = ["mnada.step.1", "mnada.step.2", "mnada.step.3", "mnada.step.4", "mnada.step.5"]
    .map((slug) => cms[slug])
    .filter((block): block is NonNullable<typeof block> => Boolean(block));

  return (
    <main className="bg-white font-sans text-ink antialiased">
      <section className="border-b-2 border-ink bg-dark-ground text-white">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 sm:py-28">
          <p className="text-[12px] font-bold uppercase tracking-[0.8px] text-brand-amber-400 sm:text-[13px]">
            Afrotalia Mnada
          </p>
          <h1 className="mt-3 max-w-[680px] text-[32px] font-bold leading-[1.08] tracking-tight sm:mt-4 sm:text-[56px]">
            {header?.title ?? <EmptyState />}
          </h1>
          {header?.body ? (
            <p className="mt-4 max-w-[520px] text-[15px] leading-relaxed text-caption sm:mt-6 sm:text-[16px]">
              {header.body}
            </p>
          ) : null}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="https://mnada.afrotalia.com"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-brand-amber-400 px-7 text-[14px] font-bold text-black transition-colors hover:bg-brand-amber-400/90"
            >
              View live auctions
            </a>
            <a
              href="/shop"
              className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-white/20 px-7 text-[14px] font-bold text-white transition-colors hover:border-white/40"
            >
              Explore Shop
            </a>
          </div>
        </div>
      </section>

      <SectionRule />

      {/* How it works */}
      <section className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 sm:py-20">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.8px] text-muted-ink">How it works</h2>
        {steps.length === 0 ? (
          <EmptyState className="mt-6" />
        ) : (
          <ol className="mt-6 grid grid-cols-1 gap-6 sm:mt-8 sm:grid-cols-2 sm:gap-8 lg:grid-cols-5">
            {steps.map((step, i) => (
              <li key={step.slug} className="border-t-2 border-ink pt-4">
                <p className="text-[12px] font-bold tabular-nums text-caption">{i + 1}</p>
                <h3 className="mt-2 text-[16px] font-bold">{step.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-ink">{stepBodies[step.slug] ?? step.body}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Featured lots — falls back to nothing (how-it-works above stands on its own) when none are flagged. */}
      {marketing.featuredLots.length > 0 ? (
        <>
          <SectionRule />
          <section className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 sm:py-20">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.8px] text-muted-ink">Featured lots</h2>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:grid-cols-3 sm:gap-6">
              {marketing.featuredLots.map((lot) => (
                <a
                  key={lot.id}
                  href={`https://mnada.afrotalia.com/auctions/${lot.id}`}
                  className="block border border-hairline p-5 transition-colors hover:border-ink/30"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-caption">Lot {lot.lotNumber}</p>
                  <h3 className="mt-1.5 text-[16px] font-bold">{lot.title}</h3>
                  <p className="mt-2 text-[15px] font-bold tabular-nums text-brand-amber-600">
                    {formatTZS(lot.currentBid > 0 ? lot.currentBid : lot.openingBid)}
                  </p>
                </a>
              ))}
            </div>
            {cms["mnada.featured-lots-footnote"]?.body ? (
              <p className="mt-4 text-[12px] text-caption">{cms["mnada.featured-lots-footnote"].body}</p>
            ) : null}
          </section>
        </>
      ) : null}
    </main>
  );
}
