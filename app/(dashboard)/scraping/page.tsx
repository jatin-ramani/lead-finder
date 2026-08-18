"use client";

import LiveScrapeProgress from "@/features/scraping/components/LiveScrapeProgress";
import ScrapeActionsPanel from "@/features/scraping/components/ScrapeActionsPanel";
import ScrapeJobHistory from "@/features/scraping/components/ScrapeJobHistory";
import { useScrapeRunner } from "@/features/scraping/hooks/useScrapeRunner";

export default function ScrapingPage() {
  const {
    activeJobId,
    setSelectedJobId,
    scrapeAll,
    scrapeMissing,
    retryFailed,
    deleteJob,
    isPendingLauncher,
  } = useScrapeRunner();

  return (
    <div className="flex flex-col gap-5">
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
        onSelectJob={setSelectedJobId}
        onDeleteJob={deleteJob}
      />
    </div>
  );
}
