import { cn } from "@afrotalia/ui/lib/utils";

interface PromoBandProps {
  variant: "mnada" | "shop";
  eyebrow: string;
  title: string;
  description?: string | null;
  primaryHref: string;
  primaryCta: string;
  secondaryHref: string;
  secondaryCta: string;
}

export default function PromoBand({
  variant,
  eyebrow,
  title,
  description,
  primaryHref,
  primaryCta,
  secondaryHref,
  secondaryCta,
}: PromoBandProps) {
  const dark = variant === "mnada";

  return (
    <section className={cn("border-b-2 border-ink", dark ? "bg-dark-ground text-white" : "bg-white text-ink")}>
      <div className="mx-auto w-full max-w-[1200px] px-5 py-14 sm:px-8 sm:py-20">
        <p
          className={cn(
            "text-[13px] font-bold uppercase tracking-[0.8px]",
            dark ? "text-brand-amber-400" : "text-brand-green-700",
          )}
        >
          {eyebrow}
        </p>
        <h2 className="mt-3 max-w-[560px] text-[28px] font-bold leading-[1.1] tracking-tight sm:text-[40px]">
          {title}
        </h2>
        {description ? (
          <p className={cn("mt-4 max-w-[480px] text-[15px] leading-relaxed", dark ? "text-caption" : "text-muted-ink")}>
            {description}
          </p>
        ) : null}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={primaryHref}
            className={cn(
              "inline-flex h-12 items-center justify-center rounded-lg px-7 text-[14px] font-bold transition-colors",
              dark
                ? "bg-brand-amber-400 text-black hover:bg-brand-amber-400/90"
                : "bg-brand-green-700 text-white hover:bg-brand-green-700/90",
            )}
          >
            {primaryCta}
          </a>
          <a
            href={secondaryHref}
            className={cn(
              "inline-flex h-12 items-center justify-center rounded-lg border-2 px-7 text-[14px] font-bold transition-colors",
              dark
                ? "border-white/20 text-white hover:border-white/40"
                : "border-ink text-ink hover:bg-ink hover:text-white",
            )}
          >
            {secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
