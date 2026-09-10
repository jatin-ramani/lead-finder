/** `POST /scan` and the continuous scan-job management. */

import { get, post } from "./http";
import type {
  CategoryFamiliesResponse,
  ClearDataResponse,
  LatestScanJob,
  MessageResponse,
  ScanJob,
  ScanJobDetail,
  ScanRequest,
  ScanStartResponse,
} from "@/types/api";

/**
 * `POST /scan` — initiates continuous background multi-cell scan.
 */
export function startScan(body: ScanRequest): Promise<ScanStartResponse> {
  return post<ScanStartResponse>("/scan", body);
}

/** `GET /scan/families` — get available category families taxonomy */
export function getCategoryFamilies(signal?: AbortSignal): Promise<CategoryFamiliesResponse> {
  return get<CategoryFamiliesResponse>("/scan/families", { signal });
}

/** `GET /scan/jobs` — every scan ever started, newest first. */
export function listScanJobs(signal?: AbortSignal): Promise<ScanJob[]> {
  return get<ScanJob[]>("/scan/jobs", { signal });
}

/** `GET /scan/jobs/latest` — newest scan job */
export function getLatestScanJob(
  signal?: AbortSignal,
): Promise<LatestScanJob> {
  return get<LatestScanJob>("/scan/jobs/latest", { signal });
}

/** `GET /scan/jobs/{id}` — detailed scan job metrics and live lead feed */
export function getScanJobDetail(
  jobId: number,
  signal?: AbortSignal,
): Promise<ScanJobDetail> {
  return get<ScanJobDetail>(`/scan/jobs/${jobId}`, { signal });
}

/** `POST /scan/{id}/pause` — pause active scan job */
export function pauseScan(jobId: number): Promise<MessageResponse> {
  return post<MessageResponse>(`/scan/${jobId}/pause`);
}

/** `POST /scan/{id}/resume` — resume paused scan job */
export function resumeScan(jobId: number): Promise<MessageResponse> {
  return post<MessageResponse>(`/scan/${jobId}/resume`);
}

/** `POST /scan/{id}/cancel` — cancel scan job */
export function cancelScan(jobId: number): Promise<MessageResponse> {
  return post<MessageResponse>(`/scan/${jobId}/cancel`);
}

/** `POST /scan/clear-data` — safely clear all scanned businesses data */
export function clearScannedData(confirm: boolean): Promise<ClearDataResponse> {
  return post<ClearDataResponse>("/scan/clear-data", { confirm });
}

