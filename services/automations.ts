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

// ===========================================================================
// City-First Grade Automation API Methods
// ===========================================================================

export function getAvailableCities(
  signal?: AbortSignal,
): Promise<import("@/types/api").CityStatListResponse> {
  return get<import("@/types/api").CityStatListResponse>("/automations/cities", { signal });
}

export function getCityStats(
  city: string,
  signal?: AbortSignal,
): Promise<import("@/types/api").CityGradeStatsResponse> {
  return get<import("@/types/api").CityGradeStatsResponse>("/automations/city-stats", {
    params: { city },
    signal,
  });
}

export function generateAITemplates(
  city: string,
  industry?: string,
): Promise<import("@/types/api").AIGradeTemplatesResponse> {
  return post<import("@/types/api").AIGradeTemplatesResponse>(
    "/automations/generate-templates",
    { city, industry },
  );
}

export function generateSingleTemplate(
  grade: string,
  city: string,
  industry?: string,
): Promise<import("@/types/api").AISingleTemplateResponse> {
  return post<import("@/types/api").AISingleTemplateResponse>(
    "/automations/generate-single-template",
    { grade, city, industry },
  );
}

export function startCityAutomation(
  payload: import("@/types/api").CityAutomationStartInput,
): Promise<import("@/types/api").CityAutomationReportResponse> {
  return post<import("@/types/api").CityAutomationReportResponse>(
    "/automations/start-city-automation",
    payload,
  );
}

export function getCityAutomationRuns(
  page: number = 1,
  pageSize: number = 20,
  signal?: AbortSignal,
): Promise<import("@/types/api").CityAutomationListResponse> {
  return get<import("@/types/api").CityAutomationListResponse>("/automations/runs", {
    params: { page, page_size: pageSize },
    signal,
  });
}

export function getCityAutomationReport(
  id: number,
  signal?: AbortSignal,
): Promise<import("@/types/api").CityAutomationReportResponse> {
  return get<import("@/types/api").CityAutomationReportResponse>(
    `/automations/runs/${id}`,
    { signal },
  );
}

export function cancelCityAutomation(
  id: number,
): Promise<import("@/types/api").CityAutomationReportResponse> {
  return post<import("@/types/api").CityAutomationReportResponse>(
    `/automations/runs/${id}/cancel`,
    undefined,
  );
}

export function resumeCityAutomation(
  id: number,
): Promise<import("@/types/api").CityAutomationReportResponse> {
  return post<import("@/types/api").CityAutomationReportResponse>(
    `/automations/runs/${id}/resume`,
    undefined,
  );
}


