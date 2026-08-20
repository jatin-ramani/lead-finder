"use client";

import { useQuery } from "@tanstack/react-query";

import { businessesApi, queryKeys } from "@/services";

export function useCitySummaries() {
  const result = useQuery({
    queryKey: queryKeys.businesses.cities(),
    queryFn: ({ signal }) => businessesApi.getCitySummaries(signal),
  });

  return {
    cities: result.data ?? [],
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    error: result.error,
    refetch: result.refetch,
  };
}
