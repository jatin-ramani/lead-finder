"use client";

import { App } from "antd";
import { Suspense, useCallback, useState } from "react";

import ErrorState from "@/components/feedback/ErrorState";
import BusinessBulkBar from "@/features/businesses/components/BusinessBulkBar";
import BusinessDrawer from "@/features/businesses/components/BusinessDrawer";
import BusinessFilterBar from "@/features/businesses/components/BusinessFilterBar";
import BusinessTable from "@/features/businesses/components/BusinessTable";
import BusinessesSkeleton from "@/features/businesses/components/BusinessesSkeleton";
import { useBusinessList } from "@/features/businesses/hooks/useBusinessList";
import {
  useDeleteBusiness,
  useDeleteBusinesses,
} from "@/features/businesses/hooks/useBusinessMutations";
import { useExportBusinesses } from "@/features/businesses/hooks/useExportBusinesses";
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

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [detail, setDetail] = useState<Business | null>(null);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  /**
   * Deleting one row.
   *
   * Confirmed through `Modal.confirm` rather than a `Popconfirm` on the button:
   * the action is reachable from the row menu *and* from the drawer, and a
   * dialog owned here works from both without duplicating the copy.
   */
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
      // The count is in the button, not only the title: it is the last thing
      // read before the click that cannot be taken back.
      okText: `Delete ${count}`,
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        await deleteMany.mutateAsync(selectedIds);
        clearSelection();
      },
    });
  }, [modal, deleteMany, selectedIds, clearSelection]);

  // A failed first load has nothing to show behind it, so the error replaces
  // the table. A failed *refetch* keeps the stale rows and is surfaced by the
  // global handler instead — blanking data the user is reading would be worse.
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
        onExport={() => exportFiltered(filters.query)}
        isExporting={isExporting}
        disabled={isLoading}
      />

      <BusinessBulkBar
        count={selectedIds.length}
        onClear={clearSelection}
        onExport={() => exportSelected(selectedIds)}
        onDelete={confirmDeleteSelected}
        isExporting={isExporting}
        isDeleting={deleteMany.isPending}
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
      />
    </div>
  );
}

/**
 * `useSearchParams` reads request-time information, so anything using it must
 * sit inside a Suspense boundary or the whole route opts out of static
 * rendering. The fallback mirrors the page frame so hydration does not jump.
 */
export default function BusinessesPage() {
  return (
    <Suspense fallback={<BusinessesSkeleton />}>
      <BusinessesWorkspace />
    </Suspense>
  );
}
