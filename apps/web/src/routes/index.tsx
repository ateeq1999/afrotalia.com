import { createFileRoute, Link } from "@tanstack/react-router";

import EmptyState from "@/components/web/EmptyState";
import PromoBand from "@/components/web/PromoBand";
import SectionRule from "@/components/web/SectionRule";
import { getCmsBlocks, listProjects, listServices } from "@/functions/cms";

const CMS_SLUGS = ["home.hero", "home.about", "home.mnada-band", "home.shop-band", "home.why.1", "home.why.2", "home.why.3", "home.why.4", "home.closing"];

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: async () => {
    const [services, projects, cms] = await Promise.all([
      listServices(),
      listProjects(),
      getCmsBlocks({ data: { slugs: CMS_SLUGS } }),
    ]);
    return { services, projects: projects.filter((p) => p.featured).slice(0, 3), cms };
  },
});

function HomePage() {
  const { services, projects, cms } = Route.useLoaderData();
  const hero = cms["home.hero"];
  const about = cms["home.about"];
  const mnadaBand = cms["home.mnada-band"];
  const shopBand = cms["home.shop-band"];
  const closing = cms["home.closing"];
  const whyReasons = [cms["home.why.1"], cms["home.why.2"], cms["home.why.3"], cms["home.why.4"]].filter(Boolean);

  return (
    <main className="bg-white font-sans text-ink antialiased">
      {/* Hero */}
      <section className="mx-auto w-full max-w-[1200px] px-5 pb-12 pt-12 sm:px-8 sm:pb-20 sm:pt-24">
        {hero?.eyebrow ? (
          <p className="text-[12px] font-bold uppercase tracking-[0.8px] text-brand-green-700 sm:text-[13px]">
            {hero.eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 max-w-[760px] text-[34px] font-bold leading-[1.08] tracking-tight sm:mt-4 sm:text-[64px]">
          {hero?.title ?? <EmptyState />}
        </h1>
        {hero?.body ? (
          <p className="mt-4 max-w-[560px] text-[16px] leading-relaxed text-muted-ink sm:mt-6 sm:text-[17px]">
            {hero.body}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
          <Link
            to="/about"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-ink px-7 text-[14px] font-bold text-white transition-colors hover:bg-ink/85"
          >
            Discover Afrotalia
          </Link>
          <Link
            to="/contact"
            className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-ink px-7 text-[14px] font-bold transition-colors hover:bg-ink hover:text-white"
          >
            Talk to us
          </Link>
        </div>
      </section>

      <SectionRule />

      {/* About, in brief */}
      <section className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-4 px-5 py-12 sm:gap-8 sm:px-8 sm:py-20 md:grid-cols-[1fr_2fr]">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.8px] text-muted-ink">{about?.eyebrow ?? "About"}</h2>
        <div>
          {about?.title ? <p className="text-[17px] font-semibold leading-relaxed sm:text-[18px]">{about.title}</p> : null}
          {about?.body ? (
            <p className="mt-3 max-w-[640px] text-[15px] leading-relaxed text-muted-ink sm:text-[16px]">{about.body}</p>
          ) : null}
          <Link to="/about" className="mt-4 inline-block text-[13px] font-semibold text-brand-green-700 hover:underline">
            Read the company profile →
          </Link>
        </div>
      </section>

      <SectionRule />

      {/* Services */}
      <section className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 sm:py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[24px] font-bold tracking-tight sm:text-[34px]">What we do</h2>
          <Link to="/services" className="shrink-0 text-[13px] font-semibold text-brand-green-700 hover:underline">
            All services
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-8 sm:mt-10 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-5">
          {services.map((s, i) => (
            <div key={s.id} className="border-t-2 border-ink pt-4">
              <p className="text-[12px] font-bold tabular-nums text-caption">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-[17px] font-bold">{s.name}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-ink">{s.preview}</p>
            </div>
          ))}
        </div>
      </section>

      <SectionRule />

      {/* Featured projects */}
      <section className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 sm:py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[24px] font-bold tracking-tight sm:text-[34px]">Featured projects</h2>
          <Link to="/projects" className="shrink-0 text-[13px] font-semibold text-brand-green-700 hover:underline">
            All projects
          </Link>
        </div>
        <div className="mt-8 sm:mt-10">
          {projects.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
              {projects.map((p) => (
                <div key={p.id} className="border border-hairline p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-caption">{p.kind}</p>
                  <h3 className="mt-1.5 text-[16px] font-bold">{p.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-ink">{p.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <PromoBand
        variant="mnada"
        eyebrow="Afrotalia Mnada"
        title={mnadaBand?.title ?? "Live auctions. Real-time bidding."}
        description={mnadaBand?.body}
        primaryHref="https://mnada.afrotalia.com"
        primaryCta="Enter Mnada"
        secondaryHref="/mnada"
        secondaryCta="How it works"
      />
      <PromoBand
        variant="shop"
        eyebrow="Afrotalia Shop"
        title={shopBand?.title ?? "Discover products from Afrotalia."}
        description={shopBand?.body}
        primaryHref="https://shop.afrotalia.com"
        primaryCta="Visit Shop"
        secondaryHref="/shop"
        secondaryCta="What's in store"
      />

      {/* Why Afrotalia */}
      <section className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 sm:py-20">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.8px] text-muted-ink">Why Afrotalia</h2>
        {whyReasons.length === 0 ? (
          <EmptyState className="mt-6" />
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:mt-8 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
            {whyReasons.map((reason, i) => (
              <div key={reason!.slug} className="border-t-2 border-ink pt-4">
                <p className="text-[12px] font-bold tabular-nums text-caption">{i + 1}</p>
                <h3 className="mt-2 text-[16px] font-bold">{reason!.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-ink">{reason!.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <SectionRule />

      {/* Closing CTA */}
      <section className="bg-brand-green-700 px-5 py-16 text-center text-white sm:px-8 sm:py-24">
        <h2 className="mx-auto max-w-[600px] text-[26px] font-bold tracking-tight sm:text-[40px]">
          {closing?.title ?? <EmptyState />}
        </h2>
        {closing?.body ? (
          <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-relaxed text-white/85 sm:text-[16px]">
            {closing.body}
          </p>
        ) : null}
        <Link
          to="/contact"
          className="mt-7 inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-[14px] font-bold text-brand-green-700 transition-colors hover:bg-white/90"
        >
          Contact the team
        </Link>
      </section>
    </main>
  );
}
