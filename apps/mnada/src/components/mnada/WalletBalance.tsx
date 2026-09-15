import { cn } from "@afrotalia/ui/lib/utils";

import { formatTZS } from "@/lib/mnada";

interface WalletBalanceProps {
  balance: number;
}

export default function WalletBalance({ balance }: WalletBalanceProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-[#8F9095]">Your wallet</span>
      <span className="text-[15px] font-bold tabular-nums text-[#F5F5F5]">
        {formatTZS(balance)}
      </span>
    </div>
  );
}

export function WalletPill({ balance }: WalletBalanceProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border border-white/[0.08] bg-[#19191C]",
        "px-3 py-2 text-[12px] font-bold tabular-nums text-[#F5F5F5] sm:text-[13px]",
      )}
    >
      {formatTZS(balance)}
    </span>
  );
}
