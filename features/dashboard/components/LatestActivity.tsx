"use client";

import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  RadarChartOutlined,
  RightOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Skeleton, Tooltip } from "antd";
import Link from "next/link";
import type { ReactNode } from "react";

import EmptyState from "@/components/EmptyState";
import Panel from "@/components/Panel";
import {
  formatAbsoluteTime,
  formatDuration,
  formatRelativeTime,
} from "@/lib/format";
import type { ScanJob, ScrapeJob } from "@/types/api";

interface LatestActivityProps {
  scanJob: ScanJob | null | undefined;
  scrapeJob: ScrapeJob | null | undefined;
  isLoading: boolean;
}

function StatusMark({ status }: { status: string }) {
  if (status === "Running" || status === "Pending") {
    return (
      <span className="lf-activity-mark lf-activity-mark--running" aria-label="Running">
        <LoadingOutlined aria-hidden />
      </span>
    );
  }

  if (status === "Completed") {
    return (
      <span className="lf-activity-mark lf-activity-mark--ok" aria-label="Completed">
        <CheckCircleFilled aria-hidden />
      </span>
    );
  }

  return (
    <span className="lf-activity-mark lf-activity-mark--bad" aria-label={status}>
      <CloseCircleFilled aria-hidden />
    </span>
  );
}

function Row({
  icon,
  title,
  meta,
  when,
  status,
  href,
}: {
  icon: ReactNode;
  title: string;
  meta: string;
  when: ReactNode;
  status: string;
  href?: string;
}) {
  const body = (
    <>
      <span className="lf-activity-icon" aria-hidden>
        {icon}
      </span>
      <span className="lf-activity-body">
        <span className="lf-activity-title">{title}</span>
        <span className="lf-activity-meta">
          {meta}
          {when && (
            <>
              <span className="lf-activity-dot" aria-hidden>
                ·
              </span>
              {when}
            </>
          )}
        </span>
      </span>
      <StatusMark status={status} />
      {href && <RightOutlined className="lf-activity-chevron" aria-hidden />}
    </>
  );

  return href ? (
    <Link href={href} className="lf-activity-row">
      {body}
    </Link>
  ) : (
    <div className="lf-activity-row lf-activity-row--static">{body}</div>
  );
}

/**
 * The two most recent things that happened.
 *
 * Deliberately **not** "Today". Businesses and scan jobs carry no timestamp of
 * any kind, so the backend cannot say what happened in any given window — only
 * what happened most recently. A panel headed "Today" would be inventing a
 * time filter the data cannot support.
 *
 * Where a real timestamp does exist, on scrape jobs, it is shown. Where none
 * exists, on scan jobs, nothing is shown rather than a guess.
 */
export default function LatestActivity({
  scanJob,
  scrapeJob,
  isLoading,
}: LatestActivityProps) {
  if (isLoading) {
    return (
      <Panel title="Latest activity" description="The most recent scan and scrape">
        <Skeleton active title={false} paragraph={{ rows: 4 }} />
      </Panel>
    );
  }

  if (!scanJob && !scrapeJob) {
    return (
      <Panel title="Latest activity" description="The most recent scan and scrape">
        <EmptyState
          compact
          title="Nothing has run yet"
          description="Your first scan will show up here."
          action={undefined}
        />
      </Panel>
    );
  }

  const scrapeWhen = formatRelativeTime(
    scrapeJob?.completed_at ?? scrapeJob?.started_at,
  );
  const scrapeExact = formatAbsoluteTime(
    scrapeJob?.completed_at ?? scrapeJob?.started_at,
  );
  const scrapeDuration = formatDuration(
    scrapeJob?.started_at,
    scrapeJob?.completed_at,
  );

  return (
    <Panel
      title="Latest activity"
      description="The most recent scan and scrape"
      flush
    >
      <div className="lf-activity-list">
        {scanJob && (
          <Row
            icon={<RadarChartOutlined />}
            title={`Scanned ${scanJob.city ?? "an unknown city"}`}
            meta={`${scanJob.total_businesses.toLocaleString()} results · ${scanJob.new_businesses.toLocaleString()} new`}
            // Scan jobs have no timestamp. The job number is the only ordering
            // the backend provides, so that is what is shown.
            when={<span className="lf-mono">#{scanJob.id}</span>}
            status={scanJob.status}
            href="/scanner"
          />
        )}

        {scrapeJob && (
          <Row
            icon={<SearchOutlined />}
            title={`Scraped ${scrapeJob.total_websites.toLocaleString()} websites`}
            meta={`${scrapeJob.success.toLocaleString()} succeeded · ${scrapeJob.failed.toLocaleString()} failed${
              scrapeDuration ? ` · ${scrapeDuration}` : ""
            }`}
            when={
              scrapeWhen ? (
                <Tooltip title={scrapeExact}>
                  <span tabIndex={0}>{scrapeWhen}</span>
                </Tooltip>
              ) : null
            }
            status={scrapeJob.status}
          />
        )}
      </div>
    </Panel>
  );
}
