"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getBusinesses, isCancelled, toErrorMessage } from "@/services/api";
import { computeStats, uniqueValues } from "@/lib/format";
import type { Business, BusinessStats } from "@/types/business";

export const SCAN_BASELINE_KEY = "lead-finder:scan-baseline";

interface ScanBaseline {
  date: string;
  ids: number[];
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * "Found Today" without a backend change.
 *
 * GET /businesses has no `created_at`, so the count is derived client-side: the
 * first successful load of each calendar day snapshots the known business ids,
 * and anything that appears afterwards counts as found today.
 */
function resolveTodayScan(businesses: Business[]): number {
  if (typeof window === "undefined") return 0;

  const ids = businesses.map((business) => business.id);
  const date = todayKey();

  let baseline: ScanBaseline | null = null;
  try {
    const raw = localStorage.getItem(SCAN_BASELINE_KEY);
    if (raw) baseline = JSON.parse(raw) as ScanBaseline;
  } catch {
    baseline = null;
  }

  if (!baseline || baseline.date !== date || !Array.isArray(baseline.ids)) {
    try {
      localStorage.setItem(SCAN_BASELINE_KEY, JSON.stringify({ date, ids }));
    } catch {
      // Storage unavailable — fall through with a zero count.
    }
    return 0;
  }

  const known = new Set(baseline.ids);
  return ids.filter((id) => !known.has(id)).length;
}

export interface BusinessContextValue {
  businesses: Business[];
  stats: BusinessStats;
  cities: string[];
  categories: string[];
  statuses: string[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  /** Re-runs GET /businesses. Awaited by the scanner so it can chain. */
  refresh: () => Promise<void>;
  globalSearch: string;
  setGlobalSearch: (value: string) => void;
}

export const BusinessContext = createContext<BusinessContextValue | null>(null);

/**
 * Reads the shared businesses state. Every consumer gets the same instance, so
 * mounting this in ten components still issues exactly one GET /businesses.
 */
export function useBusinesses(): BusinessContextValue {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusinesses must be used inside <BusinessProvider>.");
  }
  return context;
}

/**
 * Owns the GET /businesses lifecycle. Called once, by <BusinessProvider>;
 * components read the result through useBusinesses() above.
 */
export function useBusinessesData(): BusinessContextValue {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [todayScan, setTodayScan] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [globalSearch, setGlobalSearch] = useState("");

  // Guards against a slow first response overwriting a newer refresh.
  const requestId = useRef(0);

  // Deliberately free of synchronous setState so it is safe to call straight
  // from an effect; every state write happens after the await.
  const load = useCallback(async (signal?: AbortSignal) => {
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;

    try {
      const data = await getBusinesses(signal);
      if (requestId.current !== currentRequest) return;

      setBusinesses(data);
      setTodayScan(resolveTodayScan(data));
      setError(null);
      setLastUpdated(new Date());
    } catch (caught) {
      if (isCancelled(caught)) return;
      if (requestId.current !== currentRequest) return;
      setError(toErrorMessage(caught));
    } finally {
      if (requestId.current === currentRequest) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // `load` suspends on its first await before touching state, so none of its
    // setState calls run synchronously in this effect — the cascading-render
    // case the rule guards against cannot happen here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
  }, [load]);

  return useMemo<BusinessContextValue>(
    () => ({
      businesses,
      stats: computeStats(businesses, todayScan),
      cities: uniqueValues(businesses, "city"),
      categories: uniqueValues(businesses, "category"),
      statuses: uniqueValues(businesses, "status"),
      loading,
      refreshing,
      error,
      lastUpdated,
      refresh,
      globalSearch,
      setGlobalSearch,
    }),
    [
      businesses,
      todayScan,
      loading,
      refreshing,
      error,
      lastUpdated,
      refresh,
      globalSearch,
    ],
  );
}
