import { useMemo } from "react";

import { cn } from "@afrotalia/ui/lib/utils";

import { formatHMS } from "@/lib/mnada";
import { useRemainingSeconds } from "@/lib/use-now";

interface CountdownTimerProps {
  endsAt: number;
  /** Trailing label, e.g. "left". */
  suffix?: string;
  className?: string;
  /** Below this threshold (seconds) the timer turns red. */
  urgentThresholdSeconds?: number;
}

/**
 * Reusable live countdown. Updates every second, renders HH:MM:SS,
 * clamps at 00:00:00 and never goes negative.
 */
export default function CountdownTimer({
  endsAt,
  suffix = "left",
  className,
  urgentThresholdSeconds = 600,
}: CountdownTimerProps) {
  const remaining = useRemainingSeconds(endsAt);
  const text = useMemo(() => formatHMS(remaining), [remaining]);
  const urgent = remaining > 0 && remaining <= urgentThresholdSeconds;

  return (
    <span
      className={cn(
        "tabular-nums",
        urgent ? "text-[#FF5C5C]" : "text-[#929296]",
        className,
      )}
      aria-label={`${text} ${suffix}`}
    >
      {text}
      {suffix ? ` ${suffix}` : null}
    </span>
  );
}
