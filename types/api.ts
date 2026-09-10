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

export interface Tag {
  id: number;
  name: string;
  slug: string;
  business_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TagListResponse {
  success: boolean;
  data: Tag[];
}

export interface BulkTagActionResponse {
  success: boolean;
  message: string;
  tag?: Tag | null;
  updated_count: number;
  total_requested: number;
}

export interface BusinessNote {
  id: number;
  business_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface NoteListResponse {
  success: boolean;
  data: BusinessNote[];
  total: number;
}

export interface CreateNoteRequest {
  content: string;
}

export interface UpdateNoteRequest {
  content: string;
}

export type LeadStatus =
  | "new"
  | "contacted"
  | "interested"
  | "follow_up"
  | "converted"
  | "lost";

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
  lead_status?: LeadStatus;
  lead_score?: number | null;
  lead_grade?: string | null;
  lead_score_reasons?: string[] | null;
  is_favorite?: boolean;
  tags?: Tag[];
}

export type BusinessListResponse = PaginatedResponse<Business>;

/** Sort columns the backend accepts. Anything else falls back to `id`. */
export const BUSINESS_SORT_FIELDS = [
  "id",
  "name",
  "city",
  "category",
  "status",
  "lead_status",
  "lead_score",
  "lead_grade",
  "is_favorite",
] as const;

export type BusinessSortField = (typeof BUSINESS_SORT_FIELDS)[number];

export type SortOrder = "asc" | "desc";

/**
 * Query parameters for `GET /businesses` and the CSV export.
 *
 * `city` and `category` are exact-match on the backend; qualification uses the
 * composable `has_website`, `has_email`, and `has_phone` booleans.
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
  is_favorite?: boolean;
  lead_status?: string;
  lead_grade?: string;
  min_lead_score?: number;
  max_lead_score?: number;
  tags?: string;
  sortBy?: BusinessSortField;
  sortOrder?: SortOrder;
}

/** Body for every endpoint that acts on a set of businesses. */
export interface BulkBusinessRequest {
  business_ids: number[];
}

export interface FavoriteToggleRequest {
  is_favorite: boolean;
}

export interface BulkFavoriteRequest {
  business_ids: number[];
  is_favorite: boolean;
}

export interface BulkFavoriteResponse {
  success: boolean;
  message: string;
  updated_count: number;
  total_requested: number;
  is_favorite: boolean;
}

export interface LeadStatusUpdateRequest {
  status: LeadStatus;
}

export interface BulkLeadStatusRequest {
  business_ids: number[];
  status: LeadStatus;
}

export interface BulkLeadStatusResponse {
  success: boolean;
  message: string;
  updated_count: number;
  total_requested: number;
  status: string;
}

export type ActivityType =
  | "business_created"
  | "business_updated"
  | "lead_created"
  | "status_changed"
  | "favorite_added"
  | "favorite_removed"
  | "tag_added"
  | "tag_removed"
  | "note_created"
  | "note_updated"
  | "note_deleted"
  | "email_added"
  | "phone_added"
  | "website_added"
  | "scrape_completed"
  | "lead_scanned"
  | "lead_scraped"
  | "lead_enriched"
  | "lead_score_changed"
  | "follow_up_created"
  | "follow_up_updated"
  | "follow_up_completed"
  | "follow_up_cancelled"
  | "follow_up_deleted"
  | "email_sent"
  | "email_opened"
  | "email_clicked"
  | "campaign_added"
  | "campaign_removed"
  | "enrichment_completed"
  | string;

export interface BusinessActivity {
  id: number;
  business_id: number;
  activity_type: ActivityType;
  title: string;
  description?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface BusinessActivityListResponse {
  success: boolean;
  items: BusinessActivity[];
  total: number;
  page: number;
  page_size: number;
  total_pages?: number;
}

export interface ContactQualification {
  has_email?: boolean;
  has_phone?: boolean;
}

export interface SelectedExportRequest extends BulkBusinessRequest, ContactQualification {}

export interface ExportPreviewRequest {
  scope: "filtered" | "selected";
  business_ids?: number[];
  filters?: Pick<BusinessQuery, "search" | "city" | "category" | "has_website" | "has_email" | "has_phone" | "lead_grade" | "min_lead_score" | "max_lead_score" | "is_favorite" | "lead_status">;
  qualification?: ContactQualification;
}

export interface CitySummary {
  city: string;
  totalBusinesses: number;
  withWebsite: number;
  withoutWebsite: number;
  withEmail: number;
  withoutEmail: number;
  withPhone: number;
  withoutPhone: number;
  actionableLeads: number;
  averageLeadScore?: number;
  highQualityLeads?: number;
}

export type CitySummariesResponse = ListResponse<CitySummary>;

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

export interface ScrapeJobResultItem {
  id: number;
  business_id: number;
  business_name: string;
  business_city: string;
  business_category: string;
  business_phone: string | null;
  website: string | null;
  status: string;
  title: string | null;
  meta_description: string | null;
  emails: string[];
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  youtube: string | null;
  twitter: string | null;
  whatsapp: string | null;
  scraped_at: string | null;
  failure_reason?: string | null;
}

export interface ScrapeJobCityItem {
  city: string;
  count: number;
  success: number;
  failed: number;
}

export interface ScrapeJobResultsSummary {
  id: number;
  status: string;
  progress: number;
  total_websites: number;
  completed: number;
  success: number;
  failed: number;
  started_at: string | null;
  completed_at: string | null;
}

export interface ScrapeJobResultsResponse {
  success: boolean;
  data: ScrapeJobResultItem[];
  pagination: PaginationResponse;
  summary: ScrapeJobResultsSummary;
  cities: ScrapeJobCityItem[];
}

export interface ScrapeJobResultsQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  city?: string;
  search?: string;
}

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

// ===========================================================================
// CRM FOLLOW-UPS
// ===========================================================================

export type FollowUpStatus = "pending" | "completed" | "cancelled";
export type FollowUpPriority = "low" | "medium" | "high";

export interface BusinessFollowUp {
  id: number;
  business_id: number;
  title: string;
  description?: string | null;
  due_at?: string | null;
  completed_at?: string | null;
  status: FollowUpStatus;
  priority: FollowUpPriority;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export interface FollowUpListResponse {
  success: boolean;
  items: BusinessFollowUp[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface FollowUpSingleResponse {
  success: boolean;
  data: BusinessFollowUp;
  message?: string;
}

export interface FollowUpCreateInput {
  title: string;
  description?: string;
  due_at?: string | null;
  priority?: FollowUpPriority;
}

export interface FollowUpUpdateInput {
  title?: string;
  description?: string | null;
  due_at?: string | null;
  priority?: FollowUpPriority;
}

export interface FollowUpFilterParams {
  business_id?: number;
  status?: FollowUpStatus;
  priority?: FollowUpPriority;
  overdue?: boolean;
  page?: number;
  page_size?: number;
}

// ===========================================================================
// EMAIL AUTOMATIONS
// ===========================================================================

export type AutomationTriggerType =
  | "lead_created"
  | "lead_status_changed"
  | "follow_up_due"
  | "follow_up_overdue";

export type ExecutionStatus =
  | "scheduled"
  | "processing"
  | "sent"
  | "failed"
  | "cancelled";

export interface EmailAutomation {
  id: number;
  name: string;
  description?: string | null;
  trigger_type: AutomationTriggerType;
  subject_template: string;
  body_template: string;
  enabled: boolean;
  delay_minutes: number;
  max_retries: number;
  created_at: string;
  updated_at: string;
}

export interface EmailAutomationExecution {
  id: number;
  automation_id: number;
  business_id: number;
  follow_up_id?: number | null;
  status: ExecutionStatus;
  trigger_event: string;
  trigger_key: string;
  recipient_email: string;
  rendered_subject?: string | null;
  rendered_body?: string | null;
  provider?: string | null;
  provider_message_id?: string | null;
  error_message?: string | null;
  retry_count: number;
  next_retry_at?: string | null;
  scheduled_at: string;
  sent_at?: string | null;
  created_at: string;
  updated_at: string;
  automation_name?: string;
  business_name?: string;
}

export interface SupportedVariable {
  key: string;
  label: string;
  description: string;
  example?: string | null;
}

export interface AutomationCreateInput {
  name: string;
  description?: string;
  trigger_type: AutomationTriggerType;
  subject_template: string;
  body_template: string;
  enabled?: boolean;
  delay_minutes?: number;
  max_retries?: number;
}

export interface AutomationUpdateInput {
  name?: string;
  description?: string | null;
  trigger_type?: AutomationTriggerType;
  subject_template?: string;
  body_template?: string;
  enabled?: boolean;
  delay_minutes?: number;
  max_retries?: number;
}

export interface AutomationListResponse {
  success: boolean;
  items: EmailAutomation[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AutomationSingleResponse {
  success: boolean;
  data: EmailAutomation;
  message?: string;
}

export interface ExecutionListResponse {
  success: boolean;
  items: EmailAutomationExecution[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ProcessDueResponse {
  success: boolean;
  processed: number;
  sent: number;
  failed: number;
  retried: number;
  cancelled: number;
}

export interface AutomationFilterParams {
  enabled?: boolean;
  trigger_type?: AutomationTriggerType;
  page?: number;
  page_size?: number;
}

export interface ExecutionFilterParams {
  automation_id?: number;
  business_id?: number;
  status?: ExecutionStatus;
  page?: number;
  page_size?: number;
}

// City-First Grade Automation Types
export interface CityStatItem {
  city: string;
  total_leads: number;
  eligible_leads: number;
  ineligible_leads: number;
  already_sent_leads?: number;
}

export interface CityStatListResponse {
  success: boolean;
  items: CityStatItem[];
}

export interface GradeStatDetail {
  total: number;
  eligible: number;
  ineligible: number;
  already_sent?: number;
}

export interface CityGradeStatsResponse {
  success: boolean;
  city: string;
  total_leads: number;
  email_eligible_leads: number;
  ineligible_leads: number;
  already_sent_leads?: number;
  grades: {
    A: GradeStatDetail;
    B: GradeStatDetail;
    C: GradeStatDetail;
    D: GradeStatDetail;
    [key: string]: GradeStatDetail;
  };
}

export interface AIGradeTemplateItem {
  subject: string;
  body: string;
  rationale?: string;
  name?: string;
}

export interface AIGradeTemplatesResponse {
  success: boolean;
  city: string;
  data: {
    A: AIGradeTemplateItem;
    B: AIGradeTemplateItem;
    C: AIGradeTemplateItem;
    D: AIGradeTemplateItem;
    [key: string]: AIGradeTemplateItem;
  };
}

export interface AISingleTemplateResponse {
  success: boolean;
  grade: string;
  data: AIGradeTemplateItem;
}

export interface MasterTemplateItem {
  subject: string;
  body: string;
  name?: string;
  rationale?: string;
  variables?: string[];
}

export interface MasterTemplateResponse {
  success: boolean;
  city?: string;
  data: MasterTemplateItem;
}

export interface GradeTemplatePayload {
  subject: string;
  body: string;
  name?: string;
}

export interface CityAutomationStartInput {
  city: string;
  template?: MasterTemplateItem;
  templates?: {
    A?: GradeTemplatePayload;
    B?: GradeTemplatePayload;
    C?: GradeTemplatePayload;
    D?: GradeTemplatePayload;
    [key: string]: GradeTemplatePayload | undefined;
  };
  name?: string;
  scheduled_at?: string | null;
}

export interface GradeBreakdownStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  processing?: number;
  cancelled: number;
  skipped?: number;
}

export interface RecipientExecutionLogItem {
  id: number;
  business_id: number;
  business_name: string;
  recipient_email: string;
  lead_grade: string;
  status: string;
  error_message?: string | null;
  sent_at?: string | null;
  attempted_at?: string | null;
}

export interface CityAutomationReportData {
  id: number;
  name: string;
  city: string;
  status: string;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  pending_count: number;
  processing_count?: number;
  remaining_count?: number;
  cancelled_count: number;
  skipped_count?: number;
  percentage?: number;
  paused_reason?: string | null;
  scheduled_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  grade_breakdown: {
    A: GradeBreakdownStats;
    B: GradeBreakdownStats;
    C: GradeBreakdownStats;
    D: GradeBreakdownStats;
    [key: string]: GradeBreakdownStats;
  };
  remaining_recipients?: RecipientExecutionLogItem[];
  recipient_logs: RecipientExecutionLogItem[];
}

export interface CityAutomationReportResponse {
  success: boolean;
  data: CityAutomationReportData;
  message?: string;
}

export interface CityAutomationRunItem {
  id: number;
  name: string;
  city: string;
  status: string;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  completed_at?: string | null;
}

export interface CityAutomationListResponse {
  success: boolean;
  items: CityAutomationRunItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}



// ===========================================================================
// EMAIL TEMPLATES & CAMPAIGNS (PHASE 5)
// ===========================================================================

export interface EmailTemplate {
  id: number;
  name: string;
  description?: string | null;
  subject: string;
  body: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateCreateInput {
  name: string;
  description?: string;
  subject: string;
  body: string;
}

export interface TemplateUpdateInput {
  name?: string;
  description?: string | null;
  subject?: string;
  body?: string;
  is_archived?: boolean;
}

export interface TemplateListResponse {
  success: boolean;
  items: EmailTemplate[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TemplateSingleResponse {
  success: boolean;
  data: EmailTemplate;
  message?: string;
}

export interface TemplatePreviewRequest {
  subject?: string;
  body?: string;
  template_id?: number;
  business_id?: number;
  custom_context?: Record<string, unknown>;
}

export interface TemplatePreviewResponse {
  success: boolean;
  rendered_subject: string;
  rendered_body: string;
  context_used: Record<string, unknown>;
}

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type CampaignRecipientStatus =
  | "pending"
  | "processing"
  | "sent"
  | "failed"
  | "cancelled";

export interface CampaignFilterCriteria {
  search?: string;
  city?: string;
  category?: string;
  has_website?: boolean;
  has_email?: boolean;
  has_phone?: boolean;
  lead_grade?: string;
  min_lead_score?: number;
  max_lead_score?: number;
  tags?: string;
  is_favorite?: boolean;
  lead_status?: string;
  business_ids?: number[];
}

export interface EmailCampaign {
  id: number;
  name: string;
  description?: string | null;
  template_id: number;
  template_name?: string | null;
  status: CampaignStatus;
  filter_criteria: CampaignFilterCriteria;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  scheduled_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  snapshot_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaignRecipient {
  id: number;
  campaign_id: number;
  business_id: number;
  business_name?: string | null;
  recipient_email: string;
  recipient_name?: string | null;
  status: CampaignRecipientStatus;
  attempt_count: number;
  error_message?: string | null;
  provider_message_id?: string | null;
  sent_at?: string | null;
  attempted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignCreateInput {
  name: string;
  description?: string;
  template_id: number;
  filter_criteria?: CampaignFilterCriteria;
  scheduled_at?: string | null;
}

export interface CampaignUpdateInput {
  name?: string;
  description?: string | null;
  template_id?: number;
  filter_criteria?: CampaignFilterCriteria;
  scheduled_at?: string | null;
}

export interface CampaignListResponse {
  success: boolean;
  items: EmailCampaign[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CampaignSingleResponse {
  success: boolean;
  data: EmailCampaign;
  message?: string;
}

export interface CampaignRecipientListResponse {
  success: boolean;
  items: EmailCampaignRecipient[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface RecipientPreviewResponse {
  success: boolean;
  total_eligible_leads: number;
  sample_leads: Array<{
    id: number;
    name: string;
    email: string | null;
    city: string | null;
    category: string | null;
    lead_grade: string | null;
    lead_score: number | null;
    lead_status: string | null;
  }>;
}

export interface TemplateFilterParams {
  search?: string;
  is_archived?: boolean;
  page?: number;
  page_size?: number;
}

export interface CampaignFilterParams {
  search?: string;
  status?: CampaignStatus;
  template_id?: number;
  page?: number;
  page_size?: number;
}

export interface CampaignRecipientFilterParams {
  status?: CampaignRecipientStatus;
  page?: number;
  page_size?: number;
}

export interface ProcessDueCampaignsResponse {
  success: boolean;
  campaigns_processed: number;
  recipients_sent: number;
  recipients_failed: number;
  campaigns_completed: number;
}

// ===========================================================================
// GMAIL INTEGRATION & TEST SEND
// ===========================================================================

export interface GmailStatusResponse {
  success: boolean;
  is_configured: boolean;
  is_connected: boolean;
  email_address: string | null;
  daily_send_count: number;
  daily_quota_limit: number;
  daily_quota_remaining: number;
  token_expiry: string | null;
}

export interface GmailAuthUrlResponse {
  success: boolean;
  auth_url: string;
  state: string;
  redirect_uri: string;
}

export interface GmailTestSendRequest {
  recipient_email: string;
  template_grades?: string[];
}

export interface GmailTestItemResult {
  grade: string;
  status: "sent" | "failed" | "skipped";
  subject: string;
  message_id?: string | null;
  error?: string | null;
  sent_at?: string | null;
}

export interface GmailTestSendResponse {
  success: boolean;
  recipient_email: string;
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  results: GmailTestItemResult[];
}
