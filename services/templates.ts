import { del, get, patch, post } from "./http";
import type {
  SupportedVariable,
  TemplateCreateInput,
  TemplateListResponse,
  TemplatePreviewRequest,
  TemplatePreviewResponse,
  TemplateSingleResponse,
  TemplateUpdateInput,
} from "@/types/api";

export interface TemplateFilterParams {
  search?: string;
  is_archived?: boolean;
  page?: number;
  page_size?: number;
}

export function getTemplates(
  params?: TemplateFilterParams,
  signal?: AbortSignal,
): Promise<TemplateListResponse> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 20,
  };
  if (typeof params?.is_archived === "boolean") queryParams.is_archived = params.is_archived;
  if (params?.search) queryParams.search = params.search;

  return get<TemplateListResponse>("/templates", {
    params: queryParams,
    signal,
  });
}

export function getTemplate(
  templateId: number,
  signal?: AbortSignal,
): Promise<TemplateSingleResponse> {
  return get<TemplateSingleResponse>(`/templates/${templateId}`, { signal });
}

export function getTemplateVariables(
  signal?: AbortSignal,
): Promise<SupportedVariable[]> {
  return get<SupportedVariable[]>("/templates/variables", { signal });
}

export function createTemplate(
  payload: TemplateCreateInput,
): Promise<TemplateSingleResponse> {
  return post<TemplateSingleResponse>("/templates", payload);
}

export function updateTemplate(
  templateId: number,
  payload: TemplateUpdateInput,
): Promise<TemplateSingleResponse> {
  return patch<TemplateSingleResponse>(`/templates/${templateId}`, payload);
}

export function toggleTemplateArchive(
  templateId: number,
  is_archived: boolean,
): Promise<TemplateSingleResponse> {
  return post<TemplateSingleResponse>(`/templates/${templateId}/archive`, { is_archived });
}

export function deleteTemplate(
  templateId: number,
): Promise<void> {
  return del<void>(`/templates/${templateId}`);
}

export function previewTemplate(
  payload: TemplatePreviewRequest,
): Promise<TemplatePreviewResponse> {
  return post<TemplatePreviewResponse>("/templates/preview", payload);
}
