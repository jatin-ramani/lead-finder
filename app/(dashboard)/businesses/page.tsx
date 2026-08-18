"use client";

import { App } from "antd";
import { Suspense, useCallback, useState } from "react";

import ErrorState from "@/components/feedback/ErrorState";
import BusinessBulkBar from "@/features/businesses/components/BusinessBulkBar";
import BusinessDrawer from "@/features/businesses/components/BusinessDrawer";
import BusinessFilterBar from "@/features/businesses/components/BusinessFilterBar";
import BusinessTable from "@/features/businesses/components/BusinessTable";
import BusinessesSkeleton from "@/features/businesses/components/BusinessesSkeleton";
import ExportModal from "@/features/businesses/components/ExportModal";
import { useBusinessList } from "@/features/businesses/hooks/useBusinessList";
import {
  useDeleteBusiness,
  useDeleteBusinesses,
} from "@/features/businesses/hooks/useBusinessMutations";
import { useExportBusinesses } from "@/features/businesses/hooks/useExportBusinesses";
import { useScrapeRunner } from "@/features/scraping/hooks/useScrapeRunner";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import type { Business } from "@/types/api";

function BusinessesWorkspace() {
  const filters = useUrlFilters();
  const { modal } = App.useApp();

  const {
    businesses,
    pagination,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useBusinessList(filters.query);

  const deleteOne = useDeleteBusiness();
  const deleteMany = useDeleteBusinesses();
  const { exportFiltered, exportSelected, isExporting } = useExportBusinesses();

  const { scrapeSelected, scrapeSingle, isPendingLauncher } = useScrapeRunner();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [detail, setDetail] = useState<Business | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<"filtered" | "selected">("filtered");

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const openExportFiltered = useCallback(() => {
    setExportScope("filtered");
    setExportModalOpen(true);
  }, []);

  const openExportSelected = useCallback(() => {
    setExportScope("selected");
    setExportModalOpen(true);
  }, []);

  const confirmDeleteOne = useCallback(
    (business: Business) => {
      modal.confirm({
        title: "Delete this business?",
        content: (
          <>
            <strong>{business.name}</strong> will be permanently removed, along
            with any website data scraped from it. This cannot be undone.
          </>
        ),
        okText: "Delete",
        okButtonProps: { danger: true },
        cancelText: "Keep it",
        onOk: async () => {
          await deleteOne.mutateAsync(business.id);
          setDetail(null);
          setSelectedIds((ids) => ids.filter((id) => id !== business.id));
        },
      });
    },
    [modal, deleteOne],
  );

  const confirmDeleteSelected = useCallback(() => {
    const count = selectedIds.length;

    modal.confirm({
      title: `Delete ${count} ${count === 1 ? "business" : "businesses"}?`,
      content:
        "They will be permanently removed, along with any website data scraped from them. This cannot be undone.",
      okText: `Delete ${count}`,
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        await deleteMany.mutateAsync(selectedIds);
        clearSelection();
      },
    });
  }, [modal, deleteMany, selectedIds, clearSelection]);

  if (error && !isRefetching && businesses.length === 0) {
    return (
      <ErrorState
        error={error}
        onRetry={() => void refetch()}
        title="Could not load businesses"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <BusinessFilterBar
        filters={filters}
        totalItems={pagination?.totalItems}
        onExport={openExportFiltered}
        isExporting={isExporting}
        disabled={isLoading}
      />

      <BusinessBulkBar
        count={selectedIds.length}
        onClear={clearSelection}
        onExport={openExportSelected}
        onDelete={confirmDeleteSelected}
        onScrapeSelected={() => scrapeSelected(selectedIds)}
        isExporting={isExporting}
        isDeleting={deleteMany.isPending}
        isScrapingSelected={isPendingLauncher}
      />

      <BusinessTable
        businesses={businesses}
        pagination={pagination}
        filters={filters}
        isLoading={isLoading}
        isRefetching={isRefetching}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onView={setDetail}
        onDelete={confirmDeleteOne}
        isDeleting={deleteOne.isPending || deleteMany.isPending}
      />

      <BusinessDrawer
        business={detail}
        open={detail !== null}
        onClose={() => setDetail(null)}
        onDelete={confirmDeleteOne}
        isDeleting={deleteOne.isPending}
        onScrapeSingle={(id) => scrapeSingle(id)}
      />

      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        query={filters.query}
        matchingTotal={pagination?.totalItems}
        selectedIds={selectedIds}
        initialScope={exportScope}
        onExportFiltered={exportFiltered}
        onExportSelected={exportSelected}
        isExporting={isExporting}
      />
    </div>
  );
}

export default function BusinessesPage() {
  return (
    <Suspense fallback={<BusinessesSkeleton />}>
      <BusinessesWorkspace />
    </Suspense>
  );
}
