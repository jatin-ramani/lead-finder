"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";

import { automationsApi, queryKeys } from "@/services";
import { isApiError } from "@/services/errors";
import type {
  AutomationCreateInput,
  AutomationFilterParams,
  AutomationUpdateInput,
  ExecutionFilterParams,
} from "@/types/api";

export function useAutomations(params?: AutomationFilterParams) {
  return useQuery({
    queryKey: queryKeys.automations.list(params as Record<string, unknown>),
    queryFn: ({ signal }) => automationsApi.getAutomations(params, signal),
    staleTime: 10_000,
  });
}

export function useAutomation(automationId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.automations.detail(automationId),
    queryFn: ({ signal }) => automationsApi.getAutomation(automationId, signal),
    enabled: Boolean(enabled && automationId > 0),
    staleTime: 10_000,
  });
}

export function useTemplateVariables() {
  return useQuery({
    queryKey: queryKeys.automations.variables(),
    queryFn: ({ signal }) => automationsApi.getTemplateVariables(signal),
    staleTime: 60_000,
  });
}

export function useExecutions(params?: ExecutionFilterParams) {
  return useQuery({
    queryKey: queryKeys.automations.executions(params as Record<string, unknown>),
    queryFn: ({ signal }) => automationsApi.getAllExecutions(params, signal),
    staleTime: 5_000,
  });
}

export function useAutomationExecutions(
  automationId: number,
  params?: ExecutionFilterParams,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: queryKeys.automations.automationExecutions(
      automationId,
      params as Record<string, unknown>,
    ),
    queryFn: ({ signal }) =>
      automationsApi.getAutomationExecutions(automationId, params, signal),
    enabled: Boolean(enabled && automationId > 0),
    staleTime: 5_000,
  });
}

export function useCreateAutomation() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AutomationCreateInput) =>
      automationsApi.createAutomation(payload),
    onSuccess: () => {
      message.success("Automation rule created successfully");
      void queryClient.invalidateQueries({ queryKey: queryKeys.automations.all });
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Failed to create automation";
      message.error(msg);
    },
  });
}

export function useUpdateAutomation() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: AutomationUpdateInput;
    }) => automationsApi.updateAutomation(id, payload),
    onSuccess: (_, vars) => {
      message.success("Automation updated successfully");
      void queryClient.invalidateQueries({ queryKey: queryKeys.automations.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.automations.detail(vars.id),
      });
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Failed to update automation";
      message.error(msg);
    },
  });
}

export function useToggleAutomation() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      automationsApi.toggleAutomation(id, enabled),
    onSuccess: (res) => {
      const statusText = res.data.enabled ? "activated" : "deactivated";
      message.success(`Automation ${statusText}`);
      void queryClient.invalidateQueries({ queryKey: queryKeys.automations.all });
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Failed to toggle automation";
      message.error(msg);
    },
  });
}

export function useDeleteAutomation() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => automationsApi.deleteAutomation(id),
    onSuccess: () => {
      message.success("Automation deleted successfully");
      void queryClient.invalidateQueries({ queryKey: queryKeys.automations.all });
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Failed to delete automation";
      message.error(msg);
    },
  });
}

export function useProcessDueExecutions() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (limit: number = 50) =>
      automationsApi.processDueExecutions(limit),
    onSuccess: (res) => {
      message.success(
        `Processed ${res.processed} execution(s): ${res.sent} sent, ${res.failed} failed, ${res.retried} retried`,
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.automations.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Failed to process due executions";
      message.error(msg);
    },
  });
}
