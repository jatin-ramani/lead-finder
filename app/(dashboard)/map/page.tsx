"use client";

import {
  ClearOutlined,
  EnvironmentOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Checkbox, Drawer, Input, InputNumber, Select } from "antd";
import React, { useMemo, useState } from "react";

import ErrorState from "@/components/feedback/ErrorState";
import PageContainer from "@/components/ui/PageContainer";
import BusinessDrawer from "@/features/businesses/components/BusinessDrawer";
import { LEAD_STATUS_OPTIONS } from "@/features/businesses/components/BusinessFilterBar";
import { useDeleteBusiness } from "@/features/businesses/hooks/useBusinessMutations";
import LeadMap from "@/features/map/components/LeadMap";
import { businessesApi, queryKeys, scanningApi, tagsApi } from "@/services";
import type { Business, BusinessQuery, ScanJob } from "@/types/api";

type WebsiteFilter = "has" | "missing" | undefined;

function isActiveScan(status: string | undefined): boolean {
  return status === "Running" || status === "Pending";
}

export default function MapPage() {
  const [city, setCity] = useState<string>();
  const [category, setCategory] = useState("");
  const [grade, setGrade] = useState<string>();
  const [status, setStatus] = useState<string>();
  const [tags, setTags] = useState<string[]>([]);
  const [minimumScore, setMinimumScore] = useState<number | null>(null);
  const [maximumScore, setMaximumScore] = useState<number | null>(null);
  const [websiteFilter, setWebsiteFilter] = useState<WebsiteFilter>();
  const [hasEmail, setHasEmail] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const deleteMutation = useDeleteBusiness();

  const { data: cities = [] } = useQuery({
    queryKey: queryKeys.businesses.cities(),
    queryFn: ({ signal }) => businessesApi.getCitySummaries(signal),
  });
  const { data: tagResponse } = useQuery({
    queryKey: queryKeys.tags.list(),
    queryFn: ({ signal }) => tagsApi.listTags(signal),
  });
  const { data: scanJobs = [] } = useQuery({
    queryKey: queryKeys.scanJobs.list(),
    queryFn: ({ signal }) => scanningApi.listScanJobs(signal),
    enabled: Boolean(city),
    staleTime: 0,
    refetchInterval: (query) => {
      if (typeof document !== "undefined" && document.hidden) return false;
      const jobs = query.state.data as ScanJob[] | undefined;
      return jobs?.some((job) => job.city?.toLowerCase() === city?.toLowerCase() && isActiveScan(job.status))
        ? 4_000
        : false;
    },
  });

  const cityScan = useMemo(() => {
    if (!city) return undefined;
    const matchingJobs = scanJobs.filter((job) => job.city?.toLowerCase() === city.toLowerCase());
    return matchingJobs.find((job) => isActiveScan(job.status)) ?? matchingJobs[0];
  }, [city, scanJobs]);

  const {
    data: cityScanDetail,
    error: scanCoverageError,
    isFetching: isFetchingScanCoverage,
  } = useQuery({
    queryKey: queryKeys.scanJobs.detail(cityScan?.id ?? 0),
    queryFn: ({ signal }) => scanningApi.getScanJobDetail(cityScan!.id, signal),
    enabled: Boolean(cityScan),
    staleTime: 0,
    refetchInterval: (query) => {
      if (typeof document !== "undefined" && document.hidden) return false;
      const scan = query.state.data;
      return isActiveScan(scan?.status ?? cityScan?.status) ? 2_500 : false;
    },
  });

  const filters = useMemo<BusinessQuery>(() => ({
    ...(city ? { city } : {}),
    ...(category.trim() ? { category: category.trim() } : {}),
    ...(grade ? { lead_grade: grade } : {}),
    ...(status ? { lead_status: status } : {}),
    ...(tags.length ? { tags: tags.join(",") } : {}),
    ...(minimumScore != null ? { min_lead_score: minimumScore } : {}),
    ...(maximumScore != null ? { max_lead_score: maximumScore } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(websiteFilter === "has" ? { has_website: true } : websiteFilter === "missing" ? { has_website: false } : {}),
    ...(hasEmail ? { has_email: true } : {}),
    ...(hasPhone ? { has_phone: true } : {}),
    ...(favorite ? { is_favorite: true } : {}),
  }), [city, category, grade, status, tags, minimumScore, maximumScore, search, websiteFilter, hasEmail, hasPhone, favorite]);

  const { data, isLoading, isFetching, error, isError, refetch } = useQuery({
    queryKey: [...queryKeys.businesses.all, "map", filters],
    queryFn: ({ signal }) => businessesApi.listMappableBusinesses(filters, signal),
  });

  const activeFilterCount = Object.keys(filters).length;
  const scanForHud = cityScanDetail ?? cityScan;
  const completedCells = cityScanDetail?.completed_cells ?? cityScan?.completed_cells ?? cityScan?.completedCells ?? 0;
  const totalCells = cityScanDetail?.total_cells ?? cityScan?.total_cells ?? cityScan?.totalCells ?? 0;

  const reset = () => {
    setCity(undefined);
    setCategory("");
    setGrade(undefined);
    setStatus(undefined);
    setTags([]);
    setMinimumScore(null);
    setMaximumScore(null);
    setSearch("");
    setWebsiteFilter(undefined);
    setHasEmail(false);
    setHasPhone(false);
    setFavorite(false);
    setFiltersOpen(false);
  };

  const filterFields = (compact = false) => (
    <div className={compact ? "space-y-4" : "space-y-3"}>
      <div className={compact ? "grid grid-cols-1 gap-3 sm:grid-cols-2" : "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6"}>
        <Input prefix={<SearchOutlined />} placeholder="Search leads" value={search} onChange={(event) => setSearch(event.target.value)} allowClear />
        <Select aria-label="City filter" showSearch allowClear placeholder="All cities" value={city} onChange={setCity} suffixIcon={<EnvironmentOutlined />} options={cities.map((item) => ({ label: `${item.city} (${item.totalBusinesses})`, value: item.city }))} />
        <Input placeholder="Exact category" value={category} onChange={(event) => setCategory(event.target.value)} allowClear />
        <Select allowClear placeholder="All grades" value={grade} onChange={setGrade} options={["A", "B", "C", "D"].map((value) => ({ label: `Grade ${value}`, value }))} />
        <Select allowClear placeholder="All statuses" value={status} onChange={setStatus} options={LEAD_STATUS_OPTIONS} />
        <div className="grid grid-cols-2 gap-2">
          <InputNumber className="w-full" min={0} max={100} placeholder="Min score" value={minimumScore} onChange={setMinimumScore} />
          <InputNumber className="w-full" min={0} max={100} placeholder="Max score" value={maximumScore} onChange={setMaximumScore} />
        </div>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Qualification filters">
          <Checkbox checked={websiteFilter === "has"} onChange={(event) => setWebsiteFilter(event.target.checked ? "has" : undefined)}>Has website</Checkbox>
          <Checkbox checked={websiteFilter === "missing"} onChange={(event) => setWebsiteFilter(event.target.checked ? "missing" : undefined)}>No website</Checkbox>
          <Checkbox checked={hasEmail} onChange={(event) => setHasEmail(event.target.checked)}>Has email</Checkbox>
          <Checkbox checked={hasPhone} onChange={(event) => setHasPhone(event.target.checked)}>Has phone</Checkbox>
          <Checkbox checked={favorite} onChange={(event) => setFavorite(event.target.checked)}>Favorites</Checkbox>
        </div>
        <Select mode="multiple" allowClear className="w-full lg:w-72" placeholder="Filter by tags" value={tags} onChange={setTags} options={(tagResponse?.data ?? []).map((tag) => ({ label: tag.name, value: tag.slug }))} />
      </div>
    </div>
  );

  return (
    <PageContainer>
      <div className="lf-page-intro">
        <div className="lf-page-intro-copy">
          <h1 className="lf-page-title">Lead Map</h1>
          <p className="lf-page-subtitle">
            Real lead locations, density, and live scanner coverage
          </p>
        </div>
        {activeFilterCount > 0 && (
          <div className="lf-page-toolbar">
            <Button
              size="small"
              icon={<ClearOutlined />}
              onClick={reset}
              className="hidden lg:inline-flex"
            >
              Reset filters
            </Button>
          </div>
        )}
      </div>

      <section className="lf-card-v2 hidden space-y-3 p-4 lg:block" aria-label="Map filters">
        {filterFields()}
      </section>
      <section className="mb-3 flex items-center justify-between lg:hidden" aria-label="Map filter controls">
        <Button icon={<FilterOutlined />} onClick={() => setFiltersOpen(true)}>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</Button>
        {activeFilterCount > 0 && <Button size="small" icon={<ClearOutlined />} onClick={reset}>Reset</Button>}
      </section>
      <Drawer title="Map filters" placement="bottom" size="min(82dvh, 720px)" open={filtersOpen} onClose={() => setFiltersOpen(false)} destroyOnHidden>
        {filterFields(true)}
        <div className="mt-5 flex gap-2">
          <Button className="flex-1" onClick={reset}>Reset</Button>
          <Button className="flex-1" type="primary" onClick={() => setFiltersOpen(false)}>Show map</Button>
        </div>
      </Drawer>

      {city && cityScan && scanCoverageError && (
        <p className="mb-2 rounded-lg border border-[var(--lf-warning)] bg-[var(--lf-warning-soft)] px-3 py-2 text-xs text-[var(--lf-text-secondary)]" role="status">
          Scanner coverage could not refresh. Lead locations remain available; retry the page to refresh coverage.
        </p>
      )}

      <div className="relative" aria-busy={isLoading || isFetching || isFetchingScanCoverage}>
        <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--lf-text-secondary)] sm:absolute sm:left-4 sm:top-4 sm:z-10 sm:mb-0 sm:rounded-xl sm:border sm:border-[var(--lf-border)] sm:bg-[var(--lf-surface)] sm:px-3 sm:py-2 sm:shadow-[var(--lf-shadow-sm)]">
          <span><strong className="text-[var(--lf-text)]">{isLoading ? "…" : data?.locatedItems ?? 0}</strong> mapped</span>
          <span><strong className="text-[var(--lf-text)]">{data?.totalItems ?? 0}</strong> matching</span>
          {(data?.unlocatedItems ?? 0) > 0 && <span><strong>{data?.unlocatedItems}</strong> location unavailable</span>}
          {scanForHud && <span><strong className="text-[var(--lf-text)]">{scanForHud.status}</strong> scan · {completedCells}/{totalCells} cells</span>}
        </div>
        {isError ? (
          <div className="lf-card-v2 p-6">
            <ErrorState error={error} onRetry={() => void refetch()} title="Could not load map leads" />
          </div>
        ) : (
          <LeadMap
            businesses={data?.data ?? []}
            scanJob={cityScanDetail}
            emptyMessage={data?.totalItems ? "The matching leads do not have verified coordinates yet." : "Adjust the filters or run a scan to see leads here."}
            onSelectBusiness={setSelectedBusiness}
          />
        )}
      </div>

      <BusinessDrawer business={selectedBusiness} open={selectedBusiness != null} onClose={() => setSelectedBusiness(null)} onDelete={async (business) => { await deleteMutation.mutateAsync(business.id); setSelectedBusiness(null); }} isDeleting={deleteMutation.isPending} />
    </PageContainer>
  );
}