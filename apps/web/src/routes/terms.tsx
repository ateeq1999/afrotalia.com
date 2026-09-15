import { createFileRoute } from "@tanstack/react-router";

import EmptyState from "@/components/web/EmptyState";
import SectionRule from "@/components/web/SectionRule";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

// Section outline only — no legal wording is generated here. Real copy
// comes from the CMS (or legal counsel) before this page goes live.
const SECTIONS = [
  "Acceptance of terms",
  "Eligibility and accounts",
  "Mnada auctions and bidding",
  "Shop orders and payments",
  "Delivery and returns",
  "Prohibited conduct",
  "Limitation of liability",
  "Governing law",
  "Changes to these terms",
  "Contact us",
];

function TermsPage() {
  return (
    <main className="bg-white font-sans text-ink antialiased">
      <section className="mx-auto w-full max-w-[1200px] px-5 pb-12 pt-16 sm:px-8 sm:pt-24">
        <p className="text-[13px] font-bold uppercase tracking-[0.8px] text-brand-green-700">Legal</p>
        <h1 className="mt-4 text-[38px] font-bold leading-[1.1] tracking-tight sm:text-[52px]">Terms of service</h1>
        <EmptyState label="This page is a section outline only — legal wording has not been drafted or reviewed yet." className="mt-6 max-w-[520px]" />
      </section>

      <SectionRule />

      <section className="mx-auto w-full max-w-[800px] px-5 py-16 sm:px-8 sm:py-20">
        <ol className="space-y-10">
          {SECTIONS.map((title, i) => (
            <li key={title} className="border-t-2 border-ink pt-4">
              <h2 className="text-[17px] font-bold">
                {i + 1}. {title}
              </h2>
              <EmptyState label="Content not yet provided." className="mt-3" />
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
