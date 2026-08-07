/**
 * Compatibility surface for modules that already import from `@/lib/api`.
 *
 * The implementation lives in `services/api.ts` — re-exported rather than
 * duplicated so the app only ever creates one axios instance.
 */
export {
  api,
  API_BASE_URL,
  getBusinesses,
  isCancelled,
  postScan,
  ScanUnavailableError,
  toErrorMessage,
} from "@/services/api";

export { getBusinesses as fetchBusinesses, postScan as startScan } from "@/services/api";
