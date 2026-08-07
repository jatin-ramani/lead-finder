/** `GET /dashboard/stats`. */

import { get } from "./http";
import type { DashboardStats } from "@/types/api";

/**
 * Every headline figure in one call.
 *
 * Returns the object directly rather than a `{ success, data }` envelope —
 * this endpoint is the exception, and modelling it accurately here is cheaper
 * than a wrapper that pretends otherwise.
 */
export function getDashboardStats(
  signal?: AbortSignal,
): Promise<DashboardStats> {
  return get<DashboardStats>("/dashboard/stats", { signal });
}
