"use client";

import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, Progress, Skeleton } from "antd";

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
}

function StatusLine({ job }: { job: LatestScanJob }) {
  if (isRunning(job.status)) {
    return (
      <span className="lf-scan-status lf-scan-status--running">
        <LoadingOutlined aria-hidden />
        {/*
          Progress is 0 for the whole Geoapify call, which is the slow part,
          then climbs quickly as results are stored. Saying "0%" during that
          would read as stuck; naming what is happening does not.
        */}
        {job.progress > 0 ? "Storing results…" : "Contacting Geoapify…"}
      </span>
    );
  }

  if (job.status === "Completed") {
    return (
      <span className="lf-scan-status lf-scan-status--ok">
        <CheckCircleFilled aria-hidden />
        Completed
      </span>
    );
  }

  return (
    <span className="lf-scan-status lf-scan-status--bad">
      <CloseCircleFilled aria-hidden />
      Failed
    </span>
  );
}

/**
 * The most recent scan: what it was, how it is going, what it produced.
 *
 * While a scan is running this is a live view — the hook behind it polls, and
 * stops the moment the job is no longer running.
 */
export default function ScanProgress({
  job,
  isNeverScanned,
  isLoading,
  error,
  onRetry,
  onRunAgain,
  canRunAgain,
}: ScanProgressProps) {
  if (isLoading) {
    return (
      <Panel title="Latest scan" description="Live status of the most recent scan">
        <Skeleton active title={false} paragraph={{ rows: 3, width: ["45%", "100%", "60%"] }} />
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
          description="Start a scan and its progress will appear here."
        />
      </Panel>
    );
  }

  const running = isRunning(job.status);
  const failed = job.status === "Failed";

  return (
    <Panel
      title="Latest scan"
      description="Live status of the most recent scan"
      extra={
        !running &&
        canRunAgain && (
          <Button
            size="small"
            icon={<ReloadOutlined aria-hidden />}
            onClick={onRunAgain}
          >
            {failed ? "Try again" : "Run again"}
          </Button>
        )
      }
    >
      {/*
        Polite, not assertive: the status changes on its own from a poll, and
        an assertive region would interrupt whatever the user is reading.
      */}
      <div className="lf-scan-live" aria-live="polite">
        <div className="lf-scan-head">
          <div className="min-w-0">
            <p className="lf-scan-target">
              <strong>{job.city ?? "Unknown city"}</strong>
              <span className="lf-scan-sep" aria-hidden>
                ·
              </span>
              {job.category ?? "—"}
            </p>
            <p className="lf-scan-id">Job #{job.id}</p>
          </div>
          <StatusLine job={job} />
        </div>

        <Progress
          percent={failed ? 100 : job.progress}
          status={failed ? "exception" : running ? "active" : "success"}
          strokeColor={failed ? undefined : "var(--lf-accent)"}
          // Indeterminate while the provider is being queried: there is no
          // real percentage to show yet, and a stationary 0% looks broken.
          showInfo={!running || job.progress > 0}
          aria-label={`Scan progress: ${job.progress}%`}
        />

        <dl className="lf-scan-figures">
          <div>
            <dt>Results returned</dt>
            <dd>{job.totalBusinesses.toLocaleString()}</dd>
          </div>
          <div>
            <dt>New businesses</dt>
            <dd>{job.newBusinesses.toLocaleString()}</dd>
          </div>
        </dl>

        {job.status === "Completed" && job.totalBusinesses > 0 && job.newBusinesses === 0 && (
          <p className="lf-scan-note">
            Every result was already in your workspace — nothing new was added.
          </p>
        )}
      </div>
    </Panel>
  );
}
