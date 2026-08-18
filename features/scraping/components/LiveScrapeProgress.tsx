"use client";

import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from "@ant-design/icons";
import { Tag } from "antd";

import Panel from "@/components/Panel";
import { isScrapeRunning, useScrapeJob } from "../hooks/useScrapeJobs";

interface LiveScrapeProgressProps {
  jobId: number | null;
}

export default function LiveScrapeProgress({ jobId }: LiveScrapeProgressProps) {
  const { job, isLoading } = useScrapeJob(jobId);

  if (jobId === null || (!job && !isLoading)) {
    return (
      <Panel
        title="Live scrape progress"
        description="Select a scrape job from history or launch a new scrape to track progress live."
      >
        <div className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          No scrape job currently selected.
        </div>
      </Panel>
    );
  }

  if (!job) {
    return (
      <Panel title="Live scrape progress" description="Loading job details...">
        <div className="h-20 flex items-center justify-center text-gray-400 text-sm">
          Loading scrape job #{jobId}...
        </div>
      </Panel>
    );
  }

  const running = isScrapeRunning(job.status);
  const percent = job.progress ?? 0;
  const showIndeterminate = running && percent === 0;

  const renderStatusTag = () => {
    switch (job.status) {
      case "Running":
        return (
          <Tag icon={<SyncOutlined spin />} color="processing">
            Running
          </Tag>
        );
      case "Pending":
        return (
          <Tag icon={<SyncOutlined spin />} color="warning">
            Pending
          </Tag>
        );
      case "Completed":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Completed
          </Tag>
        );
      case "Failed":
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Failed
          </Tag>
        );
      default:
        return <Tag>{job.status}</Tag>;
    }
  };

  return (
    <Panel
      title={`Scrape job #${job.id}`}
      description={
        running
          ? "Website scraper is actively visiting targets and extracting content."
          : `Scrape finished with status ${job.status}.`
      }
      extra={renderStatusTag()}
    >
      <div className="space-y-6">
        {/* Progress Bar / Loader */}
        <div>
          <div className="flex justify-between items-center mb-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">
            <span>
              {showIndeterminate ? "Processing websites..." : `${percent}% completed`}
            </span>
            {job.current_business_id !== null && running && (
              <span className="text-blue-600 dark:text-blue-400 font-mono">
                Current business #{job.current_business_id}
              </span>
            )}
          </div>

          {showIndeterminate ? (
            <div
              className="h-3 w-full bg-blue-100 dark:bg-blue-950/60 rounded-full overflow-hidden relative"
              aria-label="Processing websites"
            >
              <div className="absolute inset-0 bg-blue-500/30 dark:bg-blue-400/30 animate-pulse" />
              <div className="h-full bg-blue-600 dark:bg-blue-400 rounded-full animate-indeterminate w-1/3" />
            </div>
          ) : (
            <div
              className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  job.status === "Failed"
                    ? "bg-red-500"
                    : job.status === "Completed"
                      ? "bg-emerald-500"
                      : "bg-blue-600 dark:bg-blue-400"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
              />
            </div>
          )}
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
            <dt className="text-xs text-gray-500 dark:text-gray-400">Total Targets</dt>
            <dd className="text-lg font-semibold font-mono text-gray-900 dark:text-white mt-0.5">
              {(job.total_websites ?? 0).toLocaleString()}
            </dd>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
            <dt className="text-xs text-gray-500 dark:text-gray-400">Processed</dt>
            <dd className="text-lg font-semibold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
              {(job.completed ?? 0).toLocaleString()}
            </dd>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
            <dt className="text-xs text-gray-500 dark:text-gray-400">Success</dt>
            <dd className="text-lg font-semibold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {(job.success ?? 0).toLocaleString()}
            </dd>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
            <dt className="text-xs text-gray-500 dark:text-gray-400">Failed</dt>
            <dd className="text-lg font-semibold font-mono text-red-600 dark:text-red-400 mt-0.5">
              {(job.failed ?? 0).toLocaleString()}
            </dd>
          </div>
        </div>

        {/* Timestamps */}
        <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-4 pt-1">
          {job.started_at && (
            <div>
              Started: <span className="font-mono">{new Date(job.started_at).toLocaleString()}</span>
            </div>
          )}
          {job.completed_at && (
            <div>
              Completed: <span className="font-mono">{new Date(job.completed_at).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Polite ARIA status updates */}
        <div className="sr-only" aria-live="polite">
          Scrape job {job.id} status is {job.status}. Processed {job.completed} of {job.total_websites}.
        </div>
      </div>
    </Panel>
  );
}
