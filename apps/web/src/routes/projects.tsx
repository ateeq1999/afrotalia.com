import { createFileRoute } from "@tanstack/react-router";

import EmptyState from "@/components/web/EmptyState";
import SectionRule from "@/components/web/SectionRule";
import { listProjects } from "@/functions/cms";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
  loader: () => listProjects(),
});

function formatDate(ms: number): string {
  return new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(new Date(ms));
}

function ProjectsPage() {
  const projects = Route.useLoaderData();

  return (
    <main className="bg-white font-sans text-ink antialiased">
      <section className="mx-auto w-full max-w-[1200px] px-5 pb-12 pt-16 sm:px-8 sm:pt-24">
        <p className="text-[13px] font-bold uppercase tracking-[0.8px] text-brand-green-700">Projects</p>
        <h1 className="mt-4 max-w-[760px] text-[38px] font-bold leading-[1.1] tracking-tight sm:text-[52px]">
          Work we&apos;ve delivered.
        </h1>
      </section>

      <SectionRule />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 sm:py-20">
        {projects.length === 0 ? (
          <EmptyState label="No projects published yet — awaiting CMS content." className="max-w-[420px]" />
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {projects.map((p) => (
              <article key={p.id} className="border-t-2 border-ink pt-5">
                <h2 className="text-[20px] font-bold">{p.title}</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-ink">{p.summary}</p>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
                  <div>
                    <dt className="font-semibold text-caption">Client</dt>
                    <dd className="mt-1">
                      {p.clientName ?? <EmptyState label="Not yet provided" />}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-caption">Outcome</dt>
                    <dd className="mt-1">{p.outcome ?? <EmptyState label="Not yet provided" />}</dd>
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
