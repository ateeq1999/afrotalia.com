import { createFileRoute } from "@tanstack/react-router";

import SectionRule from "@/components/web/SectionRule";
import { listServices } from "@/functions/cms";

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  loader: () => listServices(),
});

function ServicesPage() {
  const services = Route.useLoaderData();

  return (
    <main className="bg-white font-sans text-[#18181B] antialiased">
      <section className="mx-auto w-full max-w-[1200px] px-5 pb-12 pt-16 sm:px-8 sm:pt-24">
        <p className="text-[13px] font-bold uppercase tracking-[0.8px] text-brand-green-700">Services</p>
        <h1 className="mt-4 max-w-[760px] text-[38px] font-bold leading-[1.1] tracking-tight sm:text-[52px]">
          Five ways we move goods.
        </h1>
      </section>

      <SectionRule />

      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        {services.map((s, i) => (
          <div key={s.id}>
            <div className="grid grid-cols-1 gap-6 py-12 sm:py-16 md:grid-cols-[120px_1fr]">
              <p className="text-[15px] font-bold tabular-nums text-[#8F8F98]">{String(i + 1).padStart(2, "0")}</p>
              <div>
                <h2 className="text-[26px] font-bold tracking-tight sm:text-[30px]">{s.name}</h2>
                <p className="mt-3 max-w-[640px] text-[16px] leading-relaxed text-[#52525B]">{s.summary}</p>
              </div>
            </div>
            {i < services.length - 1 ? <hr className="border-t border-[#E4E4E7]" /> : null}
          </div>
        ))}
      </section>
    </main>
  );
}
