import { cn } from "../lib/utils";
import { ToteBagIcon } from "./icons";
import type { BrandMarkProps } from "./AfrotaliaLogo";

/** Afrotalia Shop — mitred tote bag icon, a 2px vertical rule, then the lockup. Light by default. */
export default function AfrotaliaShopLogo({ variant = "light", className }: BrandMarkProps) {
  const dark = variant === "dark";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <ToteBagIcon className={cn("h-5 w-5 shrink-0", dark ? "text-brand-green-300" : "text-brand-green-700")} />
      <span className={cn("h-5 w-0.5 shrink-0", dark ? "bg-dark-hairline" : "bg-hairline")} aria-hidden />
      <span className="flex items-baseline gap-1 leading-none">
        <span className={cn("text-[16px] font-medium", dark ? "text-caption" : "text-[#52525B]")}>Afrotalia</span>
        <span
          className={cn("text-[16px] font-extrabold", dark ? "text-brand-green-300" : "text-brand-green-700")}
        >
          Shop
        </span>
      </span>
    </span>
  );
}
