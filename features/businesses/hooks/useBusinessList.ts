"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { businessesApi, queryKeys } from "@/services";
import type { BusinessQuery } from "@/types/api";

/**
 * A page of businesses.
 *
 * `keepPreviousData` is the whole reason this reads well: without it, changing
 * page or sort unmounts the table, drops back to the skeleton, and the page
 * height collapses and springs back. With it the current rows stay on screen,
 * dimmed, until the next page arrives — so paging feels like moving through one
 * table rather than reloading a new one each time.
 */
export function useBusinessList(query: BusinessQuery) {
  const result = useQuery({
    queryKey: queryKeys.businesses.list(query),
    queryFn: ({ signal }) => businessesApi.listBusinesses(query, signal),
    placeholderData: keepPreviousData,
  });

  return {
    businesses: result.isError ? [] : (result.data?.data ?? []),
    pagination: result.isError ? undefined : result.data?.pagination,

    /** First load only — there is nothing on screen yet. */
    isLoading: result.isLoading,
    /** A refetch with rows already showing; dim them, never unmount them. */
    isRefetching: result.isFetching && !result.isLoading,
    /** The rows on screen belong to the previous query, not the current one. */
    isPreviousData: result.isPlaceholderData,

    error: result.error,
    refetch: result.refetch,
  };
}
