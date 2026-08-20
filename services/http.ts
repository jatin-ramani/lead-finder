/**
 * The only module in the app that imports axios.
 *
 * Everything else calls the typed functions in the sibling resource modules,
 * so there is exactly one place that knows about base URLs, headers, timeouts
 * and error shapes. Swapping the transport is a change to this file alone.
 */

import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { normalizeError } from "./errors";

/**
 * Resolved once, at module load. `NEXT_PUBLIC_` variables are inlined at build
 * time, so this is a constant in the bundle rather than a runtime lookup.
 */
const SESSION_TOKEN_KEY = "lf_session_token";

export function getStoredSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(SESSION_TOKEN_KEY) || localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredSessionToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      sessionStorage.setItem(SESSION_TOKEN_KEY, token);
      localStorage.setItem(SESSION_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem(SESSION_TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors in restricted private browsing
  }
}

/**
 * Resolved once, at module load. In browser, defaults to same-origin `/api`
 * reverse proxy so cookies and credentials work reliably without third-party
 * cookie blocking on mobile browsers.
 */
const DEFAULT_API_BASE_URL =
  typeof window !== "undefined"
    ? "/api"
    : process.env.NODE_ENV === "production"
      ? "https://lead-find-api.onrender.com"
      : "http://127.0.0.1:8000";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
  DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

/**
 * 30s.
 *
 * `POST /scan` runs the Geoapify query synchronously and answers when it is
 * done, so this has to cover a real scan rather than a typical API call. It is
 * the reason `TIMEOUT` says the server "may still be working on it" — for a
 * scan, a timeout on our side does not cancel the work on theirs.
 */
const DEFAULT_TIMEOUT_MS = 30_000;

export const REQUEST_ID_HEADER = "x-request-id";

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

/**
 * Attaches active session token if present, and cleans up blank params.
 */
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredSessionToken();
  if (token && !config.headers.get("x-session-token") && !config.headers.get("Authorization")) {
    config.headers.set("x-session-token", token);
  }

  if (config.params && typeof config.params === "object") {
    const cleaned: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(
      config.params as Record<string, unknown>,
    )) {
      if (value === undefined || value === null) continue;
      if (typeof value === "string" && value.trim() === "") continue;

      cleaned[key] = value;
    }

    config.params = cleaned;
  }

  return config;
});

/**
 * Every rejection leaves here as an `ApiError`, so no caller ever sees an
 * `AxiosError`. Cancellations are re-thrown untouched — TanStack Query
 * recognises them and must not treat them as failures.
 */
http.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    if (axios.isCancel(error)) return Promise.reject(error);

    const normalized = normalizeError(error, API_BASE_URL);

    if (normalized.status === 401) {
      setStoredSessionToken(null);
    }

    return Promise.reject(normalized);
  },
);

/**
 * The request id the server assigned, read from the response headers.
 *
 * Present on successful responses too, which is what lets a slow-but-working
 * request be traced as readily as a failing one.
 */
export function requestIdOf(response: AxiosResponse): string {
  return (response.headers?.[REQUEST_ID_HEADER] as string | undefined) ?? "";
}

/** GET returning the parsed body. */
export async function get<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await http.get<T>(url, config);
  return response.data;
}

export async function post<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await http.post<T>(url, body, config);
  return response.data;
}

export async function del<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await http.delete<T>(url, config);
  return response.data;
}

/**
 * DELETE with a request body.
 *
 * `DELETE /businesses` takes `{ business_ids }`. Axios only sends a body on
 * DELETE when it is passed through `config.data`, which is easy to get wrong
 * silently — the request succeeds and deletes nothing.
 */
export async function delWithBody<T>(
  url: string,
  body: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await http.delete<T>(url, { ...config, data: body });
  return response.data;
}

/**
 * A binary download, returned as a Blob with the filename the server chose.
 *
 * Used by the CSV exports. The filename comes from `Content-Disposition` so the
 * backend stays the single source of truth for it.
 */
export async function download(
  url: string,
  config?: AxiosRequestConfig & { body?: unknown; method?: "get" | "post" },
): Promise<{ blob: Blob; filename: string }> {
  const { body, method = "get", ...rest } = config ?? {};

  const response = await http.request<Blob>({
    url,
    method,
    data: body,
    responseType: "blob",
    ...rest,
  });

  const disposition = String(
    response.headers?.["content-disposition"] ?? "",
  );
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);

  return {
    blob: response.data,
    filename: match ? decodeURIComponent(match[1]) : "export.csv",
  };
}
