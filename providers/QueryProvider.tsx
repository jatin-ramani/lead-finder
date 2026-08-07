"use client";

import { App } from "antd";
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { ApiError, ErrorCode, errorTitle, isApiError } from "@/services";

/**
 * How long a fetched result is considered current.
 *
 * 30s suits this data: businesses change only when a scan or scrape runs, and
 * both invalidate their caches explicitly when they finish. The window exists
 * so navigating between pages does not refetch everything.
 */
const STALE_TIME_MS = 30_000;

const MAX_RETRIES = 2;

/**
 * Retries only what retrying can fix.
 *
 * A 404 or a 422 fails identically every time — retrying wastes the user's
 * time and triples the server's log noise. A dropped connection or a 502 from
 * Geoapify genuinely might not.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  if (!isApiError(error)) return false;

  return error.isRetryable;
}

function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  return new ApiError({
    message: error instanceof Error ? error.message : "Unknown error.",
    code: ErrorCode.INTERNAL_ERROR,
  });
}

/**
 * Owns the query client and the one global mutation-error handler.
 *
 * Queries deliberately have no global handler: a failed read belongs inline,
 * beside the thing that failed, where the component can offer a retry with
 * context. A failed *write* is different — the user pressed a button and needs
 * an answer wherever they happen to be, so it surfaces as a notification here
 * instead of being re-implemented in every mutation.
 */
export default function QueryProvider({ children }: { children: ReactNode }) {
  const { notification } = App.useApp();

  // Built once per browser session, inside state so React's strict-mode double
  // render cannot create two clients and split the cache in half.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            // A mutation that declares its own onError has opted out — a 409
            // that links to the running job, say, or a form that maps field
            // errors onto inputs.
            if (mutation.options.onError) return;

            const apiError = toApiError(error);

            notification.error({
              message: errorTitle(apiError),
              // The request id is the whole point of the error envelope: it
              // matches the server log line for this exact request.
              description: apiError.requestId
                ? `${apiError.message}\n\nReference: ${apiError.requestId}`
                : apiError.message,
              duration: 6,
              style: { whiteSpace: "pre-line" },
            });
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME_MS,
            retry: shouldRetry,
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8_000),
            // Refetching on every window focus is the wrong default here:
            // nothing changes unless a job runs, and job views poll on purpose.
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            // Never automatic. A retried POST /scan is a second scan; a retried
            // delete is a confusing second 404. Callers retry explicitly.
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
