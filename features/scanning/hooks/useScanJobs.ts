"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { ErrorCode, isApiError, queryKeys, scanningApi } from "@/services";
import type { LatestScanJob, ScanJob } from "@/types/api";

/**
 * How often a running scan is re-read.
 *
 * 1.5s: a scan of a single city finishes in a few seconds, so anything slower
 * would show one frame of progress and then the result.
 */
const RUNNING_POLL_MS = 1_500;

export function isRunning(status: string | undefined): boolean {
  return status === "Running" || status === "Pending";
}

export interface ScanStats {
  totalScans: number;
  completed: number;
  failed: number;
  /**
   * Businesses returned by the provider, summed over every scan.
   *
   * Not a count of distinct businesses — scanning the same city twice returns
   * the same places twice. Labelled "results returned" in the UI for exactly
   * that reason.
   */
  resultsReturned: number;
  /** Rows actually inserted, i.e. those not already known. */
  newBusinesses: number;
}

/**
 * The full scan history.
 *
 * `GET /scan/jobs` is unpaginated and takes no parameters, so this really is
 * every job — which is what makes summing it honest rather than a partial
 * aggregate of whatever page happened to be loaded.
 */
export function useScanJobs() {
  const query = useQuery({
    queryKey: queryKeys.scanJobs.list(),
    queryFn: ({ signal }) => scanningApi.listScanJobs(signal),
    // Keep the history live while a scan is running so a new row and its
    // progress appear without the user doing anything.
    refetchInterval: (q) => {
      const jobs = q.state.data as ScanJob[] | undefined;
      return jobs?.some((job) => isRunning(job.status)) ? RUNNING_POLL_MS : false;
    },
  });

  const jobs = useMemo(() => query.data ?? [], [query.data]);

  const stats = useMemo<ScanStats>(
    () => ({
      totalScans: jobs.length,
      completed: jobs.filter((job) => job.status === "Completed").length,
      failed: jobs.filter((job) => job.status === "Failed").length,
      resultsReturned: jobs.reduce((sum, job) => sum + (job.total_businesses ?? 0), 0),
      newBusinesses: jobs.reduce((sum, job) => sum + (job.new_businesses ?? 0), 0),
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
 * The most recent scan job, polled only while it is running.
 *
 * `GET /scan/jobs/latest` answers 404 before the first scan has ever run. That
 * is not an error — it is the empty state — so it is translated here rather
 * than left for every consumer to special-case.
 */
export function useLatestScanJob() {
  const query = useQuery({
    queryKey: queryKeys.scanJobs.latest(),
    queryFn: ({ signal }) => scanningApi.getLatestScanJob(signal),
    // Polling stops the moment the job reaches a terminal state. `false` is
    // what ends it — there is no timer left running behind a finished scan.
    refetchInterval: (q) => {
      const job = q.state.data as LatestScanJob | undefined;
      return isRunning(job?.status) ? RUNNING_POLL_MS : false;
    },
    // A running job's progress is worthless if it is served from cache.
    staleTime: 0,
  });

  const isNeverScanned =
    isApiError(query.error) && query.error.code === ErrorCode.NOT_FOUND;

  return {
    job: query.data,
    /** True when no scan has ever been run — an empty state, not a failure. */
    isNeverScanned,
    isLoading: query.isLoading,
    /** A genuine failure; the 404 empty state is excluded. */
    error: isNeverScanned ? null : query.error,
    refetch: query.refetch,
  };
}
