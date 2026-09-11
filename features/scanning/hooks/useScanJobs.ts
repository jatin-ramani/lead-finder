"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { ErrorCode, isApiError, queryKeys, scanningApi } from "@/services";
import type { LatestScanJob, ScanJob } from "@/types/api";

/**
 * Polling cadence: detail view polls every 2.5s while active,
 * history list refreshes every 4s to reduce mobile CPU and network contention.
 */
const DETAIL_RUNNING_POLL_MS = 2_500;
const HISTORY_RUNNING_POLL_MS = 4_000;

export function isRunning(status: string | undefined): boolean {
  return status === "Running" || status === "Pending";
}

export function isPaused(status: string | undefined): boolean {
  return status === "Paused";
}

export interface ScanStats {
  totalScans: number;
  completed: number;
  failed: number;
  businessesFound: number;
  businessesStored: number;
  businessesSkippedNoContact: number;
  businessesDuplicates: number;
}

/**
 * The full scan history.
 */
export function useScanJobs() {
  const query = useQuery({
    queryKey: queryKeys.scanJobs.list(),
    queryFn: ({ signal }) => scanningApi.listScanJobs(signal),
    refetchInterval: (q) => {
      if (typeof document !== "undefined" && document.hidden) return false;
      const jobs = q.state.data as ScanJob[] | undefined;
      return jobs?.some((job) => isRunning(job.status)) ? HISTORY_RUNNING_POLL_MS : false;
    },
  });

  const jobs = useMemo(() => query.data ?? [], [query.data]);

  const stats = useMemo<ScanStats>(
    () => ({
      totalScans: jobs.length,
      completed: jobs.filter((job) => job.status === "Completed").length,
      failed: jobs.filter((job) => job.status === "Failed").length,
      businessesFound: jobs.reduce((sum, job) => sum + (job.businessesFound ?? job.total_businesses ?? 0), 0),
      businessesStored: jobs.reduce((sum, job) => sum + (job.businessesStored ?? job.new_businesses ?? 0), 0),
      businessesSkippedNoContact: jobs.reduce((sum, job) => sum + (job.businessesSkippedNoContact ?? 0), 0),
      businessesDuplicates: jobs.reduce((sum, job) => sum + (job.businessesDuplicates ?? 0), 0),
    }),
    [jobs],
  );

  return {
    jobs,
    stats,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * The most recent scan job, polled while it is running or paused.
 */
export function useLatestScanJob() {
  const query = useQuery({
    queryKey: queryKeys.scanJobs.latest(),
    queryFn: ({ signal }) => scanningApi.getLatestScanJob(signal),
    refetchInterval: (q) => {
      if (typeof document !== "undefined" && document.hidden) return false;
      const job = q.state.data as LatestScanJob | undefined;
      return isRunning(job?.status) || isPaused(job?.status) ? DETAIL_RUNNING_POLL_MS : false;
    },
    staleTime: 0,
  });

  const isNeverScanned =
    isApiError(query.error) && query.error.code === ErrorCode.NOT_FOUND;

  return {
    job: query.data,
    isNeverScanned,
    isLoading: query.isLoading,
    error: isNeverScanned ? null : query.error,
    refetch: query.refetch,
  };
}

