"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";
import { Skeleton } from "antd";

import PageContainer from "@/components/ui/PageContainer";
import LiveScrapeProgress from "@/features/scraping/components/LiveScrapeProgress";
import ScrapeActionsPanel from "@/features/scraping/components/ScrapeActionsPanel";
import ScrapeJobDetails from "@/features/scraping/components/ScrapeJobDetails";
import ScrapeJobHistory from "@/features/scraping/components/ScrapeJobHistory";
import { useScrapeRunner } from "@/features/scraping/hooks/useScrapeRunner";

function ScrapingPageIntro() {
  return (
    <div className="lf-page-intro">
      <div className="lf-page-intro-copy">
        <h1 className="lf-page-title">Website Scraper</h1>
        <p className="lf-page-subtitle">
          Enrich discovered businesses with website contact details and track every scrape job.
        </p>
      </div>
    </div>
  );
}
function ScrapingWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const jobParam = searchParams.get("job");
  const selectedJobIdFromUrl = jobParam ? Number.parseInt(jobParam, 10) : null;
  const validJobId =
    selectedJobIdFromUrl && !Number.isNaN(selectedJobIdFromUrl) && selectedJobIdFromUrl > 0
      ? selectedJobIdFromUrl
      : null;

  const {
    activeJobId,
    setSelectedJobId,
    scrapeAll,
    scrapeMissing,
    retryFailed,
    deleteJob,
    isPendingLauncher,
  } = useScrapeRunner();

  const handleSelectJob = useCallback(
    (id: number) => {
      setSelectedJobId(id);
      router.push(`${pathname}?job=${id}`);
    },
    [pathname, router, setSelectedJobId],
  );

  const handleBackToHistory = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  // If a specific job is selected in URL, render the comprehensive ScrapeJobDetails view
  if (validJobId) {
    return (
      <PageContainer>
        <ScrapingPageIntro />
        <ScrapeJobDetails
          jobId={validJobId}
          onBack={handleBackToHistory}
          onRetryFailed={retryFailed}
          isRetrying={isPendingLauncher}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ScrapingPageIntro />

      {/* Live Progress View */}
      <LiveScrapeProgress jobId={activeJobId} />

      {/* Scrape Launchers Panel */}
      <ScrapeActionsPanel
        onScrapeMissing={scrapeMissing}
        onScrapeAll={scrapeAll}
        onRetryFailed={retryFailed}
        disabled={isPendingLauncher}
      />

      {/* Scrape Job History Table */}
      <ScrapeJobHistory
        activeJobId={activeJobId}
        onSelectJob={handleSelectJob}
        onDeleteJob={deleteJob}
      />
    </PageContainer>
  );
}

export default function ScrapingPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <ScrapingPageIntro />
          <div className="lf-panel">
            <Skeleton active paragraph={{ rows: 3 }} />
          </div>
          <div className="lf-panel">
            <Skeleton active paragraph={{ rows: 5 }} />
          </div>
        </PageContainer>
      }
    >
      <ScrapingWorkspace />
    </Suspense>
  );
}
