/**
 * One error type for the whole app.
 *
 * Every failure — a 404, a validation error, a dropped connection, a timeout —
 * arrives at the UI as an `ApiError`. Components never inspect an axios error,
 * never read `response.data`, and never build their own message. They read
 * `message`, branch on `code`, and show `requestId`.
 *
 * `requestId` is the reason this file exists. The backend stamps one on every
 * response and on every log line it writes while handling that request. A user
 * who can quote it turns "the scan failed sometime this morning" into a single
 * grep. It is carried on every ApiError, shown in every error UI, and never
 * dropped — including for network failures, where the request never reached
 * the server and the id is simply absent rather than lost.
 */

import axios, { AxiosError } from "axios";

import type { ErrorEnvelope } from "@/types/api";

/**
 * Stable, machine-readable codes. These mirror `backend/errors.py::ErrorCode`
 * plus two the client originates, which the server can never send because they
 * describe a request that never completed.
 */
export const ErrorCode = {
  // -- from the backend envelope -----------------------------------------
  HTTP_ERROR: "HTTP_ERROR",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  CONFLICT: "CONFLICT",
  DATABASE_ERROR: "DATABASE_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  UPSTREAM_ERROR: "UPSTREAM_ERROR",
  // -- client-side only ---------------------------------------------------
  /** The request never reached the server. */
  NETWORK_ERROR: "NETWORK_ERROR",
  /** The server was reached but did not answer in time. */
  TIMEOUT: "TIMEOUT",
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Per-field problems, sent by the backend for a 422. */
export interface ValidationDetail {
  field: string;
  message: string;
  type: string;
}

export class ApiError extends Error {
  readonly code: ErrorCodeValue;
  /** Matches `X-Request-ID` and the server logs. Empty only if never sent. */
  readonly requestId: string;
  /** HTTP status, or 0 when the request never completed. */
  readonly status: number;
  readonly details: unknown;

  constructor(init: {
    message: string;
    code: ErrorCodeValue;
    requestId?: string;
    status?: number;
    details?: unknown;
  }) {
    super(init.message);

    this.name = "ApiError";
    this.code = init.code;
    this.requestId = init.requestId ?? "";
    this.status = init.status ?? 0;
    this.details = init.details ?? null;
  }

  /** Per-field problems, when this is a validation failure. */
  get validationDetails(): ValidationDetail[] {
    if (this.code !== ErrorCode.VALIDATION_ERROR) return [];
    if (!Array.isArray(this.details)) return [];

    return this.details.filter(
      (item): item is ValidationDetail =>
        typeof item === "object" &&
        item !== null &&
        "field" in item &&
        "message" in item,
    );
  }

  /**
   * The id of the job that blocked this request, for a 409.
   *
   * The backend puts it in `details.job_id` so the UI can link straight to the
   * job already running instead of telling the user to go and find it.
   */
  get conflictingJobId(): number | null {
    if (this.code !== ErrorCode.CONFLICT) return null;

    const details = this.details as { job_id?: unknown } | null;
    const id = details?.job_id;

    return typeof id === "number" ? id : null;
  }

  /** True when retrying could plausibly succeed without the user changing anything. */
  get isRetryable(): boolean {
    return (
      this.code === ErrorCode.NETWORK_ERROR ||
      this.code === ErrorCode.TIMEOUT ||
      this.code === ErrorCode.UPSTREAM_ERROR ||
      this.status >= 500
    );
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** True for a request the app itself aborted; must never surface as an error. */
export function isCancelled(error: unknown): boolean {
  return (
    axios.isCancel(error) ||
    (error as Error | undefined)?.name === "CanceledError" ||
    (error as Error | undefined)?.name === "AbortError"
  );
}

function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.message === "string" && typeof candidate.error === "string"
  );
}

function asErrorCode(value: string): ErrorCodeValue {
  return (Object.values(ErrorCode) as string[]).includes(value)
    ? (value as ErrorCodeValue)
    : ErrorCode.HTTP_ERROR;
}

/**
 * Turns anything thrown by axios into an `ApiError`.
 *
 * The one place a raw transport error is inspected. `baseUrl` is only used to
 * make the unreachable-server message actionable — it says which host failed,
 * which is the first thing anyone asks.
 */
export function normalizeError(error: unknown, baseUrl: string): ApiError {
  if (isApiError(error)) return error;

  const axiosError = error as AxiosError<unknown>;

  if (axiosError?.code === "ECONNABORTED" || axiosError?.code === "ETIMEDOUT") {
    return new ApiError({
      message:
        "The server took too long to respond. It may still be working on it.",
      code: ErrorCode.TIMEOUT,
    });
  }

  const response = axiosError?.response;

  if (response) {
    // The header is present on every response, including errors, and is the
    // authority — the body may be missing if a proxy replaced it.
    const requestId =
      (response.headers?.["x-request-id"] as string | undefined) ?? "";

    if (isErrorEnvelope(response.data)) {
      return new ApiError({
        message: response.data.message,
        code: asErrorCode(response.data.error),
        requestId: response.data.requestId || requestId,
        status: response.status,
        details: response.data.details,
      });
    }

    // A response that is not our envelope came from something in between —
    // a proxy, a load balancer, a gateway timeout page.
    return new ApiError({
      message: `The server returned an unexpected ${response.status} response.`,
      code: asErrorCode(String(response.status)),
      requestId,
      status: response.status,
    });
  }

  if (axiosError?.request) {
    return new ApiError({
      message: `Could not reach the API at ${baseUrl}. Check that the backend is running.`,
      code: ErrorCode.NETWORK_ERROR,
    });
  }

  return new ApiError({
    message: axiosError?.message || "Something went wrong.",
    code: ErrorCode.INTERNAL_ERROR,
  });
}

/**
 * A short, human title for an error, used as the heading above `message`.
 *
 * Deliberately separate from `message`: the backend already writes a good
 * sentence, and rewording it here would mean maintaining two vocabularies.
 * This only adds the category.
 */
export function errorTitle(error: ApiError): string {
  switch (error.code) {
    case ErrorCode.NETWORK_ERROR:
      return "Cannot reach the server";
    case ErrorCode.TIMEOUT:
      return "The request timed out";
    case ErrorCode.UPSTREAM_ERROR:
      return "An upstream service is unavailable";
    case ErrorCode.NOT_FOUND:
      return "Not found";
    case ErrorCode.VALIDATION_ERROR:
      return "Check the details and try again";
    case ErrorCode.CONFLICT:
      return "Already in progress";
    case ErrorCode.DATABASE_ERROR:
      return "The database is unavailable";
    default:
      return "Something went wrong";
  }
}
