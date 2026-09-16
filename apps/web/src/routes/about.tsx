import { createFileRoute } from "@tanstack/react-router";

import EmptyState from "@/components/web/EmptyState";
import SectionRule from "@/components/web/SectionRule";
import { getCmsBlocks, listTeamMembers } from "@/functions/cms";

const CMS_SLUGS = [
  "about.header",
  "about.mission",
  "about.vision",
  "about.values",
  "about.story",
  "about.registration.name",
  "about.registration.number",
  "about.registration.tin",
  "about.registration.vat",
  "about.registration.licences",
];

export const Route = createFileRoute("/about")({
  component: AboutPage,
  loader: async () => {
    const [cms, team] = await Promise.all([getCmsBlocks({ data: { slugs: CMS_SLUGS } }), listTeamMembers()]);
    return { cms, team };
  },
});

function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[12px] font-bold uppercase tracking-[0.6px] text-caption">{label}</p>
      {value ? <p className="mt-1.5 text-[14px] font-medium">{value}</p> : <EmptyState className="mt-1.5" />}
    </div>
  );
}

function AboutPage() {
  const { cms, team } = Route.useLoaderData();
  const header = cms["about.header"];

  return (
    <main className="bg-white font-sans text-ink antialiased">
      <section className="mx-auto w-full max-w-[1200px] px-5 pb-12 pt-12 sm:px-8 sm:pt-24">
        {header?.eyebrow ? (
          <p className="text-[12px] font-bold uppercase tracking-[0.8px] text-brand-green-700 sm:text-[13px]">
            {header.eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 max-w-[760px] text-[32px] font-bold leading-[1.1] tracking-tight sm:mt-4 sm:text-[52px]">
          {header?.title ?? <EmptyState />}
        </h1>
        {header?.body ? (
          <p className="mt-4 max-w-[640px] text-[16px] leading-relaxed text-muted-ink sm:text-[17px]">{header.body}</p>
        ) : null}
      </section>

      <SectionRule />

      {/* Mission / Vision / Values */}
      <section className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 sm:py-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {(["about.mission", "about.vision", "about.values"] as const).map((slug) => {
            const block = cms[slug];
            return (
              <div key={slug} className="border-t-2 border-ink pt-4">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.8px] text-muted-ink">{block?.title}</h2>
                <p className="mt-2 text-[15px] leading-relaxed">{block?.body ?? <EmptyState />}</p>
              </div>
            );
          })}
        </div>
      </section>

      <SectionRule />

      {/* Company story */}
      <section className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-4 px-5 py-12 sm:gap-8 sm:px-8 sm:py-20 md:grid-cols-[1fr_2fr]">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.8px] text-muted-ink">Our story</h2>
        {cms["about.story"]?.body ? (
          <p className="max-w-[640px] text-[16px] leading-relaxed sm:text-[18px]">{cms["about.story"].body}</p>
        ) : (
          <EmptyState />
        )}
      </section>

      <SectionRule />

      {/* Registration & compliance */}
      <section className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 sm:py-20">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.8px] text-muted-ink">Registration &amp; compliance</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:mt-8 sm:grid-cols-2 lg:grid-cols-5">
          <Fact label="Registered name" value={cms["about.registration.name"]?.body} />
          <Fact label="Company registration number" value={cms["about.registration.number"]?.body} />
          <Fact label="TIN" value={cms["about.registration.tin"]?.body} />
          <Fact label="VAT registration" value={cms["about.registration.vat"]?.body} />
          <Fact label="Licences held" value={cms["about.registration.licences"]?.body} />
        </div>
      </section>

      <SectionRule />

      {/* Leadership */}
      <section className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 sm:py-20">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.8px] text-muted-ink">Leadership</h2>
        <div className="mt-6 sm:mt-8">
          {team.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <div key={member.id}>
                  <h3 className="text-[16px] font-bold">{member.name}</h3>
                  <p className="text-[13px] text-caption">{member.role}</p>
                  {member.bio ? <p className="mt-2 text-[14px] leading-relaxed text-muted-ink">{member.bio}</p> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
