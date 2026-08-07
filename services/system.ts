/** Liveness, version and runtime information. */

import { get } from "./http";
import type {
  HealthResponse,
  RootResponse,
  SystemInfoResponse,
  VersionResponse,
} from "@/types/api";

/** `GET /` — the cheapest possible "is anything listening" check. */
export function getRoot(signal?: AbortSignal): Promise<RootResponse> {
  return get<RootResponse>("/", { signal });
}

/**
 * `GET /health` — process up *and* the database answering `SELECT 1`.
 *
 * Answers **503** when the database is unreachable, which arrives here as an
 * `ApiError`. That is deliberate on the backend's side so an orchestrator acts
 * on it; a health check that always returns 200 tells nobody anything.
 */
export function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return get<HealthResponse>("/health", { signal });
}

/** `GET /version` — name and semantic version of the running API. */
export function getVersion(signal?: AbortSignal): Promise<VersionResponse> {
  return get<VersionResponse>("/version", { signal });
}

/**
 * `GET /system` — interpreter, host and database *dialect*.
 *
 * Never the connection URL: a DSN carries credentials. The backend enforces
 * that; this comment records why the field is a bare "postgresql".
 */
export function getSystemInfo(
  signal?: AbortSignal,
): Promise<SystemInfoResponse> {
  return get<SystemInfoResponse>("/system", { signal });
}
