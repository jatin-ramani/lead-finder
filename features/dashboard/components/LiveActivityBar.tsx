"use client";

import { LoadingOutlined, RightOutlined } from "@ant-design/icons";
import { Progress } from "antd";
import Link from "next/link";

import type { ScanJob, ScrapeJob } from "@/types/api";

interface LiveActivityBarProps {
  scanJob: ScanJob | null | undefined;
  scrapeJob: ScrapeJob | null | undefined;
}

/**
 * Shown only while something is actually running.
 *
 * The answer to "is anything happening right now" should be a glance, not a
 * hunt — and when nothing is running this renders nothing at all rather than
 * an "Idle" card taking up space to say so.
 *
 * `role="status"` announces it when it appears, which is the point: a scan
 * started from another tab shows up here.
 */
export default function LiveActivityBar({
  scanJob,
  scrapeJob,
}: LiveActivityBarProps) {
  const scanRunning = scanJob?.status === "Running";
  const scrapeRunning = scrapeJob?.status === "Running";

  if (!scanRunning && !scrapeRunning) return null;

  return (
    <div className="lf-live-bar" role="status" aria-live="polite">
      {scanRunning && scanJob && (
        <Link href="/scanner" className="lf-live-item">
          <span className="lf-live-icon" aria-hidden>
            <LoadingOutlined />
          </span>
          <span className="lf-live-body">
            <span className="lf-live-title">
              Scanning {scanJob.city ?? "…"}
              {scanJob.category ? ` · ${scanJob.category}` : ""}
            </span>
            <Progress
              percent={scanJob.progress}
              size="small"
              showInfo={scanJob.progress > 0}
              strokeColor="var(--lf-accent)"
              aria-label={`Scan progress ${scanJob.progress}%`}
            />
          </span>
          <RightOutlined className="lf-live-chevron" aria-hidden />
        </Link>
      )}

      {scrapeRunning && scrapeJob && (
        <div className="lf-live-item lf-live-item--static">
          <span className="lf-live-icon" aria-hidden>
            <LoadingOutlined />
          </span>
          <span className="lf-live-body">
            <span className="lf-live-title">
              Scraping websites · {scrapeJob.completed} of{" "}
              {scrapeJob.total_websites}
            </span>
            <Progress
              percent={scrapeJob.progress}
              size="small"
              strokeColor="var(--lf-accent)"
              aria-label={`Scrape progress ${scrapeJob.progress}%`}
            />
          </span>
        </div>
      )}
    </div>
  );
}
