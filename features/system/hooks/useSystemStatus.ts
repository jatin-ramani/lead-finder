"use client";

import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { queryKeys, systemApi } from "@/services";
import type {
  HealthResponse,
  SystemInfoResponse,
  VersionResponse,
} from "@/types/api";

/**
 * How often the health probe re-runs.
 *
 * 30s: often enough that a backend restart is noticed while someone is
 * looking at the page, rare enough that it is not a load generator. Only
 * `/health` polls — version and runtime facts do not change while the process
 * is alive, so re-fetching them would be noise.
 */
const HEALTH_POLL_MS = 30_000;

export interface SystemStatus {
  health: HealthResponse | undefined;
  version: VersionResponse | undefined;
  info: SystemInfoResponse | undefined;

  /** True only on the very first load, when there is nothing to show yet. */
  isLoading: boolean;
  /** True while any refetch is in flight, including the background poll. */
  isFetching: boolean;

  /** The health probe's own failure — the one that means "API unreachable". */
  healthError: unknown;
  /** Failures of the two informational calls, which degrade rather than block. */
  versionError: unknown;
  infoError: unknown;

  /**
   * Whether the API is answering at all.
   *
   * `/health` returns 503 with a body when the database is down, which arrives
   * as an ApiError — so a failed probe means either "server unreachable" or
   * "database unreachable", and both are genuinely offline for our purposes.
   */
  isOnline: boolean;

  refresh: () => void;
}

/**
 * The three system endpoints, fetched together.
 *
 * `useQueries` rather than three `useQuery` calls so the page has one loading
 * decision and one refresh action instead of three that can disagree. They stay
 * separate cache entries, so a failing `/system` does not blank the version
 * that loaded fine.
 */
export function useSystemStatus(): SystemStatus {
  const queryClient = useQueryClient();

  const results = useQueries({
    queries: [
      {
        queryKey: queryKeys.system.health(),
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          systemApi.getHealth(signal),
        refetchInterval: HEALTH_POLL_MS,
        // A stale "healthy" is misleading; this is the one thing worth
        // re-reading whenever the page is shown.
        staleTime: 0,
      },
      {
        queryKey: queryKeys.system.version(),
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          systemApi.getVersion(signal),
        staleTime: Infinity,
      },
      {
        queryKey: queryKeys.system.info(),
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          systemApi.getSystemInfo(signal),
        staleTime: Infinity,
      },
    ],
  });

  const [health, version, info] = results;

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.system.all });
  }, [queryClient]);

  return {
    health: health.data,
    version: version.data,
    info: info.data,

    isLoading: results.some((result) => result.isLoading),
    isFetching: results.some((result) => result.isFetching),

    healthError: health.error,
    versionError: version.error,
    infoError: info.error,

    isOnline: health.isSuccess && health.data?.status === "healthy",

    refresh,
  };
}
