"use client";

import { App } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { businessesApi, queryKeys } from "@/services";

/**
 * Writes against the business list.
 *
 * Both deletes invalidate the whole `businesses` tree rather than editing the
 * cache in place. Deliberate: a server-paginated list changes shape when a row
 * is removed — totals shift, rows move between pages, and the page you are on
 * may cease to exist. Splicing an array locally would produce a table that
 * disagrees with its own paginator until the next refetch.
 *
 * The dashboard is invalidated too, because its counts are now wrong.
 */
function useInvalidateBusinesses() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  }, [queryClient]);
}

/** `DELETE /businesses/{id}` */
export function useDeleteBusiness() {
  const { message } = App.useApp();
  const invalidate = useInvalidateBusinesses();

  return useMutation({
    mutationFn: (id: number) => businessesApi.deleteBusiness(id),
    onSuccess: () => {
      message.success("Business deleted");
      invalidate();
    },
    // No onError: the global handler in QueryProvider shows the message and
    // the request id. Declaring one here would silence it.
  });
}

/** `DELETE /businesses` — duplicates and unknown ids are ignored server-side. */
export function useDeleteBusinesses() {
  const { message } = App.useApp();
  const invalidate = useInvalidateBusinesses();

  return useMutation({
    mutationFn: (ids: number[]) => businessesApi.deleteBusinesses(ids),
    onSuccess: (result, ids) => {
      // The server reports what it actually removed, which can be fewer than
      // were selected if someone else deleted one first. Reporting the
      // selection count instead would be a comfortable lie.
      const deleted = result.deleted;

      if (deleted === 0) {
        message.info("Those businesses were already deleted");
      } else if (deleted < ids.length) {
        message.success(
          `Deleted ${deleted} of ${ids.length} — the rest were already gone`,
        );
      } else {
        message.success(
          `Deleted ${deleted} ${deleted === 1 ? "business" : "businesses"}`,
        );
      }

      invalidate();
    },
  });
}
