"use client";

import { App } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import {
  businessesApi,
  errorTitle,
  isApiError,
  queryKeys,
  scrapingApi,
} from "@/services";

import { isScrapeRunning, useScrapeJobs } from "./useScrapeJobs";

export function useScrapeRunner() {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const { jobs } = useScrapeJobs();

  const runningJobInList = jobs.find((j) => isScrapeRunning(j.status));
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const activeJobId = selectedJobId ?? runningJobInList?.id ?? null;

  const invalidateAfterScrape = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.scrapeJobs.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  }, [queryClient]);

  const handleConflictError = useCallback(
    (error: unknown) => {
      if (isApiError(error) && error.code === "CONFLICT") {
        const jobId = error.conflictingJobId;

        notification.info({
          message: "A scrape job is already running.",
          description: jobId
            ? `Job #${jobId} is currently processing businesses.`
            : "Another scraping process is currently active.",
          duration: 8,
          btn: jobId ? (
            <button
              type="button"
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded cursor-pointer transition-colors"
              onClick={() => {
                setSelectedJobId(jobId);
                notification.destroy();
              }}
            >
              View running job
            </button>
          ) : undefined,
        });
        return true;
      }
      return false;
    },
    [notification, setSelectedJobId],
  );

  const scrapeAllMutation = useMutation({
    mutationFn: () => scrapingApi.scrapeAll(),
    onSuccess: (data) => {
      setSelectedJobId(data.job_id);
      notification.success({
        message: "Scrape started",
        description: `Job #${data.job_id} has been queued.`,
        duration: 5,
      });
      invalidateAfterScrape();
    },
    onError: (error) => {
      if (handleConflictError(error)) return;
      const apiErr = isApiError(error) ? error : null;
      notification.error({
        message: apiErr ? errorTitle(apiErr) : "Scrape failed",
        description: apiErr?.message ?? "Failed to start scrape.",
        duration: 8,
      });
    },
  });

  const scrapeMissingMutation = useMutation({
    mutationFn: () => scrapingApi.scrapeMissing(),
    onSuccess: (data) => {
      setSelectedJobId(data.job_id);
      notification.success({
        message: "Scrape started",
        description: `Job #${data.job_id} queued for missing websites.`,
        duration: 5,
      });
      invalidateAfterScrape();
    },
    onError: (error) => {
      if (handleConflictError(error)) return;
      const apiErr = isApiError(error) ? error : null;
      notification.error({
        message: apiErr ? errorTitle(apiErr) : "Scrape failed",
        description: apiErr?.message ?? "Failed to start scrape.",
        duration: 8,
      });
    },
  });

  const retryFailedMutation = useMutation({
    mutationFn: () => scrapingApi.retryFailedScrapes(),
    onSuccess: (data) => {
      setSelectedJobId(data.job_id);
      notification.success({
        message: "Retry started",
        description: `Job #${data.job_id} queued for failed scrapes.`,
        duration: 5,
      });
      invalidateAfterScrape();
    },
    onError: (error) => {
      if (handleConflictError(error)) return;
      const apiErr = isApiError(error) ? error : null;
      notification.error({
        message: apiErr ? errorTitle(apiErr) : "Retry failed",
        description: apiErr?.message ?? "Failed to retry scrapes.",
        duration: 8,
      });
    },
  });

  const scrapeSelectedMutation = useMutation({
    mutationFn: (ids: number[]) => businessesApi.scrapeSelected(ids),
    onSuccess: (data) => {
      setSelectedJobId(data.job_id);
      notification.success({
        message: "Selected scrape started",
        description: `Job #${data.job_id} queued for chosen businesses.`,
        duration: 5,
      });
      invalidateAfterScrape();
    },
    onError: (error) => {
      if (handleConflictError(error)) return;
      const apiErr = isApiError(error) ? error : null;
      notification.error({
        message: apiErr ? errorTitle(apiErr) : "Scrape failed",
        description: apiErr?.message ?? "Failed to scrape selected businesses.",
        duration: 8,
      });
    },
  });

  const scrapeSingleMutation = useMutation({
    mutationFn: (businessId: number) => businessesApi.scrapeBusiness(businessId),
    onSuccess: (_, businessId) => {
      notification.success({
        message: "Website scraped",
        description: "Extracted website information successfully.",
        duration: 5,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.businesses.detail(businessId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.businesses.website(businessId) });
      invalidateAfterScrape();
    },
    onError: (error) => {
      if (handleConflictError(error)) return;
      const apiErr = isApiError(error) ? error : null;
      notification.error({
        message: apiErr ? errorTitle(apiErr) : "Scrape failed",
        description: apiErr?.requestId
          ? `${apiErr.message}\n\nReference: ${apiErr.requestId}`
          : (apiErr?.message ?? "Failed to scrape business website."),
        duration: 8,
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: (jobId: number) => scrapingApi.deleteScrapeJob(jobId),
    onSuccess: (_, jobId) => {
      notification.success({
        message: "Job deleted",
        description: `Scrape job #${jobId} removed from history.`,
        duration: 4,
      });
      if (selectedJobId === jobId) setSelectedJobId(null);
      invalidateAfterScrape();
    },
    onError: (error) => {
      const apiErr = isApiError(error) ? error : null;
      notification.error({
        message: apiErr ? errorTitle(apiErr) : "Delete failed",
        description: apiErr?.message ?? "Could not delete scrape job.",
        duration: 8,
      });
    },
  });

  const isScrapingAny =
    scrapeAllMutation.isPending ||
    scrapeMissingMutation.isPending ||
    retryFailedMutation.isPending ||
    scrapeSelectedMutation.isPending ||
    scrapeSingleMutation.isPending ||
    isScrapeRunning(runningJobInList?.status);

  return {
    activeJobId,
    setSelectedJobId,
    scrapeAll: scrapeAllMutation.mutate,
    scrapeMissing: scrapeMissingMutation.mutate,
    retryFailed: retryFailedMutation.mutate,
    scrapeSelected: scrapeSelectedMutation.mutate,
    scrapeSingle: scrapeSingleMutation.mutate,
    deleteJob: deleteJobMutation.mutate,
    isScrapingAny,
    isPendingLauncher:
      scrapeAllMutation.isPending ||
      scrapeMissingMutation.isPending ||
      retryFailedMutation.isPending ||
      scrapeSelectedMutation.isPending,
  };
}
