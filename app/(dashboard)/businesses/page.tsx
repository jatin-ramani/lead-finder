"use client";

import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { App, Button, Skeleton } from "antd";
import { Suspense, useCallback, useMemo, useState } from "react";

import ErrorState from "@/components/feedback/ErrorState";
import BusinessBulkBar from "@/features/businesses/components/BusinessBulkBar";
import BusinessDrawer from "@/features/businesses/components/BusinessDrawer";
import BusinessFilterBar from "@/features/businesses/components/BusinessFilterBar";
import BusinessTable from "@/features/businesses/components/BusinessTable";
import BusinessesSkeleton from "@/features/businesses/components/BusinessesSkeleton";
import CityCardsGrid from "@/features/businesses/components/CityCardsGrid";
import ExportModal from "@/features/businesses/components/ExportModal";
import { useBusinessList } from "@/features/businesses/hooks/useBusinessList";
import {
  useDeleteBusiness,
  useDeleteBusinesses,
} from "@/features/businesses/hooks/useBusinessMutations";
import { useCitySummaries } from "@/features/businesses/hooks/useCitySummaries";
import { useExportBusinesses } from "@/features/businesses/hooks/useExportBusinesses";
import { useScrapeRunner } from "@/features/scraping/hooks/useScrapeRunner";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import type { Business } from "@/types/api";

function BusinessesWorkspace() {
  const filters = useUrlFilters();
  const { modal } = App.useApp();

  const {
    cities,
    isLoading: isCitiesLoading,
    error: citiesError,
    refetch: refetchCities,
  } = useCitySummaries();

  const showCityList =
    !filters.city &&
    filters.view !== "all" &&
    !filters.search &&
    !filters.category &&
    filters.hasWebsite === undefined &&
    !filters.hasEmail &&
    !filters.hasPhone;

  const {
    businesses,
    pagination,
    isLoading: isBusinessesLoading,
    isRefetching,
    error: businessesError,
    refetch: refetchBusinesses,
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

  const activeCitySummary = useMemo(() => {
    if (!filters.city) return null;
    return (
      cities.find(
        (c) => c.city.toLowerCase() === filters.city.toLowerCase(),
      ) ?? null
    );
  }, [cities, filters.city]);

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

  // Level 1: Discovered Cities View
  if (showCityList) {
    if (citiesError && cities.length === 0) {
      return (
        <ErrorState
          error={citiesError}
          onRetry={() => void refetchCities()}
          title="Could not load discovered cities"
        />
      );
    }

    return (
      <CityCardsGrid
        cities={cities}
        isLoading={isCitiesLoading}
        onSelectCity={(cityName) => filters.setFilter("city", cityName)}
        onViewAll={() => filters.setFilter("view", "all")}
      />
    );
  }

  // Level 2: Business Table & Details View
  if (businessesError && !isRefetching && businesses.length === 0) {
    return (
      <ErrorState
        error={businessesError}
        onRetry={() => void refetchBusinesses()}
        title="Could not load businesses"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Navigation Breadcrumb Strip */}
      <div className="lf-nav-header">
        <div className="flex items-center gap-3">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => filters.resetFilters()}
            className="text-[var(--lf-text-secondary)] hover:text-[var(--lf-brand)]"
          >
            All Cities
          </Button>
          <span className="text-[var(--lf-border)]">|</span>
          <div className="flex items-center gap-2">
            {filters.city ? (
              <>
                <EnvironmentOutlined className="text-[var(--lf-brand)]" />
                <span className="font-bold text-[var(--lf-text)]">
                  {filters.city}
                </span>
                {pagination?.totalItems !== undefined && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--lf-accent-soft)] text-[var(--lf-brand)] font-mono font-semibold">
                    {pagination.totalItems.toLocaleString()} leads
                  </span>
                )}
              </>
            ) : (
              <>
                <AppstoreOutlined className="text-[var(--lf-brand)]" />
                <span className="font-bold text-[var(--lf-text)]">
                  All Businesses
                </span>
                {pagination?.totalItems !== undefined && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--lf-accent-soft)] text-[var(--lf-brand)] font-mono font-semibold">
                    {pagination.totalItems.toLocaleString()} total
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Qualification metric pills for active city */}
        {activeCitySummary && (
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded bg-[var(--lf-subtle)] text-[var(--lf-text-secondary)] flex items-center gap-1">
              <GlobalOutlined /> {activeCitySummary.withWebsite} website
            </span>
            <span className="px-2.5 py-1 rounded bg-[var(--lf-subtle)] text-[var(--lf-warning)] flex items-center gap-1">
              <CheckCircleOutlined /> {activeCitySummary.withoutWebsite} no site
            </span>
            <span className="px-2.5 py-1 rounded bg-[var(--lf-subtle)] text-[var(--lf-text-secondary)] flex items-center gap-1">
              <MailOutlined /> {activeCitySummary.withEmail} email
            </span>
            <span className="px-2.5 py-1 rounded bg-[var(--lf-subtle)] text-[var(--lf-text-secondary)] flex items-center gap-1">
              <PhoneOutlined /> {activeCitySummary.withPhone} phone
            </span>
          </div>
        )}
      </div>

      <BusinessFilterBar
        filters={filters}
        totalItems={pagination?.totalItems}
        onExport={openExportFiltered}
        isExporting={isExporting}
        disabled={isBusinessesLoading}
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
        isLoading={isBusinessesLoading}
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
