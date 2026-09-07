/** `GET /businesses/{id}/activities` — timeline and audit history. */

import { get } from "./http";
import type { BusinessActivityListResponse } from "@/types/api";

export function getBusinessActivities(
  businessId: number,
  page: number = 1,
  pageSize: number = 20,
  activityType?: string,
  signal?: AbortSignal,
): Promise<BusinessActivityListResponse> {
  const params: Record<string, string | number | undefined> = { page, page_size: pageSize };
  if (activityType) {
    params.activity_type = activityType;
  }
  return get<BusinessActivityListResponse>(`/businesses/${businessId}/activities`, {
    params,
    signal,
  });
}
