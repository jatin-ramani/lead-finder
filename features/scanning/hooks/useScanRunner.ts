"use client";

import { App } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { errorTitle, isApiError, queryKeys, scanningApi } from "@/services";
import type { LatestScanJob, ScanRequest } from "@/types/api";

import { isPaused, isRunning } from "./useScanJobs";

export interface ScanAttempt {
  city: string;
  category: string;
  radius_km?: number;
}

export function useScanRunner(job: LatestScanJob | undefined) {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  const [lastAttempt, setLastAttempt] = useState<ScanAttempt | null>(null);
  const [watching, setWatching] = useState(false);

  const previousStatus = useRef<string | undefined>(undefined);

  const invalidateAfterScan = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.scanJobs.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.scanJobs.latest() });
  }, [queryClient]);

  // Start continuous scan mutation
  const mutation = useMutation({
    mutationFn: (body: ScanRequest) => scanningApi.startScan(body),

    onMutate: (body) => {
      setLastAttempt(body);
      setWatching(true);
      void queryClient.invalidateQueries({ queryKey: queryKeys.scanJobs.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.scanJobs.latest() });
    },

    onSuccess: (data) => {
      notification.info({
        title: "Continuous scan started",
        description: `Scanning ${data.city} across ${data.total_cells} multi-cell geographic areas...`,
        duration: 4,
      });
      invalidateAfterScan();
    },

    onError: (error) => {
      const apiError = isApiError(error) ? error : null;

      if (apiError?.code === "TIMEOUT") {
        notification.info({
          title: "Still scanning in background",
          description: "The scan is taking longer than usual, but continues running. Results will update automatically.",
          duration: 8,
        });
        setWatching(true);
      } else {
        notification.error({
          title: apiError ? errorTitle(apiError) : "Scan initiation failed",
          description: apiError?.message ?? "The scan could not be started.",
          duration: 8,
        });
        setWatching(false);
      }

      void queryClient.invalidateQueries({ queryKey: queryKeys.scanJobs.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.scanJobs.latest() });
    },
  });

  // Pause mutation
  const pauseMutation = useMutation({
    mutationFn: (jobId: number) => scanningApi.pauseScan(jobId),
    onSuccess: () => {
      notification.info({
        title: "Scan paused",
        description: "Scanning paused. You can resume at any time.",
        duration: 3,
      });
      invalidateAfterScan();
    },
    onError: (err) => {
      notification.error({
        title: "Failed to pause scan",
        description: isApiError(err) ? err.message : "An error occurred.",
      });
    },
  });

  // Resume mutation
  const resumeMutation = useMutation({
    mutationFn: (jobId: number) => scanningApi.resumeScan(jobId),
    onSuccess: () => {
      notification.success({
        title: "Scan resumed",
        description: "Continuous scan resumed from next pending cell.",
        duration: 3,
      });
      invalidateAfterScan();
    },
    onError: (err) => {
      notification.error({
        title: "Failed to resume scan",
        description: isApiError(err) ? err.message : "An error occurred.",
      });
    },
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: (jobId: number) => scanningApi.cancelScan(jobId),
    onSuccess: () => {
      notification.warning({
        title: "Scan cancelled",
        description: "Scan cancelled. All discovered leads remain safely stored.",
        duration: 4,
      });
      invalidateAfterScan();
    },
    onError: (err) => {
      notification.error({
        title: "Failed to cancel scan",
        description: isApiError(err) ? err.message : "An error occurred.",
      });
    },
  });

  // Clear all scanned data mutation
  const clearDataMutation = useMutation({
    mutationFn: (confirm: boolean) => scanningApi.clearScannedData(confirm),
    onSuccess: (data) => {
      notification.success({
        title: "Scanned leads cleared",
        description: `Successfully removed ${data.deleted_count} leads and reset search history.`,
        duration: 5,
      });
      invalidateAfterScan();
    },
    onError: (err) => {
      notification.error({
        title: "Failed to clear data",
        description: isApiError(err) ? err.message : "Could not clear data.",
      });
    },
  });

  useEffect(() => {
    const status = job?.status;
    const wasRunning = isRunning(previousStatus.current);

    previousStatus.current = status;


    if (!wasRunning || isRunning(status) || isPaused(status)) return;

    if (status === "Completed") {
      notification.success({
        title: "Continuous scan completed",
        description: `Finished scanning ${job?.city}! Stored: ${job?.businesses_stored ?? job?.new_businesses ?? 0}, Skipped (no contact): ${job?.businesses_skipped_no_contact ?? 0}.`,
        duration: 6,
      });
      invalidateAfterScan();
    } else if (status === "Failed") {
      notification.error({
        title: "Scan failed",
        description: job?.error_message || "The scan encountered an issue.",
        duration: 8,
      });
    }
  }, [job, notification, invalidateAfterScan]);

  const terminal = job?.status === "Completed" || job?.status === "Failed" || job?.status === "Cancelled";
  const scanning = mutation.isPending || isRunning(job?.status);
  const paused = isPaused(job?.status);
  const activeWatching = watching && !terminal;

  const retry = useCallback(() => {
    if (lastAttempt) mutation.mutate(lastAttempt);
  }, [lastAttempt, mutation]);

  return {
    start: mutation.mutate,
    retry,
    canRetry: lastAttempt !== null && !scanning && !paused,
    lastAttempt,
    scanning,
    paused,
    watching: activeWatching,
    error: mutation.error,
    pauseScan: (jobId: number) => pauseMutation.mutate(jobId),
    resumeScan: (jobId: number) => resumeMutation.mutate(jobId),
    cancelScan: (jobId: number) => cancelMutation.mutate(jobId),
    clearData: (confirm: boolean) => clearDataMutation.mutateAsync(confirm),
    isClearing: clearDataMutation.isPending,
    isPausing: pauseMutation.isPending,
    isResuming: resumeMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
}
