import { useCallback, useEffect, useRef, useState } from "react";

import { fetchMyBids, type MyBid } from "./my-bids";

/**
 * Loads the current user's bids. Silent background revalidation keeps the
 * `currentBid` values fresh (realtime-ready: a future WS/SSE feed can
 * replace/merge into the same `MyBid[]` state).
 */
export function useMyBids() {
  const [bids, setBids] = useState<MyBid[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async (silent: boolean) => {
    try {
      const rows = await fetchMyBids();
      if (mounted.current) {
        setBids(rows);
        setError(null);
      }
    } catch {
      if (mounted.current && !silent) {
        setError("Unable to load your bids.");
      }
    }
  }, []);

  useEffect(() => {
    setBids(null);
    setError(null);
    void load(false);
    const id = window.setInterval(() => void load(true), 30000);
    return () => window.clearInterval(id);
  }, [load, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { bids, error, retry, loading: bids === null && error === null };
}
