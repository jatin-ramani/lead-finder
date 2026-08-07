"use client";

import { ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";

import ErrorState from "@/components/feedback/ErrorState";
import CoveragePanel from "@/features/dashboard/components/CoveragePanel";
import DashboardHero from "@/features/dashboard/components/DashboardHero";
import LatestActivity from "@/features/dashboard/components/LatestActivity";
import LiveActivityBar from "@/features/dashboard/components/LiveActivityBar";
import NextActions from "@/features/dashboard/components/NextActions";
import ScrapeHealthPanel from "@/features/dashboard/components/ScrapeHealthPanel";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";

/**
 * The product's homepage.
 *
 * Reads one endpoint — `GET /dashboard/stats` — which returns every figure in
 * a single call, so the whole page is one request rather than six.
 *
 * It is arranged around the questions someone actually opens this to ask:
 * how big is the opportunity (the hero), is anything running right now (the
 * live bar, which renders nothing when nothing is), how is the data holding up
 * (coverage and scraping health), what just happened, and what should I do
 * next.
 *
 * One question it deliberately does not answer is "what happened today".
 * Businesses and scan jobs carry no timestamp, so no honest time window can be
 * drawn — see `LatestActivity`.
 */
export default function DashboardPage() {
  const { stats, derived, isLoading, isFetching, error, refetch } = useDashboard();

  // A failed first load has nothing behind it, so the error takes the page.
  // A failed refresh keeps the last good numbers rather than blanking them.
  if (error && !stats) {
    return (
      <ErrorState
        error={error}
        onRetry={() => void refetch()}
        title="Could not load your dashboard"
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="lf-page-actions">
        <Button
          icon={<ReloadOutlined spin={isFetching} />}
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      <LiveActivityBar
        scanJob={stats?.latestScanJob}
        scrapeJob={stats?.latestScrapeJob}
      />

      <DashboardHero
        business={stats?.business}
        opportunityShare={derived.opportunityShare}
        isLoading={isLoading}
      />

      <NextActions stats={stats} derived={derived} />

      <div className="lf-grid-2">
        <CoveragePanel business={stats?.business} isLoading={isLoading} />

        <ScrapeHealthPanel
          websiteData={stats?.websiteData}
          neverScraped={derived.neverScraped}
          successRate={derived.scrapeSuccessRate}
          isLoading={isLoading}
        />
      </div>

      <LatestActivity
        scanJob={stats?.latestScanJob}
        scrapeJob={stats?.latestScrapeJob}
        isLoading={isLoading}
      />
    </div>
  );
}
