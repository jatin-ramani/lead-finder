import { del, get, patch, post } from "./http";
import type {
  FollowUpCreateInput,
  FollowUpFilterParams,
  FollowUpListResponse,
  FollowUpSingleResponse,
  FollowUpUpdateInput,
} from "@/types/api";

export function getBusinessFollowUps(
  businessId: number,
  params?: FollowUpFilterParams,
  signal?: AbortSignal,
): Promise<FollowUpListResponse> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 20,
  };
  if (params?.status) queryParams.status = params.status;
  if (params?.priority) queryParams.priority = params.priority;
  if (typeof params?.overdue === "boolean") queryParams.overdue = params.overdue;

  return get<FollowUpListResponse>(`/businesses/${businessId}/follow-ups`, {
    params: queryParams,
    signal,
  });
}

export function getAllFollowUps(
  params?: FollowUpFilterParams,
  signal?: AbortSignal,
): Promise<FollowUpListResponse> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 20,
  };
  if (params?.business_id) queryParams.business_id = params.business_id;
  if (params?.status) queryParams.status = params.status;
  if (params?.priority) queryParams.priority = params.priority;
  if (typeof params?.overdue === "boolean") queryParams.overdue = params.overdue;

  return get<FollowUpListResponse>("/follow-ups", {
    params: queryParams,
    signal,
  });
}

export function getFollowUp(
  followUpId: number,
  signal?: AbortSignal,
): Promise<FollowUpSingleResponse> {
  return get<FollowUpSingleResponse>(`/follow-ups/${followUpId}`, { signal });
}

export function createBusinessFollowUp(
  businessId: number,
  payload: FollowUpCreateInput,
): Promise<FollowUpSingleResponse> {
  return post<FollowUpSingleResponse>(`/businesses/${businessId}/follow-ups`, payload);
}

export function updateFollowUp(
  followUpId: number,
  payload: FollowUpUpdateInput,
): Promise<FollowUpSingleResponse> {
  return patch<FollowUpSingleResponse>(`/follow-ups/${followUpId}`, payload);
}

export function completeFollowUp(
  followUpId: number,
): Promise<FollowUpSingleResponse> {
  return post<FollowUpSingleResponse>(`/follow-ups/${followUpId}/complete`, {});
}

export function cancelFollowUp(
  followUpId: number,
): Promise<FollowUpSingleResponse> {
  return post<FollowUpSingleResponse>(`/follow-ups/${followUpId}/cancel`, {});
}

export function deleteFollowUp(
  followUpId: number,
): Promise<{ success: boolean; message: string }> {
  return del<{ success: boolean; message: string }>(`/follow-ups/${followUpId}`);
}
