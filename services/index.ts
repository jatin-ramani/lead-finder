/**
 * The API layer's public surface.
 *
 * Feature code imports from `@/services` and nothing deeper, so the internal
 * split between transport, errors and resources can change without touching a
 * component.
 */

export { API_BASE_URL } from "./http";

export {
  ApiError,
  ErrorCode,
  errorTitle,
  isApiError,
  isCancelled,
  type ErrorCodeValue,
  type ValidationDetail,
} from "./errors";

export { queryKeys } from "./query-keys";

export * as businessesApi from "./businesses";
export * as scanningApi from "./scanning";
export * as scrapingApi from "./scraping";
export * as dashboardApi from "./dashboard";
export * as systemApi from "./system";
