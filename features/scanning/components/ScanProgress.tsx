"use client";

import {
  CheckCircleFilled,
  CloseCircleFilled,
  CompassOutlined,
  LoadingOutlined,
  ReloadOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Alert, Button, Skeleton, Tag } from "antd";
import Link from "next/link";

import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/feedback/ErrorState";
import Panel from "@/components/Panel";
import type { LatestScanJob } from "@/types/api";

import { isRunning } from "../hooks/useScanJobs";

interface ScanProgressProps {
  job: LatestScanJob | undefined;
  isNeverScanned: boolean;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  onRunAgain: () => void;
  canRunAgain: boolean;
  watching?: boolean;
}

function StatusTag({ status }: { status: string }) {
  if (isRunning(status)) {
    return (
      <Tag color="processing" icon={<LoadingOutlined aria-hidden />} className="lf-tag">
        Running
      </Tag>
    );
  }

  if (status === "Completed") {
    return (
      <Tag color="success" icon={<CheckCircleFilled aria-hidden />} className="lf-tag">
        Completed
      </Tag>
    );
  }

  return (
    <Tag color="error" icon={<CloseCircleFilled aria-hidden />} className="lf-tag">
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
}: ScanProgressProps) {
  if (isLoading) {
    return (
      <Panel title="Latest scan" description="Live status of the most recent scan">
        <Skeleton active title={false} paragraph={{ rows: 4, width: ["45%", "100%", "80%", "60%"] }} />
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel title="Latest scan" description="Live status of the most recent scan">
        <ErrorState
          error={error}
          onRetry={onRetry}
          variant="inline"
          title="Could not read the latest scan"
        />
      </Panel>
    );
  }

  if (isNeverScanned || !job) {
    return (
      <Panel title="Latest scan" description="Live status of the most recent scan">
        <EmptyState
          compact
          title="No scans yet"
          description="Start a scan and its live progress will appear here."
        />
      </Panel>
    );
  }

  const running = isRunning(job.status);
  const failed = job.status === "Failed";
  const completed = job.status === "Completed";

  return (
    <Panel
      title="Latest scan"
      description="Live status of the most recent scan"
      extra={
        !running && canRunAgain ? (
          <Button
            size="small"
            icon={<ReloadOutlined aria-hidden />}
            onClick={onRunAgain}
          >
            {failed ? "Try again" : "Run again"}
          </Button>
        ) : null
      }
    >
      <div className="lf-scan-live flex flex-col gap-4">
        {/* Header with City, Category, Job ID and Status */}
        <div className="lf-scan-head flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="lf-scan-target text-base font-semibold text-[var(--lf-text)]">
              <span>{job.city ?? "Unknown city"}</span>
              <span className="lf-scan-sep text-[var(--lf-text-muted)] mx-2" aria-hidden>
                •
              </span>
              <span className="capitalize text-[var(--lf-text-secondary)]">
                {job.category ?? "—"}
              </span>
            </p>
            <p className="lf-scan-id text-xs text-[var(--lf-text-muted)] font-mono mt-0.5">Job #{job.id}</p>
          </div>
          <StatusTag status={job.status} />
        </div>

        {/* Timeout watching status notification banner */}
        {watching && running && (
          <Alert
            type="info"
            showIcon
            message="Still scanning"
            description="Scan is taking longer than usual. We are continuing to monitor progress in the background."
            className="text-xs"
          />
        )}

        {/* Honest Progress / Loading Section */}
        <div className="flex flex-col gap-2">
          {running && (
            <div className="flex items-center justify-between text-xs font-medium text-[var(--lf-text-secondary)]" aria-live="polite">
              <span className="flex items-center gap-1.5">
                <CompassOutlined className="animate-spin text-[var(--lf-brand)]" aria-hidden />
                {job.progress > 0 ? "Scanning and saving businesses..." : "Discovering businesses..."}
              </span>
              {job.progress > 0 && <span className="font-mono">{job.progress}%</span>}
            </div>
          )}

          {/* Progress bar element */}
          {running && job.progress === 0 ? (
            /* Indeterminate shimmer track — NO fake aria-valuenow */
            <div
              className="w-full h-2 rounded bg-[var(--lf-track)] overflow-hidden relative"
              aria-label="Scan in progress, discovering businesses"
            >
              <div className="absolute inset-0 bg-[var(--lf-brand)]/60 animate-pulse rounded" />
            </div>
          ) : (
            /* Determinate progress bar — ONLY when genuine percentage exists or terminal */
            <div
              role="progressbar"
              aria-valuenow={failed ? 100 : job.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Scan progress: ${job.progress}%`}
              className="w-full h-2 rounded bg-[var(--lf-track)] overflow-hidden"
            >
              <div
                className={`h-full transition-all duration-300 rounded ${
                  failed ? "bg-[var(--lf-error)]" : completed ? "bg-[var(--lf-success)]" : "bg-[var(--lf-brand)]"
                }`}
                style={{ width: `${failed ? 100 : job.progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Live Metrics Grid */}
        <dl className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-[var(--lf-subtle)] border border-[var(--lf-border)]">
          <div>
            <dt className="text-xs text-[var(--lf-text-muted)] font-medium">Businesses discovered</dt>
            <dd className="text-lg font-semibold font-mono text-[var(--lf-text)] mt-0.5">
              {job.totalBusinesses.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--lf-text-muted)] font-medium">New businesses</dt>
            <dd className="text-lg font-semibold font-mono text-[var(--lf-brand)] mt-0.5">
              {job.newBusinesses.toLocaleString()}
            </dd>
          </div>
        </dl>

        {/* Success state footer action */}
        {completed && (
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-[var(--lf-text-muted)]">
              {job.newBusinesses > 0
                ? `${job.newBusinesses.toLocaleString()} new businesses added to workspace.`
                : "All returned results were already in your workspace."}
            </p>
            <Link href={job.city ? `/businesses?city=${encodeURIComponent(job.city)}` : "/businesses"}>
              <Button type="primary" size="small" icon={<RightOutlined aria-hidden />}>
                View businesses
              </Button>
            </Link>
          </div>
        )}

        {/* Failure state footer message */}
        {failed && (
          <Alert
            type="error"
            showIcon
            message="Scan failed"
            description="The scan could not be completed. You can try running it again."
            className="text-xs"
          />
        )}
      </div>
    </Panel>
  );
}
