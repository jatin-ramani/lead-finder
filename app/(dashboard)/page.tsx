"use client";

import { ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";

import ErrorState from "@/components/feedback/ErrorState";
import PageContainer from "@/components/ui/PageContainer";
import CoveragePanel from "@/features/dashboard/components/CoveragePanel";
import DashboardHero from "@/features/dashboard/components/DashboardHero";
import LatestActivity from "@/features/dashboard/components/LatestActivity";
import LiveActivityBar from "@/features/dashboard/components/LiveActivityBar";
import NextActions from "@/features/dashboard/components/NextActions";
import ScrapeHealthPanel from "@/features/dashboard/components/ScrapeHealthPanel";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";

export default function DashboardPage() {
  const { stats, derived, isLoading, isFetching, error, refetch } = useDashboard();

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
    <PageContainer
      actions={
        <Button
          icon={<ReloadOutlined spin={isFetching} />}
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </Button>
      }
    >
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
    </PageContainer>
  );
}
