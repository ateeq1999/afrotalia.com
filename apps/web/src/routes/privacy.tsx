import { createFileRoute } from "@tanstack/react-router";

import EmptyState from "@/components/web/EmptyState";
import SectionRule from "@/components/web/SectionRule";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

// Structure only — no legal wording is generated here. Full text is
// supplied by Afrotalia before launch.
const SECTIONS = [
  "What we collect",
  "How it is used",
  "Sharing and processors",
  "Retention and your rights",
  "Contact for data requests",
];

function PrivacyPage() {
  return (
    <main className="bg-white font-sans text-ink antialiased">
      <section className="mx-auto w-full max-w-[1200px] px-5 pb-12 pt-12 sm:px-8 sm:pt-24">
        <p className="text-[12px] font-bold uppercase tracking-[0.8px] text-brand-green-700 sm:text-[13px]">Legal</p>
        <h1 className="mt-3 text-[32px] font-bold leading-[1.1] tracking-tight sm:mt-4 sm:text-[52px]">Privacy policy</h1>
        <EmptyState className="mt-6 max-w-[520px]" />
      </section>

      <SectionRule />

      <section className="mx-auto w-full max-w-[800px] px-5 py-12 sm:px-8 sm:py-20">
        <ol className="space-y-8 sm:space-y-10">
          {SECTIONS.map((title, i) => (
            <li key={title} className="border-t-2 border-ink pt-4">
              <h2 className="text-[16px] font-bold sm:text-[17px]">
                {String(i + 1).padStart(2, "0")} · {title}
              </h2>
              <EmptyState className="mt-3" />
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
