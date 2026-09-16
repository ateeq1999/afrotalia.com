import { createFileRoute } from "@tanstack/react-router";

import EmptyState from "@/components/web/EmptyState";
import SectionRule from "@/components/web/SectionRule";
import { getCmsBlocks, listServices } from "@/functions/cms";

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  loader: async () => {
    const [services, cms] = await Promise.all([listServices(), getCmsBlocks({ data: { slugs: ["services.header"] } })]);
    return { services, header: cms["services.header"] };
  },
});

function ServicesPage() {
  const { services, header } = Route.useLoaderData();

  return (
    <main className="bg-white font-sans text-ink antialiased">
      <section className="mx-auto w-full max-w-[1200px] px-5 pb-12 pt-12 sm:px-8 sm:pt-24">
        <p className="text-[12px] font-bold uppercase tracking-[0.8px] text-brand-green-700 sm:text-[13px]">Services</p>
        <h1 className="mt-3 max-w-[760px] text-[32px] font-bold leading-[1.1] tracking-tight sm:mt-4 sm:text-[52px]">
          {header?.title ?? <EmptyState />}
        </h1>
      </section>

      <SectionRule />

      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        {services.length === 0 ? (
          <div className="py-16">
            <EmptyState />
          </div>
        ) : (
          services.map((s, i) => (
            <div key={s.id}>
              <div className="grid grid-cols-1 gap-3 py-10 sm:gap-6 sm:py-16 md:grid-cols-[120px_1fr]">
                <p className="text-[14px] font-bold tabular-nums text-caption sm:text-[15px]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <div>
                  <h2 className="text-[22px] font-bold tracking-tight sm:text-[30px]">{s.name}</h2>
                  <p className="mt-3 max-w-[640px] text-[15px] leading-relaxed text-muted-ink sm:text-[16px]">{s.body}</p>
                </div>
              </div>
              {i < services.length - 1 ? <hr className="border-t border-hairline" /> : null}
            </div>
          ))
        )}
      </section>
    </main>
  );
}
