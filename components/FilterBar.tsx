"use client";

import {
  ClearOutlined,
  FilterOutlined,
  SearchOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Badge, Button, Select, Input, Tooltip } from "antd";

import { toSelectOptions } from "@/lib/format";
import type { BusinessFilters } from "@/types/business";

interface FilterBarProps {
  filters: BusinessFilters;
  onChange: <K extends keyof BusinessFilters>(
    key: K,
    value: BusinessFilters[K],
  ) => void;
  onReset: () => void;
  onStartScan: () => void;
  scanning?: boolean;
  cities: string[];
  categories: string[];
  statuses: string[];
  activeFilterCount: number;
  resultCount: number;
  totalCount: number;
  disabled?: boolean;
}

export default function FilterBar({
  filters,
  onChange,
  onReset,
  onStartScan,
  scanning = false,
  cities,
  categories,
  statuses,
  activeFilterCount,
  resultCount,
  totalCount,
  disabled = false,
}: FilterBarProps) {
  // The derived website states sit above whatever raw statuses the scanner wrote.
  const statusOptions = [
    {
      label: "Website",
      options: [
        { label: "Has Website", value: "has-website" },
        { label: "No Website", value: "no-website" },
      ],
    },
    ...(statuses.length
      ? [{ label: "Status", options: toSelectOptions(statuses) }]
      : []),
  ];

  return (
    <div className="lf-filter-card">
      <div className="flex flex-wrap items-center gap-3">
        <span className="lf-filter-legend">
          <FilterOutlined />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              count={activeFilterCount}
              color="var(--lf-accent)"
              style={{ boxShadow: "none", color: "#0b0b0b" }}
            />
          )}
        </span>

        <Select
          allowClear
          showSearch
          value={filters.city}
          onChange={(value) => onChange("city", value)}
          options={toSelectOptions(cities)}
          placeholder="City"
          disabled={disabled}
          className="lf-filter-control"
          optionFilterProp="label"
          notFoundContent="No cities yet"
        />

        <Select
          allowClear
          showSearch
          value={filters.category}
          onChange={(value) => onChange("category", value)}
          options={toSelectOptions(categories)}
          placeholder="Category"
          disabled={disabled}
          className="lf-filter-control"
          optionFilterProp="label"
          notFoundContent="No categories returned by the API"
        />

        <Select
          allowClear
          value={filters.status}
          onChange={(value) => onChange("status", value)}
          options={statusOptions}
          placeholder="Status"
          disabled={disabled}
          className="lf-filter-control"
        />

        <Input
          allowClear
          value={filters.search}
          onChange={(event) => onChange("search", event.target.value)}
          placeholder="Search business…"
          prefix={<SearchOutlined className="text-slate-400" />}
          disabled={disabled}
          className="lf-filter-search"
          aria-label="Search business"
        />

        <Tooltip title="Clear all filters">
          <Button
            icon={<ClearOutlined />}
            onClick={onReset}
            disabled={disabled || activeFilterCount === 0}
          >
            Reset
          </Button>
        </Tooltip>

        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          onClick={onStartScan}
          loading={scanning}
          disabled={scanning}
          className="ms-auto"
        >
          {scanning ? "Scanning..." : "Start Scan"}
        </Button>
      </div>

      {activeFilterCount > 0 && (
        <p className="lf-filter-summary">
          Showing <strong>{resultCount}</strong> of {totalCount} businesses
        </p>
      )}
    </div>
  );
}
