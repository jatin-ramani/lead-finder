"use client";

import { Skeleton } from "antd";

import Panel from "@/components/Panel";
import { CHART_COLORS } from "@/lib/theme";
import type { DashboardWebsiteStats } from "@/types/api";

interface ScrapeHealthPanelProps {
  websiteData: DashboardWebsiteStats | undefined;
  neverScraped: number;
  successRate: number;
  isLoading: boolean;
}

function Meter({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="lf-meter">
      <div className="lf-meter-head">
        <span className="lf-meter-label">{label}</span>
        <span className="lf-meter-value">
          {value.toLocaleString()}
          <span className="lf-meter-total">/ {total.toLocaleString()}</span>
        </span>
      </div>
      <div
        className="lf-meter-track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${value} of ${total}`}
      >
        <span style={{ width: `${percent}%`, background: color }} />
      </div>
    </div>
  );
}

/**
 * How the website scraping is going.
 *
 * `neverScraped` is the only derived figure — `withWebsite` minus
 * `totalScraped`, both from the same payload. It is the number that tells you
 * there is work left to do, and the backend does not report it directly.
 */
export default function ScrapeHealthPanel({
  websiteData,
  neverScraped,
  successRate,
  isLoading,
}: ScrapeHealthPanelProps) {
  return (
    <Panel
      title="Scraping health"
      description="Contact details extracted from the websites found so far"
      extra={
        websiteData && websiteData.totalScraped > 0 ? (
          <span className="lf-panel-badge">{successRate}% success</span>
        ) : undefined
      }
    >
      {isLoading || !websiteData ? (
        <Skeleton active title={false} paragraph={{ rows: 4 }} />
      ) : websiteData.totalScraped === 0 && neverScraped === 0 ? (
        <p className="lf-panel-empty">
          No websites to scrape yet. Businesses with a site appear here once a
          scan finds them.
        </p>
      ) : (
        <div className="lf-meters">
          <Meter
            label="Scraped successfully"
            value={websiteData.completed}
            total={websiteData.totalScraped}
            color={CHART_COLORS.series1}
          />
          <Meter
            label="Failed"
            value={websiteData.failed}
            total={websiteData.totalScraped}
            color="var(--lf-down)"
          />
          {websiteData.pending > 0 && (
            <Meter
              label="Pending"
              value={websiteData.pending}
              total={websiteData.totalScraped}
              color={CHART_COLORS.neutral}
            />
          )}

          {neverScraped > 0 && (
            <p className="lf-panel-note">
              <strong>{neverScraped.toLocaleString()}</strong>{" "}
              {neverScraped === 1 ? "website has" : "websites have"} never been
              scraped.
            </p>
          )}
        </div>
      )}
    </Panel>
  );
}
