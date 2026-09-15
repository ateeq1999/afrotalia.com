import { createFileRoute } from "@tanstack/react-router";

import EmptyState from "@/components/web/EmptyState";
import SectionRule from "@/components/web/SectionRule";
import { getCmsBlocks } from "@/functions/cms";

const CMS_SLUGS = ["about.intro", "about.story", "about.registration", "about.founded", "about.address"];

export const Route = createFileRoute("/about")({
  component: AboutPage,
  loader: () => getCmsBlocks({ data: { slugs: CMS_SLUGS } }),
});

function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[12px] font-bold uppercase tracking-[0.6px] text-caption">{label}</p>
      {value ? (
        <p className="mt-1 text-[14px] font-medium">{value}</p>
      ) : (
        <EmptyState label="Not yet provided" className="mt-1" />
      )}
    </div>
  );
}

function AboutPage() {
  const cms = Route.useLoaderData();

  return (
    <main className="bg-white font-sans text-ink antialiased">
      <section className="mx-auto w-full max-w-[1200px] px-5 pb-12 pt-16 sm:px-8 sm:pt-24">
        <p className="text-[13px] font-bold uppercase tracking-[0.8px] text-brand-green-700">About</p>
        <h1 className="mt-4 max-w-[760px] text-[38px] font-bold leading-[1.1] tracking-tight sm:text-[52px]">
          {cms["about.intro"]?.title ?? "Afrotalia"}
        </h1>
      </section>

      <SectionRule />

      <section className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-8 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-[1fr_2fr]">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.8px] text-muted-ink">Our story</h2>
        {cms["about.story"]?.body ? (
          <p className="max-w-[640px] text-[18px] leading-relaxed">{cms["about.story"].body}</p>
        ) : (
          <EmptyState label="Company narrative not yet provided — awaiting CMS content." />
        )}
      </section>

      <SectionRule />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 sm:py-20">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.8px] text-muted-ink">Company facts</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Fact label="Registration number" value={cms["about.registration"]?.body} />
          <Fact label="Founded" value={cms["about.founded"]?.body} />
          <Fact label="Registered address" value={cms["about.address"]?.body} />
        </div>
      </section>
    </main>
  );
}
