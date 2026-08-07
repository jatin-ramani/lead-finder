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

/**
 * Runs a scan and reports what happened.
 *
 * `POST /scan` is synchronous — it returns when the scan is finished, not when
 * it is queued — which makes the happy path simple and one case awkward:
 *
 * The client times out at 30s. A large city can take longer, and a timeout on
 * this side does not stop the work on the server's. Treating that as a failure
 * would be wrong twice over: it tells the user their scan failed when it is
 * still running, and it hides the businesses that are about to appear.
 *
 * So a timeout is not a failure here. The scan job is already being written,
 * and `useLatestScanJob` is already polling it; this hook simply keeps
 * watching, and reports the outcome when the job reaches a terminal state.
 * The user sees one truthful result either way.
 */
export function useScanRunner() {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const { job } = useLatestScanJob();

  /** The last thing submitted, so a failure can offer to retry it verbatim. */
  const [lastAttempt, setLastAttempt] = useState<ScanAttempt | null>(null);

  /**
   * Set when the request timed out and the job is still being watched. While
   * true, the job's terminal transition — not the request — reports the result.
   *
   * State rather than a ref, deliberately: `scanning` is derived from it and
   * has to re-render when it changes. As a ref the button would stay enabled
   * after a timeout, which is exactly the moment a second scan must not start.
   */
  const [watching, setWatching] = useState(false);

  /** Only ever touched inside the effect below, so a ref is correct here. */
  const previousStatus = useRef<string | undefined>(undefined);

  const invalidateAfterScan = useCallback(() => {
    // New businesses exist, and every count that describes them is now stale.
    void queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.scanJobs.all });
  }, [queryClient]);

  const mutation = useMutation({
    mutationFn: (body: ScanRequest) => scanningApi.startScan(body),

    onMutate: (body) => {
      setLastAttempt(body);
      setWatching(false);
      // Pick the new job up immediately rather than waiting for the next tick,
      // so the progress panel appears as soon as the button is pressed.
      void queryClient.invalidateQueries({ queryKey: queryKeys.scanJobs.all });
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

      // The job row was marked "Failed" before the error was returned, so the
      // history must be refreshed to agree with what the user was just told.
      void queryClient.invalidateQueries({ queryKey: queryKeys.scanJobs.all });
    },
  });

  /**
   * Reports the outcome of a scan whose request timed out.
   *
   * Only fires while `watching` is set, so a normal scan is never announced
   * twice — once by the request and once by the job.
   */
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
    /** True from submit until the job reaches a terminal state. */
    scanning,
    error: mutation.error,
  };
}
