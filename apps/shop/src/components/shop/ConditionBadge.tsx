import { cn } from "@afrotalia/ui/lib/utils";

import { conditionLabel, type ProductCondition } from "@/lib/shop";

const STYLES: Record<ProductCondition, string> = {
  NEW: "border-brand-green-700/25 bg-brand-green-700/10 text-brand-green-700",
  USED: "border-[#E4E4E7] bg-[#F4F4F5] text-[#52525B]",
  NOT_WORKING: "border-[#DC2626]/25 bg-[#DC2626]/10 text-[#DC2626]",
};

export default function ConditionBadge({
  condition,
  isWorking,
  className,
}: {
  condition: ProductCondition;
  isWorking: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase leading-none tracking-[0.8px]",
        STYLES[condition],
        className,
      )}
    >
      {conditionLabel(condition, isWorking)}
    </span>
  );
}
