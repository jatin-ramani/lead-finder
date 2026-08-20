"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { queryKeys, scrapingApi } from "@/services";
import type { ScrapeJobResultsQuery, ScrapeJobResultsResponse } from "@/types/api";

export function useScrapeJobResults(jobId: number | null) {
  const [query, setQuery] = useState<ScrapeJobResultsQuery>({
    page: 1,
    pageSize: 20,
    status: undefined,
    city: undefined,
    search: undefined,
  });

  const result = useQuery<ScrapeJobResultsResponse>({
    queryKey: queryKeys.scrapeJobs.results(jobId ?? 0, query as Record<string, unknown>),
    queryFn: ({ signal }) => {
      if (!jobId) {
        return Promise.reject(new Error("No job ID provided"));
      }
      return scrapingApi.getScrapeJobResults(jobId, query, signal);
    },
    enabled: jobId !== null && jobId > 0,
    placeholderData: keepPreviousData,
  });

  const setPage = (page: number, pageSize?: number) => {
    setQuery((prev) => ({
      ...prev,
      page,
      ...(pageSize !== undefined ? { pageSize } : {}),
    }));
  };

  const setStatus = (status: string | undefined) => {
    setQuery((prev) => ({ ...prev, status, page: 1 }));
  };

  const setCity = (city: string | undefined) => {
    setQuery((prev) => ({ ...prev, city, page: 1 }));
  };

  const setSearch = (search: string | undefined) => {
    setQuery((prev) => ({ ...prev, search: search?.trim() || undefined, page: 1 }));
  };

  const resetFilters = () => {
    setQuery({
      page: 1,
      pageSize: 20,
      status: undefined,
      city: undefined,
      search: undefined,
    });
  };

  return {
    results: result.data?.data ?? [],
    pagination: result.data?.pagination,
    summary: result.data?.summary,
    cities: result.data?.cities ?? [],
    query,
    isLoading: result.isLoading,
    isRefetching: result.isFetching && !result.isLoading,
    error: result.error,
    refetch: result.refetch,
    setPage,
    setStatus,
    setCity,
    setSearch,
    resetFilters,
  };
}
