import { createFileRoute } from "@tanstack/react-router";

import EmptyState from "@/components/web/EmptyState";
import SectionRule from "@/components/web/SectionRule";
import { getCmsBlocks, listProjects } from "@/functions/cms";

function formatDate(ms: number): string {
  return new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(new Date(ms));
}

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
  loader: async () => {
    const [projects, cms] = await Promise.all([listProjects(), getCmsBlocks({ data: { slugs: ["projects.header"] } })]);
    return { projects, header: cms["projects.header"] };
  },
});

function ProjectsPage() {
  const { projects, header } = Route.useLoaderData();

  return (
    <main className="bg-white font-sans text-ink antialiased">
      <section className="mx-auto w-full max-w-[1200px] px-5 pb-12 pt-12 sm:px-8 sm:pt-24">
        <p className="text-[12px] font-bold uppercase tracking-[0.8px] text-brand-green-700 sm:text-[13px]">Projects</p>
        <h1 className="mt-3 max-w-[760px] text-[32px] font-bold leading-[1.1] tracking-tight sm:mt-4 sm:text-[52px]">
          {header?.title ?? <EmptyState />}
        </h1>
        {header?.body ? (
          <p className="mt-4 max-w-[640px] text-[15px] leading-relaxed text-muted-ink sm:text-[16px]">{header.body}</p>
        ) : null}
      </section>

      <SectionRule />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 sm:py-20">
        {projects.length === 0 ? (
          <EmptyState className="max-w-[420px]" />
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {projects.map((p) => (
              <article key={p.id} className="border-t-2 border-ink pt-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-caption">{p.kind}</p>
                <h2 className="mt-1.5 text-[19px] font-bold sm:text-[20px]">{p.title}</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-ink">{p.summary}</p>
                {p.scope ? <p className="mt-2 text-[13px] leading-relaxed text-muted-ink">{p.scope}</p> : null}

                <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
                  <div>
                    <dt className="font-semibold text-caption">Client</dt>
                    <dd className="mt-1">{p.clientName ?? <EmptyState />}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-caption">Outcome</dt>
                    <dd className="mt-1">{p.outcome ?? <EmptyState />}</dd>
                  </div>
                  {p.completedAt ? (
                    <div>
                      <dt className="font-semibold text-caption">Completed</dt>
                      <dd className="mt-1">{formatDate(p.completedAt)}</dd>
                    </div>
                  ) : null}
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
