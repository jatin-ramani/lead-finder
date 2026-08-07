import axios, { AxiosError } from "axios";

import type { Business, ScanRequest, ScanResponse } from "@/types/business";

/**
 * Single axios instance for the whole app — every request goes through this.
 * Override the host per-environment with NEXT_PUBLIC_API_BASE_URL.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

/** Turns an axios failure into a message that is safe to show in the UI. */
export function toErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ detail?: string; message?: string }>;

  if (axiosError?.code === "ECONNABORTED") {
    return "The request timed out. The scan may still be running on the server.";
  }

  if (axiosError?.response) {
    const data = axiosError.response.data;
    return (
      data?.detail ||
      data?.message ||
      `Request failed with status ${axiosError.response.status}.`
    );
  }

  if (axiosError?.request) {
    return `Could not reach the API at ${API_BASE_URL}. Make sure the backend is running.`;
  }

  return axiosError?.message || "Something went wrong.";
}

/** True for an aborted request, which must not surface as an error toast. */
export function isCancelled(error: unknown): boolean {
  return (
    axios.isCancel(error) || (error as Error | undefined)?.name === "CanceledError"
  );
}

/** GET /businesses */
export async function getBusinesses(signal?: AbortSignal): Promise<Business[]> {
  const { data } = await api.get<Business[]>("/businesses", { signal });
  return Array.isArray(data) ? data : [];
}

export class ScanUnavailableError extends Error {
  constructor() {
    super(
      "The backend did not accept POST /scan. Confirm the route is registered on the API.",
    );
    this.name = "ScanUnavailableError";
  }
}

/**
 * POST /scan
 *
 * The API answers `{ success, message }`. A 2xx with `success: false` is still a
 * failure, so it is raised rather than reported as a completed scan.
 */
export async function postScan(payload: ScanRequest): Promise<ScanResponse> {
  try {
    const { data } = await api.post<ScanResponse>("/scan", payload);

    if (data && data.success === false) {
      throw new Error(data.message || "The scan did not complete.");
    }

    return data ?? { success: true, message: "Scan completed successfully." };
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 404 || status === 405) {
      throw new ScanUnavailableError();
    }
    throw error;
  }
}
