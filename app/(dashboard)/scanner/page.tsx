"use client";

import ScanForm from "@/features/scanning/components/ScanForm";
import ScanHistory from "@/features/scanning/components/ScanHistory";
import ScanProgress from "@/features/scanning/components/ScanProgress";
import ScanStats from "@/features/scanning/components/ScanStats";
import {
  useLatestScanJob,
  useScanJobs,
} from "@/features/scanning/hooks/useScanJobs";
import { useScanRunner } from "@/features/scanning/hooks/useScanRunner";

/**
 * Scanner — discover businesses from Geoapify.
 *
 * Uses every scan endpoint: `POST /scan` to run one, `GET /scan/jobs/latest`
 * for live progress, `GET /scan/jobs` for history and totals.
 *
 * The form and the progress panel share one `scanning` flag, so the button is
 * disabled for as long as a scan is actually running — including a scan
 * started in another tab, because the flag is derived from the job's status
 * and not from local state.
 */
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

  const { start, retry, canRetry, scanning } = useScanRunner();

  return (
    <div className="flex flex-col gap-5">
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
        />
      </div>

      <ScanHistory
        jobs={jobs}
        isLoading={historyLoading}
        error={historyError}
        onRetry={() => void refetch()}
      />
    </div>
  );
}
