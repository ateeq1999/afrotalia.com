import { Minus, Plus } from "lucide-react";

import { cn } from "@afrotalia/ui/lib/utils";

interface QuantityStepperProps {
  quantity: number;
  max: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}

export default function QuantityStepper({ quantity, max, onChange, disabled }: QuantityStepperProps) {
  const atMin = quantity <= 1;
  const atMax = quantity >= max;

  return (
    <div
      role="group"
      aria-label="Quantity"
      className="inline-flex h-11 items-stretch overflow-hidden rounded-lg border border-hairline"
    >
      <button
        type="button"
        disabled={disabled || atMin}
        onClick={() => onChange(quantity - 1)}
        aria-label="Decrease quantity"
        className={cn(
          "flex w-11 items-center justify-center text-muted-ink transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-700",
          disabled || atMin ? "cursor-not-allowed opacity-40" : "hover:bg-surface-muted hover:text-ink",
        )}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="flex w-11 items-center justify-center text-[14px] font-semibold tabular-nums text-ink">
        {quantity}
      </span>
      <button
        type="button"
        disabled={disabled || atMax}
        onClick={() => onChange(quantity + 1)}
        aria-label="Increase quantity"
        className={cn(
          "flex w-11 items-center justify-center text-muted-ink transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-700",
          disabled || atMax ? "cursor-not-allowed opacity-40" : "hover:bg-surface-muted hover:text-ink",
        )}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
