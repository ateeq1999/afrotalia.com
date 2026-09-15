import { cn } from "@afrotalia/ui/lib/utils";

const STEPS = [
  { n: "01", title: "Register", body: "Phone + OTP, or Google.", accent: "green" },
  { n: "02", title: "Activate", body: "One-time registration fee.", accent: "green" },
  { n: "03", title: "Fund wallet", body: "Bids reserve against balance.", accent: "green" },
  { n: "04", title: "Bid & win", body: "Pay within 24 hours of closing.", accent: "gold" },
] as const;

export default function HowMnadaWorks() {
  return (
    <section aria-label="How Mnada works" className="mt-8">
      <h2 className="text-[11px] font-bold uppercase tracking-[1px] text-[#F5F5F5]">
        How Mnada works
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] min-[560px]:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div key={s.n} className="bg-[#141415] p-4">
            <p
              className={cn(
                "text-[13px] font-bold tabular-nums tracking-wide",
                s.accent === "gold" ? "text-[#FFBF19]" : "text-[#16D9A0]",
              )}
            >
              {s.n}
            </p>
            <p className="mt-2 text-[13px] font-semibold text-[#F5F5F5]">{s.title}</p>
            <p className="mt-1 text-[11px] leading-snug text-[#929296]">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
