"use client";

import {
  CaretRightOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  CompassOutlined,
  FilterOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  MailOutlined,
  PauseCircleOutlined,
  PhoneOutlined,
  ReloadOutlined,
  RightOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { Alert, Badge, Button, Skeleton, Space, Tag, Tooltip } from "antd";
import Link from "next/link";

import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/feedback/ErrorState";
import Panel from "@/components/Panel";
import type { LatestScanJob, ScanRecentLead } from "@/types/api";

import { isPaused, isRunning } from "../hooks/useScanJobs";
import ScanLiveMap from "./ScanLiveMap";

interface ScanProgressProps {
  job: LatestScanJob | undefined;
  isNeverScanned: boolean;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  onRunAgain: () => void;
  canRunAgain: boolean;
  watching?: boolean;
  onPause?: (jobId: number) => void;
  onResume?: (jobId: number) => void;
  onCancel?: (jobId: number) => void;
  isPausing?: boolean;
  isResuming?: boolean;
  isCancelling?: boolean;
  onOpenLead?: (businessId: number) => void;
}

function StatusTag({ status }: { status: string }) {
  if (isRunning(status)) {
    return (
      <Tag color="processing" icon={<LoadingOutlined aria-hidden />} className="lf-tag lf-status-badge font-medium">
        Scanning
      </Tag>
    );
  }

  if (isPaused(status)) {
    return (
      <Tag color="warning" icon={<PauseCircleOutlined aria-hidden />} className="lf-tag lf-status-badge font-medium">
        Paused
      </Tag>
    );
  }

  if (status === "Completed") {
    return (
      <Tag color="success" icon={<CheckCircleFilled aria-hidden />} className="lf-tag lf-status-badge font-medium">
        Completed
      </Tag>
    );
  }

  if (status === "Cancelled") {
    return (
      <Tag color="default" icon={<StopOutlined aria-hidden />} className="lf-tag lf-status-badge font-medium">
        Cancelled
      </Tag>
    );
  }

  return (
    <Tag color="error" icon={<CloseCircleFilled aria-hidden />} className="lf-tag lf-status-badge font-medium">
      Failed
    </Tag>
  );
}

export default function ScanProgress({
  job,
  isNeverScanned,
  isLoading,
  error,
  onRetry,
  onRunAgain,
  canRunAgain,
  watching = false,
  onPause,
  onResume,
  onCancel,
  isPausing = false,
  isResuming = false,
  isCancelling = false,
  onOpenLead,
}: ScanProgressProps) {
  if (isLoading) {
    return (
      <Panel title="Continuous Scanner Monitor" description="Live multi-cell geographic scan status">
        <Skeleton active title={false} paragraph={{ rows: 5, width: ["45%", "100%", "80%", "90%", "60%"] }} />
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel title="Continuous Scanner Monitor" description="Live multi-cell geographic scan status">
        <ErrorState
          error={error}
          onRetry={onRetry}
          variant="inline"
          title="Could not read the scan monitor"
        />
      </Panel>
    );
  }

  if (isNeverScanned || !job) {
    return (
      <Panel title="Continuous Scanner Monitor" description="Live multi-cell geographic scan status">
        <EmptyState
          compact
          title="No scans executed yet"
          description="Configure a city and category above to launch multi-cell continuous scanning."
        />
      </Panel>
    );
  }

  const running = isRunning(job.status);
  const paused = isPaused(job.status);
  const failed = job.status === "Failed";
  const completed = job.status === "Completed";
  const cancelled = job.status === "Cancelled";

  const businessesFound = job.businesses_found ?? job.totalBusinesses ?? job.total_businesses ?? 0;
  const businessesStored = job.businesses_stored ?? job.newBusinesses ?? job.new_businesses ?? 0;
  const businessesSkipped = job.businesses_skipped_no_contact ?? 0;
  const businessesDuplicates = job.businesses_duplicates ?? 0;

  const totalCells = job.total_cells ?? 0;
  const completedCells = job.completed_cells ?? 0;
  const currentCell = job.current_cell || "Scanning...";
  const scanRadius = job.scan_radius_km ?? 25;
  const recentLeads: ScanRecentLead[] = job.recent_leads ?? [];
  const displayedRecentLeads = recentLeads.slice(0, 20);

  const totalSearchUnits = job.total_search_units ?? job.totalSearchUnits ?? 0;
  const completedSearchUnits = job.completed_search_units ?? job.completedSearchUnits ?? 0;
  const failedSearchUnits = job.failed_search_units ?? job.failedSearchUnits ?? 0;
  const coverageProgress = job.coverage_progress ?? job.coverageProgress ?? job.progress;
  const processedProgress = job.processed_progress ?? job.processedProgress ?? job.progress;

  const isQuotaPaused = paused && (job.error_message?.toLowerCase().includes("quota") ?? false);

  return (
    <Panel
      title="Continuous Scanner Monitor"
      description="Live multi-cell geographic scan status and discovered leads"
      extra={
        <Space wrap size="small">
          {running && onPause && (
            <Button
              size="small"
              icon={<PauseCircleOutlined />}
              onClick={() => onPause(job.id)}
              loading={isPausing}
            >
              Pause
            </Button>
          )}

          {paused && onResume && (
            <Button
              size="small"
              type="primary"
              icon={<CaretRightOutlined />}
              onClick={() => onResume(job.id)}
              loading={isResuming}
            >
              Resume
            </Button>
          )}

          {(running || paused) && onCancel && (
            <Button
              size="small"
              danger
              icon={<StopOutlined />}
              onClick={() => onCancel(job.id)}
              loading={isCancelling}
            >
              Cancel
            </Button>
          )}

          {!running && !paused && canRunAgain && (
            <Button
              size="small"
              icon={<ReloadOutlined aria-hidden />}
              onClick={onRunAgain}
            >
              {failed ? "Try again" : "Run again"}
            </Button>
          )}
        </Space>
      }
    >
      <div className="lf-scan-live flex flex-col gap-4">
        {/* Quota Paused Notice */}
        {isQuotaPaused && (
          <Alert
            type="warning"
            showIcon
            title="Daily Geoapify API Quota Reached"
            description="Continuous scan state and all discovered leads are preserved in PostgreSQL. The scan will resume remaining search units once provider quota resets."
            className="text-xs"
          />
        )}

        {/* Watching / Timeout Notification */}
        {watching && !isQuotaPaused && (
          <Alert
            data-testid="watching-banner"
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            title="Still scanning in background"
            description="The scan is taking longer than usual, but continuous background scanning is running. Results will update automatically."
            className="text-xs"
          />
        )}

        {/* Header with City, Category, Radius, Job ID and Status */}
        <div className="lf-scan-head flex items-center justify-between gap-3 p-3 rounded-lg bg-[var(--lf-subtle)] border border-[var(--lf-border)]">
          <div className="min-w-0">
            <p className="lf-scan-target text-base font-semibold text-[var(--lf-text)] flex items-center gap-2">
              <span>{job.city ?? "Unknown city"}</span>
              <span className="lf-scan-sep text-[var(--lf-text-muted)]" aria-hidden>•</span>
              <span className="capitalize text-[var(--lf-brand)]">{job.category ?? "—"}</span>
              <Badge
                count={`${scanRadius} km radius`}
                style={{ backgroundColor: "var(--lf-card)", color: "var(--lf-text-secondary)", borderColor: "var(--lf-border)" }}
              />
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--lf-text-muted)] font-mono mt-1">
              <span>Job #{job.id}</span>
              {totalCells > 0 && (
                <span>
                  Cells: {completedCells} / {totalCells} completed
                </span>
              )}
              {totalSearchUnits > 0 && (
                <span>
                  Search Units: {completedSearchUnits + failedSearchUnits} / {totalSearchUnits} processed
                  {failedSearchUnits > 0 && (
                    <span className="ml-1 text-[var(--lf-warning)]">({failedSearchUnits} failed)</span>
                  )}
                </span>
              )}
            </div>
          </div>
          <StatusTag status={job.status} />
        </div>

        {/* Current Active Geographic Cell Info & Coverage Progress */}
        {(running || paused) && (
          <div className="flex flex-col gap-2 rounded-lg border border-[var(--lf-border)] bg-[var(--lf-info-soft)] p-2.5 text-xs sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2 font-medium text-[var(--lf-text-secondary)]">
              <CompassOutlined className={running ? "animate-spin text-[var(--lf-brand)]" : "text-[var(--lf-text-muted)]"} />
              <span>Current Search Zone: <strong className="text-[var(--lf-text)]">{currentCell}</strong></span>
            </span>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-[var(--lf-text-secondary)]">Coverage: <strong className="text-[var(--lf-brand)]">{coverageProgress}%</strong></span>
              {processedProgress !== coverageProgress && (
                <span className="text-[var(--lf-text-muted)]">(Processed: {processedProgress}%)</span>
              )}
            </div>
          </div>
        )}

        {/* Radar & Progress Bar Section */}
        <div className="flex flex-col gap-2">
          {running ? (
            <div className="relative w-full h-3 rounded-full bg-[var(--lf-track)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--lf-brand)] transition-all duration-300"
                style={{ width: `${Math.max(5, coverageProgress)}%` }}
              />
              <div className="absolute inset-0 animate-pulse bg-[color:color-mix(in_srgb,var(--lf-surface)_20%,transparent)]" />
            </div>
          ) : (
            <div
              role="progressbar"
              aria-valuenow={failed ? 100 : coverageProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="w-full h-2.5 rounded-full bg-[var(--lf-track)] overflow-hidden"
            >
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  failed
                    ? "bg-[var(--lf-error)]"
                    : completed
                    ? (failedSearchUnits > 0 ? "bg-[var(--lf-warning)]" : "bg-[var(--lf-success)]")
                    : cancelled
                    ? "bg-[var(--lf-text-muted)]"
                    : "bg-[var(--lf-brand)]"
                }`}
                style={{ width: `${failed ? 100 : coverageProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Live Geographic Scanner Map */}
        <div className="lf-scan-map-frame">
          <ScanLiveMap job={job} scanning={running} onSelectLead={onOpenLead} />
        </div>

        {/* 4-Stat Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="lf-metric-card flex flex-col">
            <span className="text-xs text-[var(--lf-text-muted)] font-medium">Businesses Found</span>
            <span className="text-lg font-bold font-mono text-[var(--lf-text)] mt-1">
              {businessesFound.toLocaleString()}
            </span>
          </div>

          <div className="lf-metric-card flex flex-col">
            <Tooltip title="Stored in CRM with verified email or phone">
              <span className="text-xs text-[var(--lf-text-muted)] font-medium flex items-center gap-1 cursor-help">
                <span className="text-[var(--lf-success)]">●</span> Stored Leads
              </span>
            </Tooltip>
            <span className="text-lg font-bold font-mono text-[var(--lf-success)] mt-1">
              {businessesStored.toLocaleString()}
            </span>
          </div>

          <div className="lf-metric-card flex flex-col">
            <Tooltip title="Skipped places that have neither an email address nor a phone number">
              <span className="text-xs text-[var(--lf-text-muted)] font-medium flex items-center gap-1 cursor-help">
                <FilterOutlined /> Skipped (No Contact)
              </span>
            </Tooltip>
            <span className="text-lg font-bold font-mono text-[var(--lf-text-secondary)] mt-1">
              {businessesSkipped.toLocaleString()}
            </span>
          </div>

          <div className="lf-metric-card flex flex-col">
            <Tooltip title="Already known leads updated with any new contact info">
              <span className="text-xs text-[var(--lf-text-muted)] font-medium cursor-help">
                Duplicates Enriched
              </span>
            </Tooltip>
            <span className="text-lg font-bold font-mono text-[var(--lf-brand)] mt-1">
              {businessesDuplicates.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Live Discovered Leads Feed */}
        {recentLeads.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--lf-text-secondary)] uppercase tracking-wider">
                Live Discovered Leads Feed (latest {displayedRecentLeads.length} of {recentLeads.length})
              </span>
              <Link href={job.city ? `/businesses?city=${encodeURIComponent(job.city)}` : "/businesses"}>
                <span className="text-xs text-[var(--lf-brand)] hover:underline flex items-center gap-1">
                  View in CRM <RightOutlined className="text-[10px]" />
                </span>
              </Link>
            </div>

            <div className="max-h-56 overflow-y-auto rounded-lg border border-[var(--lf-border)] bg-[var(--lf-card)] divide-y divide-[var(--lf-border)]">
              {displayedRecentLeads.map((lead) => (
                <div key={lead.id} className="p-2.5 flex items-center justify-between gap-2 hover:bg-[var(--lf-subtle)] transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[var(--lf-text)] truncate">{lead.name}</p>
                    <p className="text-[11px] text-[var(--lf-text-muted)] truncate">{lead.city} • {lead.category}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {lead.has_phone && (
                      <Tooltip title="Phone Available">
                        <Tag color="success" icon={<PhoneOutlined />} className="lf-status-badge m-0 px-1 py-0 text-[10px]">Phone</Tag>
                      </Tooltip>
                    )}
                    {lead.has_email && (
                      <Tooltip title="Email Available">
                        <Tag color="processing" icon={<MailOutlined />} className="lf-status-badge m-0 px-1 py-0 text-[10px]">Email</Tag>
                      </Tooltip>
                    )}
                    {lead.has_website && (
                      <Tooltip title="Has Website">
                        <Tag icon={<GlobalOutlined />} className="lf-status-badge m-0 px-1 py-0 text-[10px]">Web</Tag>
                      </Tooltip>
                    )}
                    {lead.lead_grade && (
                      <Tag color={lead.lead_grade === "A" ? "success" : lead.lead_grade === "B" ? "processing" : lead.lead_grade === "C" ? "warning" : "default"} className="lf-status-badge m-0 px-1.5 py-0 text-[10px] font-bold">
                        {lead.lead_grade}
                      </Tag>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completion Action Footer */}
        {completed && (
          <div className="flex items-center justify-between pt-2 border-t border-[var(--lf-border)]">
            <p className="text-xs text-[var(--lf-text-muted)]">
              {businessesStored > 0
                ? `${businessesStored.toLocaleString()} actionable leads with contact info stored in CRM.`
                : "Continuous scan completed. All returned places were duplicates or lacked contacts."}
            </p>
            <Link href={job.city ? `/businesses?city=${encodeURIComponent(job.city)}` : "/businesses"}>
              <Button type="primary" size="small" icon={<RightOutlined aria-hidden />}>
                View businesses in CRM
              </Button>
            </Link>
          </div>
        )}

        {/* Failure alert message */}
        {failed && (
          <Alert
            type="error"
            showIcon
            title="Continuous Scan Failed"
            description={job.error_message || "The scan encountered an unexpected error."}
            className="text-xs"
          />
        )}
      </div>
    </Panel>
  );
}

