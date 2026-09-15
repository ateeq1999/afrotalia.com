import { useMemo } from "react";

import { cn } from "@afrotalia/ui/lib/utils";

import { formatHMS } from "@/lib/mnada";
import { useRemainingSeconds } from "@/lib/use-now";

interface CountdownTimerProps {
  endsAt: number;
  /** Trailing label, e.g. "left". Pass "" for none. */
  suffix?: string;
  className?: string;
  /** "muted" (listings) or "bright" (large white hero timer). */
  tone?: "muted" | "bright";
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
  tone = "muted",
  urgentThresholdSeconds = 600,
}: CountdownTimerProps) {
  const remaining = useRemainingSeconds(endsAt);
  const text = useMemo(() => formatHMS(remaining), [remaining]);
  const urgent = remaining > 0 && remaining <= urgentThresholdSeconds;

  return (
    <span
      role="timer"
      className={cn(
        "tabular-nums",
        urgent
          ? "text-[#FF5C5C]"
          : tone === "bright"
            ? "text-[#F5F5F5]"
            : "text-[#929296]",
        className,
      )}
      aria-label={suffix ? `${text} ${suffix}` : text}
    >
      {text}
      {suffix ? ` ${suffix}` : null}
    </span>
  );
}
