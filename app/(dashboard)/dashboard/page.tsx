"use client";

import {
  PlusOutlined,
  ReloadOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import Link from "next/link";

import ErrorState from "@/components/feedback/ErrorState";
import PageContainer from "@/components/ui/PageContainer";
import CoveragePanel from "@/features/dashboard/components/CoveragePanel";
import DashboardKpiRow from "@/features/dashboard/components/DashboardKpiRow";
import LatestActivity from "@/features/dashboard/components/LatestActivity";
import LiveActivityBar from "@/features/dashboard/components/LiveActivityBar";
import NextActions from "@/features/dashboard/components/NextActions";
import ScrapeHealthPanel from "@/features/dashboard/components/ScrapeHealthPanel";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";

export default function DashboardPage() {
  const { stats, derived, isLoading, isFetching, error, refetch } =
    useDashboard();

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
    <PageContainer>
      {/* Top Title & Actions Header */}
      <div className="lf-page-intro">
        <div className="lf-page-intro-copy">
          <h1 className="lf-page-title">Dashboard</h1>
          <p className="lf-page-subtitle">
            Live overview of discovered leads, conversion pipelines, and scanning health
          </p>
        </div>

        <div className="lf-page-toolbar">
          <Link href="/businesses">
            <Button
              className="lf-pill-btn-secondary"
              icon={<UnorderedListOutlined />}
            >
              View Leads
            </Button>
          </Link>

          <Link href="/scanner">
            <Button
              type="primary"
              className="lf-pill-btn-primary"
              icon={<PlusOutlined />}
            >
              Scan Leads
            </Button>
          </Link>

          <Button
            shape="circle"
            icon={<ReloadOutlined spin={isFetching} />}
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-label="Refresh dashboard metrics"
            className="!rounded-full border-[var(--lf-border)] hover:border-[var(--lf-border-focus)]"
          />
        </div>
      </div>

      {/* Top 4 KPI Metrics Row with Hero Dark Green Card */}
      <DashboardKpiRow
        business={stats?.business}
        opportunityShare={derived.opportunityShare}
        isLoading={isLoading}
      />

      {/* Live Activity Banner if any scan or scrape is running */}
      <LiveActivityBar
        scanJob={stats?.latestScanJob}
        scrapeJob={stats?.latestScrapeJob}
      />

      {/* Middle Grid: Website Coverage & Scraping Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CoveragePanel business={stats?.business} isLoading={isLoading} />

        <ScrapeHealthPanel
          websiteData={stats?.websiteData}
          neverScraped={derived.neverScraped}
          successRate={derived.scrapeSuccessRate}
          isLoading={isLoading}
        />
      </div>

      {/* Lower Grid: Recommended Actions & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <NextActions stats={stats} derived={derived} />

        <LatestActivity
          scanJob={stats?.latestScanJob}
          scrapeJob={stats?.latestScrapeJob}
          isLoading={isLoading}
        />
      </div>
    </PageContainer>
  );
}
