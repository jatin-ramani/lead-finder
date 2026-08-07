/** `POST /scan` and the scan-job history. */

import { get, post } from "./http";
import type {
  LatestScanJob,
  MessageResponse,
  ScanJob,
  ScanRequest,
} from "@/types/api";

/**
 * `POST /scan` — runs to completion before answering.
 *
 * Not a background job, unlike the scrapes: the response reflects the real
 * outcome, so a failure is a 502 (Geoapify unavailable) or a 500, never a
 * cheerful 200. A large city can take a while, which is what the client
 * timeout is sized for.
 */
export function startScan(body: ScanRequest): Promise<MessageResponse> {
  return post<MessageResponse>("/scan", body);
}

/** `GET /scan/jobs` — every scan ever started, newest first. */
export function listScanJobs(signal?: AbortSignal): Promise<ScanJob[]> {
  return get<ScanJob[]>("/scan/jobs", { signal });
}

/**
 * `GET /scan/jobs/latest` — 404s when no scan has ever run.
 *
 * Note the counters are camelCase here and snake_case in the list endpoint;
 * `types/api.ts` models both rather than papering over the difference.
 */
export function getLatestScanJob(
  signal?: AbortSignal,
): Promise<LatestScanJob> {
  return get<LatestScanJob>("/scan/jobs/latest", { signal });
}
