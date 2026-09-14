"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import ErrorState from "@/components/feedback/ErrorState";
import PageContainer from "@/components/ui/PageContainer";
import BusinessDrawer from "@/features/businesses/components/BusinessDrawer";
import { useDeleteBusiness } from "@/features/businesses/hooks/useBusinessMutations";
import ScanForm from "@/features/scanning/components/ScanForm";
import ScanHistory from "@/features/scanning/components/ScanHistory";
import ScanProgress from "@/features/scanning/components/ScanProgress";
import ScanStats from "@/features/scanning/components/ScanStats";
import {
  useLatestScanJob,
  useScanJobs,
} from "@/features/scanning/hooks/useScanJobs";
import { useScanRunner } from "@/features/scanning/hooks/useScanRunner";
import { businessesApi, queryKeys } from "@/services";

export default function ScannerPage() {
  const { jobs, stats, isLoading: historyLoading, error: historyError, refetch } =
    useScanJobs();
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const deleteBusiness = useDeleteBusiness();

  const {
    job: latest,
    isNeverScanned,
    isLoading: latestLoading,
    error: latestError,
    refetch: refetchLatest,
  } = useLatestScanJob();

  const selectedLead = useQuery({
    queryKey: queryKeys.businesses.detail(selectedLeadId ?? 0),
    queryFn: ({ signal }) => businessesApi.getBusiness(selectedLeadId!, signal),
    enabled: selectedLeadId !== null,
  });

  const {
    start,
    retry,
    canRetry,
    scanning,
    watching,
    pauseScan,
    resumeScan,
    cancelScan,
    clearData,
    isClearing,
    isPausing,
    isResuming,
    isCancelling,
  } = useScanRunner(latest);

  const closeLeadDetails = () => setSelectedLeadId(null);

  return (
    <PageContainer>
      <div className="lf-page-intro">
        <div className="lf-page-intro-copy">
          <h1 className="lf-page-title">Lead Scanner</h1>
          <p className="lf-page-subtitle">
            Discover businesses across your target market with continuous multi-cell
            geographic scanning.
          </p>
        </div>
      </div>

      <ScanStats stats={stats} isLoading={historyLoading} />

      <div className="lf-scanner-workspace">
        <ScanForm
          onSubmit={start}
          scanning={scanning}
          onClearData={clearData}
          isClearing={isClearing}
        />

        <ScanProgress
          job={latest}
          isNeverScanned={isNeverScanned}
          isLoading={latestLoading}
          error={latestError}
          onRetry={() => void refetchLatest()}
          onRunAgain={retry}
          canRunAgain={canRetry}
          watching={watching}
          onPause={pauseScan}
          onResume={resumeScan}
          onCancel={cancelScan}
          isPausing={isPausing}
          isResuming={isResuming}
          isCancelling={isCancelling}
          onOpenLead={setSelectedLeadId}
        />
      </div>

      {selectedLeadId !== null && selectedLead.isLoading && (
        <p className="sr-only" role="status">
          Loading lead details
        </p>
      )}

      {selectedLeadId !== null && selectedLead.isError && (
        <div className="mb-4">
          <ErrorState
            error={selectedLead.error}
            onRetry={() => void selectedLead.refetch()}
            variant="inline"
            title="Could not load lead details"
          />
        </div>
      )}

      <ScanHistory
        jobs={jobs}
        isLoading={historyLoading}
        error={historyError}
        onRetry={() => void refetch()}
      />

      <BusinessDrawer
        business={selectedLead.data ?? null}
        open={selectedLead.data != null}
        onClose={closeLeadDetails}
        onDelete={async (business) => {
          await deleteBusiness.mutateAsync(business.id);
          closeLeadDetails();
        }}
        isDeleting={deleteBusiness.isPending}
      />
    </PageContainer>
  );
}
