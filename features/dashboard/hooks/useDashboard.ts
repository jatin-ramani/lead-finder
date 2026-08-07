"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { dashboardApi, queryKeys } from "@/services";
import type { DashboardStats } from "@/types/api";

/**
 * How often the dashboard re-reads itself while work is in flight.
 *
 * Only while a job is running. A dashboard nobody is acting on does not need
 * to poll at all — the numbers cannot change without a scan or a scrape.
 */
const ACTIVE_POLL_MS = 3_000;

function isJobRunning(stats: DashboardStats | undefined): boolean {
  if (!stats) return false;

  return (
    stats.scanJobs.running > 0 ||
    stats.scrapeJobs.running > 0 ||
    stats.latestScanJob?.status === "Running" ||
    stats.latestScrapeJob?.status === "Running"
  );
}

/**
 * Figures the backend does not return, computed from ones it does.
 *
 * Only differences of numbers already in the payload — no client-side
 * aggregation over rows, and nothing that needs data the dashboard does not
 * carry.
 */
export interface DerivedStats {
  /** Websites discovered but never scraped. */
  neverScraped: number;
  /** Share of businesses with no website, 0–100. */
  opportunityShare: number;
  /** Share of discovered websites successfully scraped, 0–100. */
  scrapeSuccessRate: number;
  /** Nothing has been discovered yet — the first-run state. */
  isEmpty: boolean;
  anythingRunning: boolean;
}

export function useDashboard() {
  const query = useQuery({
    queryKey: queryKeys.dashboard.all,
    queryFn: ({ signal }) => dashboardApi.getDashboardStats(signal),
    refetchInterval: (q) =>
      isJobRunning(q.state.data as DashboardStats | undefined)
        ? ACTIVE_POLL_MS
        : false,
  });

  const stats = query.data;

  const derived = useMemo<DerivedStats>(() => {
    if (!stats) {
      return {
        neverScraped: 0,
        opportunityShare: 0,
        scrapeSuccessRate: 0,
        isEmpty: false,
        anythingRunning: false,
      };
    }

    const { business, websiteData } = stats;

    return {
      neverScraped: Math.max(0, business.withWebsite - websiteData.totalScraped),
      opportunityShare:
        business.totalBusinesses > 0
          ? Math.round((business.withoutWebsite / business.totalBusinesses) * 100)
          : 0,
      scrapeSuccessRate:
        websiteData.totalScraped > 0
          ? Math.round((websiteData.completed / websiteData.totalScraped) * 100)
          : 0,
      isEmpty: business.totalBusinesses === 0,
      anythingRunning: isJobRunning(stats),
    };
  }, [stats]);

  return {
    stats,
    derived,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
