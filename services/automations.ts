import { del, get, patch, post } from "./http";
import type {
  AutomationCreateInput,
  AutomationFilterParams,
  AutomationListResponse,
  AutomationSingleResponse,
  AutomationUpdateInput,
  ExecutionFilterParams,
  ExecutionListResponse,
  ProcessDueResponse,
  SupportedVariable,
} from "@/types/api";

export function getAutomations(
  params?: AutomationFilterParams,
  signal?: AbortSignal,
): Promise<AutomationListResponse> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 20,
  };
  if (typeof params?.enabled === "boolean") queryParams.enabled = params.enabled;
  if (params?.trigger_type) queryParams.trigger_type = params.trigger_type;

  return get<AutomationListResponse>("/automations", {
    params: queryParams,
    signal,
  });
}

export function getAutomation(
  automationId: number,
  signal?: AbortSignal,
): Promise<AutomationSingleResponse> {
  return get<AutomationSingleResponse>(`/automations/${automationId}`, { signal });
}

export function getTemplateVariables(
  signal?: AbortSignal,
): Promise<SupportedVariable[]> {
  return get<SupportedVariable[]>("/automations/variables", { signal });
}

export function createAutomation(
  payload: AutomationCreateInput,
): Promise<AutomationSingleResponse> {
  return post<AutomationSingleResponse>("/automations", payload);
}

export function updateAutomation(
  automationId: number,
  payload: AutomationUpdateInput,
): Promise<AutomationSingleResponse> {
  return patch<AutomationSingleResponse>(`/automations/${automationId}`, payload);
}

export function toggleAutomation(
  automationId: number,
  enabled: boolean,
): Promise<AutomationSingleResponse> {
  return post<AutomationSingleResponse>(`/automations/${automationId}/toggle`, { enabled });
}

export function deleteAutomation(
  automationId: number,
): Promise<void> {
  return del<void>(`/automations/${automationId}`);
}

export function getAllExecutions(
  params?: ExecutionFilterParams,
  signal?: AbortSignal,
): Promise<ExecutionListResponse> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 20,
  };
  if (params?.automation_id) queryParams.automation_id = params.automation_id;
  if (params?.business_id) queryParams.business_id = params.business_id;
  if (params?.status) queryParams.status = params.status;

  return get<ExecutionListResponse>("/automations/executions", {
    params: queryParams,
    signal,
  });
}

export function getAutomationExecutions(
  automationId: number,
  params?: ExecutionFilterParams,
  signal?: AbortSignal,
): Promise<ExecutionListResponse> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 20,
  };
  if (params?.status) queryParams.status = params.status;

  return get<ExecutionListResponse>(`/automations/${automationId}/executions`, {
    params: queryParams,
    signal,
  });
}

export function processDueExecutions(
  limit: number = 50,
): Promise<ProcessDueResponse> {
  return post<ProcessDueResponse>("/automations/process-due", undefined, {
    params: { limit },
  });
}
