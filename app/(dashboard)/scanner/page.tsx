"use client";

import PageContainer from "@/components/ui/PageContainer";
import ScanForm from "@/features/scanning/components/ScanForm";
import ScanHistory from "@/features/scanning/components/ScanHistory";
import ScanProgress from "@/features/scanning/components/ScanProgress";
import ScanStats from "@/features/scanning/components/ScanStats";
import {
  useLatestScanJob,
  useScanJobs,
} from "@/features/scanning/hooks/useScanJobs";
import { useScanRunner } from "@/features/scanning/hooks/useScanRunner";

export default function ScannerPage() {
  const { jobs, stats, isLoading: historyLoading, error: historyError, refetch } =
    useScanJobs();

  const {
    job: latest,
    isNeverScanned,
    isLoading: latestLoading,
    error: latestError,
    refetch: refetchLatest,
  } = useLatestScanJob();

  const { start, retry, canRetry, scanning, watching } = useScanRunner();

  return (
    <PageContainer>
      <ScanStats stats={stats} isLoading={historyLoading} />

      <div className="lf-grid-2">
        <ScanForm onSubmit={start} scanning={scanning} />

        <ScanProgress
          job={latest}
          isNeverScanned={isNeverScanned}
          isLoading={latestLoading}
          error={latestError}
          onRetry={() => void refetchLatest()}
          onRunAgain={retry}
          canRunAgain={canRetry}
          watching={watching}
        />
      </div>

      <ScanHistory
        jobs={jobs}
        isLoading={historyLoading}
        error={historyError}
        onRetry={() => void refetch()}
      />
    </PageContainer>
  );
}
