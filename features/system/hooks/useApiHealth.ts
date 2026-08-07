"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys, systemApi } from "@/services";

/**
 * Is the API reachable and its database answering?
 *
 * Shares `queryKeys.system.health()` with the System page, so mounting this in
 * the sidebar costs no extra request — the cache serves both, and the 30-second
 * poll runs once no matter how many components are watching.
 */
const HEALTH_POLL_MS = 30_000;

export type ApiConnection = "checking" | "online" | "degraded" | "offline";

export interface ApiHealth {
  connection: ApiConnection;
  label: string;
}

export function useApiHealth(): ApiHealth {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.system.health(),
    queryFn: ({ signal }) => systemApi.getHealth(signal),
    refetchInterval: HEALTH_POLL_MS,
    staleTime: 0,
  });

  if (isLoading) return { connection: "checking", label: "Checking…" };

  // `/health` answers 503 when the database is down, which arrives as an
  // ApiError — so a rejected query means unreachable, not merely unhealthy.
  if (isError) return { connection: "offline", label: "Offline" };

  if (data?.status === "healthy" && data.database === "connected") {
    return { connection: "online", label: "Connected" };
  }

  return { connection: "degraded", label: "Degraded" };
}
