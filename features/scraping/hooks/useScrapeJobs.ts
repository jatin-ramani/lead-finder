"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { queryKeys, scrapingApi } from "@/services";
import type { ScrapeJob } from "@/types/api";

const RUNNING_POLL_MS = 1_500;

export function isScrapeRunning(status: string | undefined): boolean {
  return status === "Running" || status === "Pending";
}

export interface ScrapeJobStats {
  totalJobs: number;
  completed: number;
  failed: number;
  totalWebsites: number;
  processed: number;
  success: number;
}

export function useScrapeJobs() {
  const query = useQuery({
    queryKey: queryKeys.scrapeJobs.list(),
    queryFn: ({ signal }) => scrapingApi.listScrapeJobs(signal),
    refetchInterval: (q) => {
      const jobs = q.state.data as ScrapeJob[] | undefined;
      return jobs?.some((job) => isScrapeRunning(job.status)) ? RUNNING_POLL_MS : false;
    },
  });

  const jobs = useMemo(() => query.data ?? [], [query.data]);

  const stats = useMemo<ScrapeJobStats>(
    () => ({
      totalJobs: jobs.length,
      completed: jobs.filter((j) => j.status === "Completed").length,
      failed: jobs.filter((j) => j.status === "Failed").length,
      totalWebsites: jobs.reduce((sum, j) => sum + (j.total_websites ?? 0), 0),
      processed: jobs.reduce((sum, j) => sum + (j.completed ?? 0), 0),
      success: jobs.reduce((sum, j) => sum + (j.success ?? 0), 0),
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

export function useScrapeJob(id: number | null) {
  const query = useQuery({
    queryKey: id !== null ? queryKeys.scrapeJobs.detail(id) : ["scrapeJobs", "null"],
    queryFn: ({ signal }) => (id !== null ? scrapingApi.getScrapeJob(id, signal) : Promise.reject("No id")),
    enabled: id !== null,
    refetchInterval: (q) => {
      const job = q.state.data as ScrapeJob | undefined;
      return isScrapeRunning(job?.status) ? RUNNING_POLL_MS : false;
    },
    staleTime: 0,
  });

  return {
    job: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
