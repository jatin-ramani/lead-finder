/**
 * The backend contract, mirrored.
 *
 * These types are a hand-written copy of the FastAPI response models. The API
 * contract is final, so this file changes only when the backend does — and if
 * it ever drifts, `npm run verify:api` fails against a live server rather than
 * letting the mismatch reach a user. That check exists because the previous
 * frontend silently rendered an empty app for exactly this reason: the list
 * endpoint gained a pagination envelope and the client still expected an array.
 *
 * Field names follow the wire format, not JavaScript convention. The backend
 * mixes camelCase (pagination, dashboard) with snake_case (website data, jobs);
 * renaming here would mean two names for every field and a mapping layer to
 * keep in step. The wire is the single source of truth.
 */

// ===========================================================================
// ENVELOPES
// ===========================================================================

/** Returned by every action endpoint that carries no payload. */
export interface MessageResponse {
  success: boolean;
  message: string;
}

/** Returned by the bulk delete. */
export interface DeletedCountResponse {
  success: boolean;
  deleted: number;
}

/** Returned when a background job is queued. */
export interface JobStartedResponse {
  success: boolean;
  job_id: number;
  message: string;
}

export interface PaginationResponse {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/** The shape every paginated list endpoint answers with. */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationResponse;
}

/** The shape every single-item endpoint answers with. */
export interface DetailResponse<T> {
  success: boolean;
  data: T;
}

/**
 * The one error envelope, returned for every failure — 4xx and 5xx alike.
 *
 * `requestId` matches the `X-Request-ID` response header and the server logs,
 * which is what makes a support report actionable.
 */
export interface ErrorEnvelope {
  success: false;
  message: string;
  error: string;
  timestamp: string;
  requestId: string;
  details: unknown;
}

// ===========================================================================
// BUSINESSES
// ===========================================================================

export interface Business {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  city: string | null;
  category: string | null;
  address: string | null;
  status: string | null;
}

export type BusinessListResponse = PaginatedResponse<Business>;

/** Sort columns the backend accepts. Anything else falls back to `id`. */
export const BUSINESS_SORT_FIELDS = [
  "id",
  "name",
  "city",
  "category",
  "status",
] as const;

export type BusinessSortField = (typeof BUSINESS_SORT_FIELDS)[number];

export type SortOrder = "asc" | "desc";

/**
 * Query parameters for `GET /businesses` and the CSV export.
 *
 * `city`, `category`, `status` and `contact` are exact-match on the backend.
 * `search` is the fuzzy one: it spans name, phone, email and website.
 */
export interface BusinessQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  city?: string;
  category?: string;
  has_website?: boolean;
  has_email?: boolean;
  has_phone?: boolean;
  sortBy?: BusinessSortField;
  sortOrder?: SortOrder;
}

/** Body for every endpoint that acts on a set of businesses. */
export interface BulkBusinessRequest {
  business_ids: number[];
}

export interface ContactQualification {
  has_email?: boolean;
  has_phone?: boolean;
}

export interface SelectedExportRequest extends BulkBusinessRequest, ContactQualification {}

export interface ExportPreviewRequest {
  scope: "filtered" | "selected";
  business_ids?: number[];
  filters?: Pick<BusinessQuery, "search" | "city" | "category" | "has_website" | "has_email" | "has_phone">;
  qualification?: ContactQualification;
}

export interface ExportPreviewResponse {
  success: boolean;
  total_selected: number;
  matching_qualification: number;
  export_count: number;
}

// ===========================================================================
// WEBSITE DATA
// ===========================================================================

export interface WebsiteData {
  id: number;
  business_id: number;
  title: string | null;
  meta_description: string | null;
  /** Already decoded server-side; a malformed row degrades to `[]`, never a 500. */
  emails: string[];
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  twitter: string | null;
  youtube: string | null;
  whatsapp: string | null;
  scraped_at: string | null;
  status: string | null;
}

export type WebsiteDataResponse = DetailResponse<WebsiteData>;

// ===========================================================================
// JOBS
// ===========================================================================

/** Job lifecycle values written by the backend. */
export type JobStatus = "Pending" | "Running" | "Completed" | "Failed";

/**
 * A scan job, as `GET /scan/jobs` returns it.
 *
 * Note what is **absent**: there is no timestamp of any kind. Scan jobs cannot
 * be dated, so history is ordered by id and nothing may claim to show when a
 * scan ran. (Scrape jobs do carry `started_at` / `completed_at`.)
 */
export interface ScanJob {
  id: number;
  city: string | null;
  category: string | null;
  status: JobStatus | string;
  progress: number;
  total_businesses: number;
  new_businesses: number;

  /**
   * Dead columns. Present in the model and the migration, written by no code
   * — always `0`, `0` and `null`. They appear to be the remains of an
   * unimplemented grid scan.
   *
   * Modelled so nobody rediscovers them in a payload and assumes they mean
   * something. **Do not render these.**
   */
  total_cells?: number;
  completed_cells?: number;
  current_cell?: string | null;
}

/** `GET /scan/jobs/latest` renames its counters; the list endpoint does not. */
export interface LatestScanJob {
  id: number;
  city: string | null;
  category: string | null;
  status: JobStatus | string;
  progress: number;
  totalBusinesses: number;
  newBusinesses: number;
}

export interface ScrapeJob {
  id: number;
  status: JobStatus | string;
  progress: number;
  total_websites: number;
  completed: number;
  success: number;
  failed: number;
  current_business_id: number | null;
  started_at: string | null;
  completed_at: string | null;
}

/**
 * `GET /scrape/jobs` is a list envelope, **not** a paginated one — it returns
 * `{ success, data }` with no `pagination` and accepts no query parameters.
 * Verified against a live server; do not "correct" this to PaginatedResponse.
 */
export interface ListResponse<T> {
  success: boolean;
  data: T[];
}

export type ScrapeJobListResponse = ListResponse<ScrapeJob>;
export type ScrapeJobResponse = DetailResponse<ScrapeJob>;

// ===========================================================================
// SCANNING
// ===========================================================================

export interface ScanRequest {
  city: string;
  category: string;
}

// ===========================================================================
// DASHBOARD
// ===========================================================================

export interface DashboardBusinessStats {
  totalBusinesses: number;
  withWebsite: number;
  withoutWebsite: number;
  withEmail: number;
  withoutEmail: number;
  withPhone: number;
  actionableLeads: number;
}

export interface DashboardWebsiteStats {
  completed: number;
  failed: number;
  pending: number;
  totalScraped: number;
}

export interface DashboardScrapeJobStats {
  total: number;
  running: number;
  completed: number;
  failed: number;
}

export interface DashboardScanJobStats {
  total: number;
  running: number;
  completed: number;
}

export interface DashboardStats {
  business: DashboardBusinessStats;
  websiteData: DashboardWebsiteStats;
  scrapeJobs: DashboardScrapeJobStats;
  scanJobs: DashboardScanJobStats;
  latestScanJob: ScanJob | null;
  latestScrapeJob: ScrapeJob | null;
}

// ===========================================================================
// SYSTEM
// ===========================================================================

export interface RootResponse {
  message: string;
}

export interface HealthResponse {
  status: "healthy" | "unhealthy";
  database: "connected" | "disconnected";
  timestamp: string;
}

export interface VersionResponse {
  name: string;
  version: string;
}

/** Reports the database *dialect*, never the URL — a DSN carries credentials. */
export interface SystemInfoResponse {
  pythonVersion: string;
  platform: string;
  database: string;
  apiVersion: string;
  serverTime: string;
}
