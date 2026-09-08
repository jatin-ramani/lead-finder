import { del, get, patch, post } from "./http";
import type {
  CampaignCreateInput,
  CampaignFilterCriteria,
  CampaignListResponse,
  CampaignRecipientListResponse,
  CampaignRecipientStatus,
  CampaignSingleResponse,
  CampaignStatus,
  CampaignUpdateInput,
  ProcessDueCampaignsResponse,
  RecipientPreviewResponse,
} from "@/types/api";

export interface CampaignFilterParams {
  status?: CampaignStatus;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface CampaignRecipientFilterParams {
  status?: CampaignRecipientStatus;
  page?: number;
  page_size?: number;
}

export function getCampaigns(
  params?: CampaignFilterParams,
  signal?: AbortSignal,
): Promise<CampaignListResponse> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 20,
  };
  if (params?.status) queryParams.status = params.status;
  if (params?.search) queryParams.search = params.search;

  return get<CampaignListResponse>("/campaigns", {
    params: queryParams,
    signal,
  });
}

export function getCampaign(
  campaignId: number,
  signal?: AbortSignal,
): Promise<CampaignSingleResponse> {
  return get<CampaignSingleResponse>(`/campaigns/${campaignId}`, { signal });
}

export function createCampaign(
  payload: CampaignCreateInput,
): Promise<CampaignSingleResponse> {
  return post<CampaignSingleResponse>("/campaigns", payload);
}

export function updateCampaign(
  campaignId: number,
  payload: CampaignUpdateInput,
): Promise<CampaignSingleResponse> {
  return patch<CampaignSingleResponse>(`/campaigns/${campaignId}`, payload);
}

export function deleteCampaign(
  campaignId: number,
): Promise<void> {
  return del<void>(`/campaigns/${campaignId}`);
}

export function startCampaign(
  campaignId: number,
  batchSize: number = 50,
): Promise<CampaignSingleResponse> {
  return post<CampaignSingleResponse>(`/campaigns/${campaignId}/start`, undefined, {
    params: { batch_size: batchSize },
  });
}

export function cancelCampaign(
  campaignId: number,
): Promise<CampaignSingleResponse> {
  return post<CampaignSingleResponse>(`/campaigns/${campaignId}/cancel`);
}

export function previewCampaignRecipients(
  criteria: CampaignFilterCriteria,
  limit: number = 10,
): Promise<RecipientPreviewResponse> {
  return post<RecipientPreviewResponse>("/campaigns/preview-recipients", criteria, {
    params: { limit },
  });
}

export function getCampaignRecipients(
  campaignId: number,
  params?: CampaignRecipientFilterParams,
  signal?: AbortSignal,
): Promise<CampaignRecipientListResponse> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 20,
  };
  if (params?.status) queryParams.status = params.status;

  return get<CampaignRecipientListResponse>(`/campaigns/${campaignId}/recipients`, {
    params: queryParams,
    signal,
  });
}

export function processDueCampaigns(
  limit: number = 10,
  batchSize: number = 50,
): Promise<ProcessDueCampaignsResponse> {
  return post<ProcessDueCampaignsResponse>("/campaigns/process-due", undefined, {
    params: { limit, batch_size: batchSize },
  });
}
