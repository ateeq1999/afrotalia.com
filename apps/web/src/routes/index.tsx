import { createFileRoute, Link } from "@tanstack/react-router";

import EmptyState from "@/components/web/EmptyState";
import PromoBand from "@/components/web/PromoBand";
import SectionRule from "@/components/web/SectionRule";
import { getCmsBlocks, listProjects, listServices } from "@/functions/cms";

const CMS_SLUGS = ["home.about", "home.why-afrotalia"];

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: async () => {
    const [services, projects, cms] = await Promise.all([
      listServices(),
      listProjects(),
      getCmsBlocks({ data: { slugs: CMS_SLUGS } }),
    ]);
    return { services, projects: projects.slice(0, 3), cms };
  },
});

function HomePage() {
  const { services, projects, cms } = Route.useLoaderData();

  return (
    <main className="bg-white font-sans text-ink antialiased">
      {/* Hero */}
      <section className="mx-auto w-full max-w-[1200px] px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-24">
        <p className="text-[13px] font-bold uppercase tracking-[0.8px] text-brand-green-700">Afrotalia</p>
        <h1 className="mt-4 max-w-[760px] text-[42px] font-bold leading-[1.05] tracking-tight sm:text-[64px]">
          Your reliable partner in Tanzania.
        </h1>
        <p className="mt-6 max-w-[560px] text-[17px] leading-relaxed text-muted-ink">
          Import, wholesale, distribution, and retail — Afrotalia moves goods across Tanzania and into East Africa,
          plainly and reliably.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/contact"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-ink px-7 text-[14px] font-bold text-white transition-colors hover:bg-ink/85"
          >
            Get in touch
          </Link>
          <Link
            to="/services"
            className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-ink px-7 text-[14px] font-bold transition-colors hover:bg-ink hover:text-white"
          >
            Our services
          </Link>
        </div>
      </section>

      <SectionRule />

      {/* About */}
      <section className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-8 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-[1fr_2fr]">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.8px] text-muted-ink">About</h2>
        <div>
          {cms["home.about"]?.body ? (
            <p className="max-w-[640px] text-[18px] leading-relaxed">{cms["home.about"].body}</p>
          ) : (
            <EmptyState label="Company narrative not yet provided — awaiting CMS content." />
          )}
        </div>
      </section>

      <SectionRule />

      {/* Services */}
      <section className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[28px] font-bold tracking-tight sm:text-[34px]">What we do</h2>
          <Link to="/services" className="text-[13px] font-semibold text-brand-green-700 hover:underline">
            All services
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {services.map((s, i) => (
            <div key={s.id} className="border-t-2 border-ink pt-4">
              <p className="text-[12px] font-bold tabular-nums text-caption">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-[17px] font-bold">{s.name}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-ink">{s.summary}</p>
            </div>
          ))}
        </div>
      </section>

      <SectionRule />

      {/* Featured projects */}
      <section className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[28px] font-bold tracking-tight sm:text-[34px]">Featured projects</h2>
          <Link to="/projects" className="text-[13px] font-semibold text-brand-green-700 hover:underline">
            All projects
          </Link>
        </div>
        <div className="mt-10">
          {projects.length === 0 ? (
            <EmptyState label="No projects published yet — awaiting CMS content." />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {projects.map((p) => (
                <div key={p.id} className="border border-hairline p-5">
                  <h3 className="text-[16px] font-bold">{p.title}</h3>
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
        title="Live auctions, real-time bidding."
        description="Bid on watches, electronics, furniture, and more — server-timed countdowns, wallet-backed bids, no surprises."
        href="/mnada"
        cta="Visit Mnada"
      />
      <PromoBand
        variant="shop"
        eyebrow="Afrotalia Shop"
        title="Fixed-price, condition-graded goods."
        description="New, used, and as-is items — clearly labelled, fairly priced, delivered across Tanzania."
        href="/shop"
        cta="Visit Shop"
      />

      {/* Why Afrotalia */}
      <section className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-8 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-[1fr_2fr]">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.8px] text-muted-ink">Why Afrotalia</h2>
        <div>
          {cms["home.why-afrotalia"]?.body ? (
            <p className="max-w-[640px] text-[18px] leading-relaxed">{cms["home.why-afrotalia"].body}</p>
          ) : (
            <EmptyState label="Content not yet provided — awaiting CMS content." />
          )}
        </div>
      </section>

      <SectionRule />

      {/* Contact CTA */}
      <section className="mx-auto w-full max-w-[1200px] px-5 py-20 text-center sm:px-8 sm:py-24">
        <h2 className="text-[32px] font-bold tracking-tight sm:text-[40px]">Your gateway to East Africa.</h2>
        <Link
          to="/contact"
          className="mt-7 inline-flex h-12 items-center justify-center rounded-lg bg-ink px-8 text-[14px] font-bold text-white transition-colors hover:bg-ink/85"
        >
          Get in touch
        </Link>
      </section>
    </main>
  );
}
