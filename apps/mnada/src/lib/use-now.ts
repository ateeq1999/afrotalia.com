import { useEffect, useState } from "react";

/** Re-renders the caller every `intervalMs` with the current timestamp. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}

/** Seconds remaining until `targetMs`, clamped at zero (never negative). */
export function useRemainingSeconds(targetMs: number, intervalMs = 1000): number {
  const now = useNow(intervalMs);
  return Math.max(0, Math.ceil((targetMs - now) / 1000));
}
