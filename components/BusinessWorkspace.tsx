"use client";

import { Alert } from "antd";
import { useCallback, useMemo, useState } from "react";

import BusinessDrawer from "@/components/BusinessDrawer";
import BusinessTable from "@/components/BusinessTable";
import FilterBar from "@/components/FilterBar";
import ScanModal from "@/components/ScanModal";
import { useBusinessFilters } from "@/hooks/useBusinessFilters";
import { useBusinesses } from "@/hooks/useBusinesses";
import { SCAN_CATEGORIES, useScanner } from "@/hooks/useScanner";
import type { Business } from "@/types/business";

interface BusinessWorkspaceProps {
  /** Narrows the dataset before the filter bar is applied (e.g. Leads). */
  baseFilter?: (business: Business) => boolean;
}

/**
 * Filter bar + table + detail drawer + scan modal.
 * Shared by Dashboard, Businesses and Leads so the behaviour stays identical.
 */
export default function BusinessWorkspace({
  baseFilter,
}: BusinessWorkspaceProps) {
  const {
    businesses,
    cities,
    categories,
    statuses,
    loading,
    error,
    refresh,
    globalSearch,
  } = useBusinesses();

  const { scanning, startScan } = useScanner();

  const {
    filters,
    setFilter,
    reset,
    filtered,
    scoped,
    activeFilterCount,
    hasActiveFilters,
  } = useBusinessFilters(businesses, { globalSearch, baseFilter });

  const [selected, setSelected] = useState<Business | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [highlightAnalysis, setHighlightAnalysis] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  // The API never returns `category`, so the dropdown is seeded with the
  // categories the scanner accepts — otherwise it would always be empty.
  const categoryOptions = useMemo(
    () => Array.from(new Set([...categories, ...SCAN_CATEGORIES])).sort(),
    [categories],
  );

  const openDetails = useCallback((business: Business) => {
    setSelected(business);
    setHighlightAnalysis(false);
    setDrawerOpen(true);
  }, []);

  const openAnalysis = useCallback((business: Business) => {
    setSelected(business);
    setHighlightAnalysis(true);
    setDrawerOpen(true);
  }, []);

  /**
   * Scans straight from the filter bar's City + Category selection. When either
   * is unset there is nothing to send, so the existing dialog collects them.
   */
  const handleStartScan = useCallback(() => {
    if (filters.city && filters.category) {
      void startScan({ city: filters.city, category: filters.category });
      return;
    }
    setScanOpen(true);
  }, [filters.city, filters.category, startScan]);

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <Alert
          type="error"
          showIcon
          message="Could not load businesses"
          description={error}
          action={
            <button type="button" className="lf-alert-retry" onClick={() => void refresh()}>
              Retry
            </button>
          }
        />
      )}

      <FilterBar
        filters={filters}
        onChange={setFilter}
        onReset={reset}
        onStartScan={handleStartScan}
        scanning={scanning}
        cities={cities}
        categories={categoryOptions}
        statuses={statuses}
        activeFilterCount={activeFilterCount}
        resultCount={filtered.length}
        totalCount={scoped.length}
        disabled={loading && businesses.length === 0}
      />

      <BusinessTable
        data={filtered}
        loading={loading}
        onView={openDetails}
        onAnalyze={openAnalysis}
        onResetFilters={reset}
        hasActiveFilters={hasActiveFilters}
        emptyAction={{
          label: "Start a scan",
          onClick: () => setScanOpen(true),
        }}
      />

      <BusinessDrawer
        business={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        highlightAnalysis={highlightAnalysis}
      />

      <ScanModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        cities={cities}
        categories={categories}
        initialCity={filters.city}
        initialCategory={filters.category}
      />
    </div>
  );
}
