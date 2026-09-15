import { cn } from "../lib/utils";
import { GavelIcon } from "./icons";
import type { BrandMarkProps } from "./AfrotaliaLogo";

/** Afrotalia Mnada — gavel icon, a 2px vertical rule, then the lockup. Dark by default. */
export default function AfrotaliaMnadaLogo({ variant = "dark", className }: BrandMarkProps) {
  const dark = variant === "dark";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <GavelIcon className={cn("h-5 w-5 shrink-0", dark ? "text-brand-amber-400" : "text-brand-amber-600")} />
      <span className={cn("h-5 w-0.5 shrink-0", dark ? "bg-dark-hairline" : "bg-hairline")} aria-hidden />
      <span className="flex items-baseline gap-1 leading-none">
        <span className={cn("text-[16px] font-medium", dark ? "text-caption" : "text-[#52525B]")}>Afrotalia</span>
        <span
          className={cn("text-[16px] font-extrabold", dark ? "text-brand-amber-400" : "text-brand-amber-600")}
        >
          Mnada
        </span>
      </span>
    </span>
  );
}
