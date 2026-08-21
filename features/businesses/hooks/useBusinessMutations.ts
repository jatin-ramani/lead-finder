"use client";

import { App } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { businessesApi, queryKeys } from "@/services";
import { isApiError } from "@/services/errors";
import type { LeadStatus } from "@/types/api";

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
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Could not delete business";
      message.error(msg);
    },
  });
}

/** `DELETE /businesses` — duplicates and unknown ids are ignored server-side. */
export function useDeleteBusinesses() {
  const { message } = App.useApp();
  const invalidate = useInvalidateBusinesses();

  return useMutation({
    mutationFn: (ids: number[]) => businessesApi.deleteBusinesses(ids),
    onSuccess: (result, ids) => {
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
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Could not delete businesses";
      message.error(msg);
    },
  });
}

/** `PATCH /businesses/{id}/favorite` */
export function useFavoriteBusiness() {
  const { message } = App.useApp();
  const invalidate = useInvalidateBusinesses();

  return useMutation({
    mutationFn: ({ id, is_favorite }: { id: number; is_favorite: boolean }) =>
      businessesApi.favoriteBusiness(id, is_favorite),
    onSuccess: (_data, { is_favorite }) => {
      message.success(is_favorite ? "Added to favorites" : "Removed from favorites");
      invalidate();
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Could not update favorite status";
      message.error(msg);
      invalidate();
    },
  });
}

/** `POST /businesses/favorite/bulk` */
export function useBulkFavoriteBusinesses() {
  const { message } = App.useApp();
  const invalidate = useInvalidateBusinesses();

  return useMutation({
    mutationFn: ({ ids, is_favorite }: { ids: number[]; is_favorite: boolean }) =>
      businessesApi.bulkFavoriteBusinesses(ids, is_favorite),
    onSuccess: (_data, { is_favorite }) => {
      message.success(is_favorite ? "Added selected to favorites" : "Removed selected from favorites");
      invalidate();
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Could not update favorites in bulk";
      message.error(msg);
      invalidate();
    },
  });
}

/** `PATCH /businesses/{id}/status` */
export function useUpdateLeadStatus() {
  const { message } = App.useApp();
  const invalidate = useInvalidateBusinesses();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: LeadStatus }) =>
      businessesApi.updateBusinessLeadStatus(id, status),
    onSuccess: (_data, { status }) => {
      const label = status.replace("_", " ").toUpperCase();
      message.success(`Status updated to ${label}`);
      invalidate();
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Could not update lead status";
      message.error(msg);
      invalidate();
    },
  });
}

/** `POST /businesses/status/bulk` */
export function useBulkUpdateLeadStatus() {
  const { message } = App.useApp();
  const invalidate = useInvalidateBusinesses();

  return useMutation({
    mutationFn: ({ ids, status }: { ids: number[]; status: LeadStatus }) =>
      businessesApi.bulkUpdateLeadStatus(ids, status),
    onSuccess: (result) => {
      const label = result.status.replace("_", " ").toUpperCase();
      message.success(`Updated ${result.updated_count} leads to ${label}`);
      invalidate();
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Could not update status in bulk";
      message.error(msg);
      invalidate();
    },
  });
}
