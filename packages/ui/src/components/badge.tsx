import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

/**
 * Shared status pill. Every app's status badges (Mnada's auction/bid
 * status, Shop's condition/order status) are built from this instead of
 * each hand-rolling its own pill — same shape, same 11px/uppercase/tracked
 * type scale, only the tone changes. `surface` picks the light vs. dark
 * tint math; pass "dark" on Mnada's dark ground.
 */
const badgeVariants = cva(
  "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase leading-none tracking-[0.8px]",
  {
    variants: {
      tone: {
        success: "",
        warning: "",
        danger: "",
        neutral: "",
        info: "",
      },
      surface: {
        light: "",
        dark: "",
      },
    },
    compoundVariants: [
      { tone: "success", surface: "light", class: "border-brand-green-700/25 bg-brand-green-700/10 text-brand-green-700" },
      { tone: "success", surface: "dark", class: "border-[#00D99A]/25 bg-[#00D99A]/10 text-[#00D99A]" },
      { tone: "warning", surface: "light", class: "border-brand-amber-600/25 bg-brand-amber-600/10 text-brand-amber-600" },
      { tone: "warning", surface: "dark", class: "border-brand-amber-400/25 bg-brand-amber-400/10 text-brand-amber-400" },
      { tone: "danger", surface: "light", class: "border-danger/25 bg-danger/10 text-danger" },
      { tone: "danger", surface: "dark", class: "border-[#FF5C5C]/25 bg-[#FF5C5C]/10 text-[#FF5C5C]" },
      { tone: "neutral", surface: "light", class: "border-hairline bg-[#F4F4F5] text-[#52525B]" },
      { tone: "neutral", surface: "dark", class: "border-dark-hairline bg-white/[0.06] text-caption" },
      { tone: "info", surface: "light", class: "border-hairline bg-white text-[#52525B]" },
      { tone: "info", surface: "dark", class: "border-dark-hairline bg-white/[0.04] text-caption" },
    ],
    defaultVariants: {
      tone: "neutral",
      surface: "light",
    },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, surface, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ tone, surface, className }))} {...props} />;
}

export { badgeVariants };
