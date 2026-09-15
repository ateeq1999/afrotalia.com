import { cn } from "../lib/utils";

export interface BrandMarkProps {
  variant?: "light" | "dark";
  className?: string;
}

/**
 * Afrotalia International Ltd — the parent wordmark. Icon-free by design:
 * green wordmark, a small-caps tracked descriptor, and a short 48×4px rule.
 */
export default function AfrotaliaLogo({ variant = "light", className }: BrandMarkProps) {
  const dark = variant === "dark";

  return (
    <span className={cn("inline-flex flex-col gap-1.5", className)}>
      <span
        className={cn(
          "text-[22px] font-extrabold leading-none tracking-tight",
          dark ? "text-brand-green-300" : "text-brand-green-700",
        )}
      >
        Afrotalia
      </span>
      <span className={cn("h-1 w-12", dark ? "bg-brand-green-300" : "bg-brand-green-700")} aria-hidden />
      <span
        className={cn(
          "text-[10px] font-semibold leading-none tracking-[2px]",
          "[font-variant:small-caps]",
          dark ? "text-caption" : "text-[#52525B]",
        )}
      >
        International Ltd
      </span>
    </span>
  );
}
