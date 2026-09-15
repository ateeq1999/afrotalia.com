import { cn } from "@afrotalia/ui/lib/utils";

interface BidInputProps {
  id: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}

export default function BidInput({
  id,
  value,
  placeholder,
  onChange,
  disabled,
  invalid,
}: BidInputProps) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        Custom bid amount in Tanzanian shillings
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-[50px] w-full rounded-lg border bg-[#19191C] px-4",
          "text-[15px] font-semibold tabular-nums text-[#F5F5F5]",
          "placeholder:font-normal placeholder:text-[#5C5C60]",
          "outline-none transition-colors",
          "focus:border-[#FFBF19]/60",
          "disabled:cursor-not-allowed disabled:opacity-50",
          invalid
            ? "border-[#FF5C5C]/60"
            : "border-white/[0.08] hover:border-white/[0.16]",
        )}
      />
    </div>
  );
}
