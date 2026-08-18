"use client";

import { App } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { ErrorCode, errorTitle, isApiError, queryKeys, scanningApi } from "@/services";
import type { ScanRequest } from "@/types/api";

import { isRunning, useLatestScanJob } from "./useScanJobs";

export interface ScanAttempt {
  city: string;
  category: string;
}

export function useScanRunner() {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const { job } = useLatestScanJob();

  const [lastAttempt, setLastAttempt] = useState<ScanAttempt | null>(null);
  const [watching, setWatching] = useState(false);

  const previousStatus = useRef<string | undefined>(undefined);

  const invalidateAfterScan = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.scanJobs.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.scanJobs.latest() });
  }, [queryClient]);

  const mutation = useMutation({
    mutationFn: (body: ScanRequest) => scanningApi.startScan(body),

    onMutate: (body) => {
      setLastAttempt(body);
      setWatching(false);
      void queryClient.invalidateQueries({ queryKey: queryKeys.scanJobs.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.scanJobs.latest() });
    },

    onSuccess: () => {
      notification.success({
        message: "Scan completed",
        description: "Any new businesses have been added to your workspace.",
        duration: 5,
      });
      invalidateAfterScan();
    },

    onError: (error) => {
      if (isApiError(error) && error.code === ErrorCode.TIMEOUT) {
        setWatching(true);

        notification.info({
          message: "Still scanning",
          description:
            "This is taking longer than usual. Progress is shown below and the result will appear when it finishes.",
          duration: 6,
        });

        void queryClient.invalidateQueries({ queryKey: queryKeys.scanJobs.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.scanJobs.latest() });
        return;
      }

      const apiError = isApiError(error) ? error : null;

      notification.error({
        message: apiError ? errorTitle(apiError) : "Scan failed",
        description: apiError?.requestId
          ? `${apiError.message}\n\nReference: ${apiError.requestId}`
          : (apiError?.message ?? "The scan could not be completed."),
        duration: 8,
        style: { whiteSpace: "pre-line" },
      });

      void queryClient.invalidateQueries({ queryKey: queryKeys.scanJobs.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.scanJobs.latest() });
    },
  });

  useEffect(() => {
    const status = job?.status;
    const wasRunning = isRunning(previousStatus.current);

    previousStatus.current = status;

    if (!watching) return;
    if (!wasRunning || isRunning(status)) return;

    setWatching(false);

    if (status === "Completed") {
      notification.success({
        message: "Scan completed",
        description: `${job?.totalBusinesses ?? 0} results returned, ${job?.newBusinesses ?? 0} new.`,
        duration: 5,
      });
      invalidateAfterScan();
    } else if (status === "Failed") {
      notification.error({
        message: "Scan failed",
        description:
          "The scan did not finish. See the history below for the job that failed.",
        duration: 8,
      });
    }
  }, [job, watching, notification, invalidateAfterScan]);

  const scanning = mutation.isPending || watching || isRunning(job?.status);

  const retry = useCallback(() => {
    if (lastAttempt) mutation.mutate(lastAttempt);
  }, [lastAttempt, mutation]);

  return {
    start: mutation.mutate,
    retry,
    canRetry: lastAttempt !== null && !scanning,
    lastAttempt,
    scanning,
    watching,
    error: mutation.error,
  };
}
