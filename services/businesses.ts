/** `GET|DELETE /businesses`, its detail routes, and the CSV exports. */

import { del, delWithBody, download, get, post } from "./http";
import type {
  BulkBusinessRequest,
  Business,
  BusinessListResponse,
  BusinessQuery,
  DeletedCountResponse,
  DetailResponse,
  JobStartedResponse,
  MessageResponse,
  WebsiteData,
  WebsiteDataResponse,
} from "@/types/api";

/** `GET /businesses` — the paginated list. */
export function listBusinesses(
  query: BusinessQuery,
  signal?: AbortSignal,
): Promise<BusinessListResponse> {
  return get<BusinessListResponse>("/businesses", { params: query, signal });
}

/** `GET /businesses/{id}` — 404s when the id is unknown. */
export function getBusiness(
  id: number,
  signal?: AbortSignal,
): Promise<Business> {
  return get<Business>(`/businesses/${id}`, { signal });
}

/** `DELETE /businesses/{id}` — 404s when the id is unknown. */
export function deleteBusiness(id: number): Promise<MessageResponse> {
  return del<MessageResponse>(`/businesses/${id}`);
}

/**
 * `DELETE /businesses` — bulk.
 *
 * Idempotent by design: duplicates and unknown ids are ignored rather than
 * rejected, so a partly stale selection still deletes whatever remains valid
 * and reports how many actually went.
 */
export function deleteBusinesses(
  ids: number[],
): Promise<DeletedCountResponse> {
  const body: BulkBusinessRequest = { business_ids: ids };
  return delWithBody<DeletedCountResponse>("/businesses", body);
}

/** `GET /businesses/export/csv` — every row matching the filters, not just the page. */
export function exportBusinessesCsv(query: BusinessQuery) {
  return download("/businesses/export/csv", { params: query });
}

/** `POST /businesses/export/csv` — only the chosen rows. */
export function exportSelectedBusinessesCsv(ids: number[]) {
  const body: BulkBusinessRequest = { business_ids: ids };
  return download("/businesses/export/csv", { method: "post", body });
}

/** `GET /businesses/{id}/website` — 404s until the business has been scraped. */
export function getWebsiteData(
  id: number,
  signal?: AbortSignal,
): Promise<WebsiteData> {
  return get<WebsiteDataResponse>(`/businesses/${id}/website`, {
    signal,
  }).then((response: DetailResponse<WebsiteData>) => response.data);
}

/** `POST /businesses/{id}/scrape` — synchronous, single site. */
export function scrapeBusiness(id: number): Promise<MessageResponse> {
  return post<MessageResponse>(`/businesses/${id}/scrape`);
}

/**
 * `POST /scrape/selected` — queues a background job for the chosen rows.
 *
 * Lives here rather than in `scraping.ts` because it is driven by a business
 * selection; the other bulk scrapes take no arguments and belong with the job
 * launchers.
 */
export function scrapeSelected(ids: number[]): Promise<JobStartedResponse> {
  const body: BulkBusinessRequest = { business_ids: ids };
  return post<JobStartedResponse>("/scrape/selected", body);
}
