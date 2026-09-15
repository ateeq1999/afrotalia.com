import { cn } from "@afrotalia/ui/lib/utils";

import { formatTZS } from "@/lib/mnada";

interface SuggestedBidButtonsProps {
  suggestions: number[];
  selected: number | null;
  onSelect: (amount: number) => void;
  disabled?: boolean;
}

export default function SuggestedBidButtons({
  suggestions,
  selected,
  onSelect,
  disabled,
}: SuggestedBidButtonsProps) {
  return (
    <div
      role="group"
      aria-label="Suggested bids"
      className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3"
    >
      {suggestions.map((amount) => {
        const active = selected === amount;
        return (
          <button
            key={amount}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(amount)}
            aria-pressed={active}
            className={cn(
              "h-11 rounded-lg border px-2 text-[13px] font-semibold tabular-nums transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFBF19]",
              "disabled:cursor-not-allowed disabled:opacity-40",
              active
                ? "border-[#FFBF19]/60 bg-[#FFBF19]/10 text-[#FFBF19]"
                : "border-white/[0.08] bg-[#19191C] text-[#F5F5F5] hover:border-white/[0.2]",
            )}
          >
            {formatTZS(amount)}
          </button>
        );
      })}
    </div>
  );
}
