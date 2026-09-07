"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { activitiesApi, queryKeys } from "@/services";

export function useBusinessActivities(businessId?: number, enabled: boolean = true) {
  const pageSize = 20;
  const validId = typeof businessId === "number" && !isNaN(businessId) && businessId > 0;

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: queryKeys.activities.business(validId ? businessId! : 0),
    queryFn: ({ pageParam = 1, signal }) =>
      activitiesApi.getBusinessActivities(businessId!, pageParam, pageSize, undefined, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentCount = allPages.flatMap((p) => p.items).length;
      if (currentCount < (lastPage.total || 0)) {
        return allPages.length + 1;
      }
      return undefined;
    },
    enabled: enabled && validId,
    staleTime: 10_000,
  });

  const allActivities = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return {
    activities: allActivities,
    total,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasMore: Boolean(hasNextPage),
    loadMore: () => void fetchNextPage(),
    error,
    refetch,
  };
}

