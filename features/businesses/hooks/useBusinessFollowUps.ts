"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { useState } from "react";

import { followUpsApi, queryKeys } from "@/services";
import { isApiError } from "@/services/errors";
import type {
  FollowUpCreateInput,
  FollowUpPriority,
  FollowUpStatus,
  FollowUpUpdateInput,
} from "@/types/api";

export function useBusinessFollowUps(businessId?: number, enabled: boolean = true) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<FollowUpStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<FollowUpPriority | "all">("all");
  const [overdueFilter, setOverdueFilter] = useState<boolean | null>(null);

  const validId = typeof businessId === "number" && !isNaN(businessId) && businessId > 0;

  const currentStatus = statusFilter === "all" ? undefined : statusFilter;
  const currentPriority = priorityFilter === "all" ? undefined : priorityFilter;
  const currentOverdue = overdueFilter === null ? undefined : overdueFilter;

  const queryKey = queryKeys.followUps.business(
    validId ? businessId! : 0,
    currentStatus,
    currentPriority,
    currentOverdue,
    1,
  );

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: ({ signal }) =>
      followUpsApi.getBusinessFollowUps(
        businessId!,
        {
          status: currentStatus,
          priority: currentPriority,
          overdue: currentOverdue,
          page: 1,
          page_size: 50,
        },
        signal,
      ),
    enabled: Boolean(enabled && validId),
    staleTime: 10_000,
  });

  const invalidateFollowUpQueries = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.followUps.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
  };

  const createMutation = useMutation({
    mutationFn: (input: FollowUpCreateInput) => {
      if (!validId) throw new Error("Invalid business ID");
      return followUpsApi.createBusinessFollowUp(businessId!, input);
    },
    onSuccess: () => {
      message.success("Follow-up scheduled successfully");
      invalidateFollowUpQueries();
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Failed to create follow-up";
      message.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: FollowUpUpdateInput }) =>
      followUpsApi.updateFollowUp(id, input),
    onSuccess: () => {
      message.success("Follow-up updated");
      invalidateFollowUpQueries();
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Failed to update follow-up";
      message.error(msg);
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => followUpsApi.completeFollowUp(id),
    onSuccess: () => {
      message.success("Follow-up marked as completed");
      invalidateFollowUpQueries();
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Failed to complete follow-up";
      message.error(msg);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => followUpsApi.cancelFollowUp(id),
    onSuccess: () => {
      message.success("Follow-up cancelled");
      invalidateFollowUpQueries();
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Failed to cancel follow-up";
      message.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => followUpsApi.deleteFollowUp(id),
    onSuccess: () => {
      message.success("Follow-up deleted");
      invalidateFollowUpQueries();
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Failed to delete follow-up";
      message.error(msg);
    },
  });

  return {
    followUps: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    isFetching,
    error,
    refetch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    overdueFilter,
    setOverdueFilter,
    createFollowUp: createMutation.mutateAsync,
    updateFollowUp: (id: number, input: FollowUpUpdateInput) =>
      updateMutation.mutateAsync({ id, input }),
    completeFollowUp: completeMutation.mutateAsync,
    cancelFollowUp: cancelMutation.mutateAsync,
    deleteFollowUp: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isCompleting: completeMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
