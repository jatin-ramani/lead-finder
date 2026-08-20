/**
 * The bulk scrapers and their job records.
 *
 * All four launchers return immediately with a `job_id` and do the work in the
 * background. Only one scrape job may run at a time; starting another while one
 * is in flight answers **409** with the running job's id in `details.job_id`,
 * which `ApiError.conflictingJobId` surfaces so the UI can link straight to it.
 */

import { del, get, post } from "./http";
import type {
  DetailResponse,
  JobStartedResponse,
  MessageResponse,
  ScrapeJob,
  ScrapeJobListResponse,
  ScrapeJobResultsQuery,
  ScrapeJobResultsResponse,
} from "@/types/api";

/** `POST /scrape/all` — every business that has a website. */
export function scrapeAll(): Promise<JobStartedResponse> {
  return post<JobStartedResponse>("/scrape/all");
}

/** `POST /scrape/missing` — only those never scraped. */
export function scrapeMissing(): Promise<JobStartedResponse> {
  return post<JobStartedResponse>("/scrape/missing");
}

/** `POST /scrape/retry-failed` — only those whose last scrape failed. */
export function retryFailedScrapes(): Promise<JobStartedResponse> {
  return post<JobStartedResponse>("/scrape/retry-failed");
}

/**
 * `GET /scrape/jobs` — the full history, newest first.
 *
 * Unpaginated, unlike `/businesses`: it takes no parameters and returns every
 * job in one `{ success, data }` envelope. Worth knowing before a busy install
 * accumulates thousands of them.
 */
export function listScrapeJobs(
  signal?: AbortSignal,
): Promise<ScrapeJob[]> {
  return get<ScrapeJobListResponse>("/scrape/jobs", { signal }).then(
    (response) => response.data,
  );
}

/** `GET /scrape/jobs/{id}` — the endpoint a progress view polls. */
export function getScrapeJob(
  id: number,
  signal?: AbortSignal,
): Promise<ScrapeJob> {
  return get<DetailResponse<ScrapeJob>>(`/scrape/jobs/${id}`, { signal }).then(
    (response) => response.data,
  );
}

/** `GET /scrape/jobs/{id}/results` — detailed website scrape records for a job. */
export function getScrapeJobResults(
  id: number,
  query?: ScrapeJobResultsQuery,
  signal?: AbortSignal,
): Promise<ScrapeJobResultsResponse> {
  return get<ScrapeJobResultsResponse>(`/scrape/jobs/${id}/results`, {
    params: query,
    signal,
  });
}

/** `DELETE /scrape/jobs/{id}` — removes a finished job from the history. */
export function deleteScrapeJob(id: number): Promise<MessageResponse> {
  return del<MessageResponse>(`/scrape/jobs/${id}`);
}
