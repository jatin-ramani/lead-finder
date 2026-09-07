"use client";

import {
  ClearOutlined,
  CloseOutlined,
  ControlOutlined,
  DownOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
  StarFilled,
  StarOutlined,
  TagsOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Checkbox,
  Drawer,
  Input,
  InputNumber,
  Select,
  Tooltip,
} from "antd";
import { useEffect, useMemo, useRef, useState } from "react";

import type { UrlFilters } from "@/hooks/useUrlFilters";
import { queryKeys, tagsApi } from "@/services";
import type { Tag } from "@/types/api";

const SEARCH_DEBOUNCE_MS = 350;

interface BusinessFilterBarProps {
  filters: UrlFilters;
  totalItems: number | undefined;
  onExport: () => void;
  isExporting: boolean;
  onManageTags?: () => void;
  disabled?: boolean;
}

function DebouncedInput({
  value,
  onCommit,
  placeholder,
  ariaLabel,
  prefix,
  disabled,
  className,
}: {
  value: string;
  onCommit: (next: string) => void;
  placeholder: string;
  ariaLabel: string;
  prefix?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const [draft, setDraft] = useState(value);
  const committed = useRef(value);

  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value;
      setDraft(value);
    }
  }, [value]);

  useEffect(() => {
    if (draft === committed.current) return;

    const timer = setTimeout(() => {
      committed.current = draft;
      onCommit(draft);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [draft, onCommit]);

  return (
    <Input
      allowClear
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onPressEnter={() => {
        committed.current = draft;
        onCommit(draft);
      }}
      placeholder={placeholder}
      aria-label={ariaLabel}
      prefix={prefix}
      disabled={disabled}
      className={className}
      autoComplete="off"
    />
  );
}

export const LEAD_STATUS_OPTIONS = [
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Interested", value: "interested" },
  { label: "Follow-up", value: "follow_up" },
  { label: "Converted", value: "converted" },
  { label: "Lost", value: "lost" },
];

export const LEAD_GRADE_OPTIONS = [
  { label: "Grade A (80+)", value: "A" },
  { label: "Grade B (60-79)", value: "B" },
  { label: "Grade C (40-59)", value: "C" },
  { label: "Grade D (0-39)", value: "D" },
];

export const SCORE_PRESET_OPTIONS = [
  { label: "Custom Range", value: "custom" },
  { label: "Grade A (80–100)", value: "80-100" },
  { label: "Grade B (60–79)", value: "60-79" },
  { label: "Grade C (40–59)", value: "40-59" },
  { label: "Grade D (0–39)", value: "0-39" },
];

export default function BusinessFilterBar({
  filters,
  totalItems,
  onExport,
  isExporting,
  onManageTags,
  disabled = false,
}: BusinessFilterBarProps) {
  const {
    search,
    city,
    category,
    hasWebsite,
    hasEmail,
    hasPhone,
    isFavorite,
    leadStatus,
    leadGrade,
    minLeadScore,
    maxLeadScore,
    tags,
    tagList,
    activeCount,
    setFilter,
    setScoreRange,
    resetFilters,
  } = filters;

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  // Auto-expand advanced filters panel if any advanced filters are active
  const hasAdvancedActive = useMemo(() => {
    return (
      leadStatus !== "" ||
      leadGrade !== "" ||
      minLeadScore !== undefined ||
      maxLeadScore !== undefined ||
      tags !== "" ||
      hasWebsite !== undefined ||
      hasEmail !== undefined ||
      hasPhone !== undefined
    );
  }, [leadStatus, leadGrade, minLeadScore, maxLeadScore, tags, hasWebsite, hasEmail, hasPhone]);

  const { data: tagsData } = useQuery({
    queryKey: queryKeys.tags.list(),
    queryFn: () => tagsApi.listTags(),
    staleTime: 30_000,
  });

  const tagOptions = ((tagsData?.data || []) as Tag[]).map((t: Tag) => ({
    label: t.name,
    value: t.slug,
  }));

  // Score preset synchronization
  const currentPreset = useMemo(() => {
    if (minLeadScore === 80 && maxLeadScore === 100) return "80-100";
    if (minLeadScore === 60 && maxLeadScore === 79) return "60-79";
    if (minLeadScore === 40 && maxLeadScore === 59) return "40-59";
    if (minLeadScore === 0 && maxLeadScore === 39) return "0-39";
    if (minLeadScore !== undefined || maxLeadScore !== undefined) return "custom";
    return undefined;
  }, [minLeadScore, maxLeadScore]);

  const handleScorePresetChange = (val: string | undefined) => {
    if (!val) {
      setScoreRange(undefined, undefined);
      return;
    }
    if (val === "80-100") setScoreRange(80, 100);
    else if (val === "60-79") setScoreRange(60, 79);
    else if (val === "40-59") setScoreRange(40, 59);
    else if (val === "0-39") setScoreRange(0, 39);
  };

  const isScoreRangeInvalid =
    minLeadScore !== undefined &&
    maxLeadScore !== undefined &&
    minLeadScore > maxLeadScore;

  // Active filter chips list
  const activeChips = useMemo(() => {
    const chips: Array<{ id: string; label: string; onRemove: () => void }> = [];

    if (search) {
      chips.push({
        id: "search",
        label: `Search: "${search}"`,
        onRemove: () => setFilter("search", undefined),
      });
    }
    if (city) {
      chips.push({
        id: "city",
        label: `City: ${city}`,
        onRemove: () => setFilter("city", undefined),
      });
    }
    if (category) {
      chips.push({
        id: "category",
        label: `Category: ${category}`,
        onRemove: () => setFilter("category", undefined),
      });
    }
    if (isFavorite) {
      chips.push({
        id: "is_favorite",
        label: "Favorites Only",
        onRemove: () => setFilter("is_favorite", undefined),
      });
    }
    if (leadStatus) {
      const statusLabel =
        LEAD_STATUS_OPTIONS.find((s) => s.value === leadStatus)?.label || leadStatus;
      chips.push({
        id: "lead_status",
        label: `Status: ${statusLabel}`,
        onRemove: () => setFilter("lead_status", undefined),
      });
    }
    if (leadGrade) {
      chips.push({
        id: "lead_grade",
        label: `Grade: ${leadGrade}`,
        onRemove: () => setFilter("lead_grade", undefined),
      });
    }
    if (minLeadScore !== undefined || maxLeadScore !== undefined) {
      const min = minLeadScore !== undefined ? minLeadScore : 0;
      const max = maxLeadScore !== undefined ? maxLeadScore : 100;
      chips.push({
        id: "score_range",
        label: `Score: ${min}–${max}`,
        onRemove: () => setScoreRange(undefined, undefined),
      });
    }
    if (hasWebsite !== undefined) {
      chips.push({
        id: "has_website",
        label: hasWebsite ? "Has Website" : "No Website",
        onRemove: () => setFilter("has_website", undefined),
      });
    }
    if (hasEmail !== undefined) {
      chips.push({
        id: "has_email",
        label: hasEmail ? "Has Email" : "No Email",
        onRemove: () => setFilter("has_email", undefined),
      });
    }
    if (hasPhone !== undefined) {
      chips.push({
        id: "has_phone",
        label: hasPhone ? "Has Phone" : "No Phone",
        onRemove: () => setFilter("has_phone", undefined),
      });
    }
    if (tagList.length > 0) {
      tagList.forEach((tagSlug) => {
        const tagName =
          ((tagsData?.data || []) as Tag[]).find((t) => t.slug === tagSlug)?.name || tagSlug;
        chips.push({
          id: `tag-${tagSlug}`,
          label: `Tag: ${tagName}`,
          onRemove: () => {
            const nextTags = tagList.filter((t) => t !== tagSlug);
            setFilter("tags", nextTags.length > 0 ? nextTags.join(",") : undefined);
          },
        });
      });
    }

    return chips;
  }, [
    search,
    city,
    category,
    isFavorite,
    leadStatus,
    leadGrade,
    minLeadScore,
    maxLeadScore,
    hasWebsite,
    hasEmail,
    hasPhone,
    tagList,
    tagsData,
    setFilter,
    setScoreRange,
  ]);

  return (
    <div className="lf-filter-card">
      {/* Desktop Primary Bar */}
      <div className="lf-filter-desktop flex flex-wrap items-center gap-3">
        <span className="lf-filter-legend">
          <FilterOutlined aria-hidden />
          Filters
          {activeCount > 0 && (
            <Badge
              count={activeCount}
              color="var(--lf-accent)"
              style={{ boxShadow: "none", color: "var(--lf-surface)" }}
              aria-label={`${activeCount} active filters`}
            />
          )}
        </span>

        <DebouncedInput
          value={search}
          onCommit={(next) => setFilter("search", next)}
          placeholder="Search name, phone, email…"
          ariaLabel="Search businesses"
          prefix={<SearchOutlined aria-hidden />}
          disabled={disabled}
          className="lf-filter-search"
        />

        <DebouncedInput
          value={city}
          onCommit={(next) => setFilter("city", next)}
          placeholder="City"
          ariaLabel="Filter by city (exact match)"
          disabled={disabled}
          className="lf-filter-control"
        />

        <DebouncedInput
          value={category}
          onCommit={(next) => setFilter("category", next)}
          placeholder="Category"
          ariaLabel="Filter by category (exact match)"
          disabled={disabled}
          className="lf-filter-control"
        />

        <Tooltip title={isFavorite ? "Showing favorites only" : "Filter by favorites"}>
          <Button
            className={isFavorite ? "lf-btn-favorite-active" : ""}
            icon={
              isFavorite ? (
                <StarFilled style={{ color: "#f59e0b" }} />
              ) : (
                <StarOutlined />
              )
            }
            onClick={() => setFilter("is_favorite", isFavorite ? undefined : true)}
            disabled={disabled}
            aria-label="Favorites only"
          >
            Favorites
          </Button>
        </Tooltip>

        {/* Website & Contact Quick Checkboxes */}
        <div className="flex items-center gap-2" role="group" aria-label="Website availability">
          <Checkbox
            checked={hasWebsite === true}
            disabled={disabled}
            onChange={(event) => setFilter("has_website", event.target.checked ? true : undefined)}
          >
            Has website
          </Checkbox>
          <Checkbox
            checked={hasWebsite === false}
            disabled={disabled}
            onChange={(event) => setFilter("has_website", event.target.checked ? false : undefined)}
          >
            No website
          </Checkbox>
        </div>

        <div className="flex items-center gap-2" role="group" aria-label="Contact availability">
          <Checkbox
            checked={hasEmail === true}
            disabled={disabled}
            onChange={(event) => setFilter("has_email", event.target.checked ? true : undefined)}
          >
            Has email
          </Checkbox>
          <Checkbox
            checked={hasPhone === true}
            disabled={disabled}
            onChange={(event) => setFilter("has_phone", event.target.checked ? true : undefined)}
          >
            Has phone
          </Checkbox>
        </div>

        {/* Advanced Filters Expand/Collapse Toggle */}
        <Button
          icon={<ControlOutlined aria-hidden />}
          onClick={() => setAdvancedExpanded((prev) => !prev)}
          className={hasAdvancedActive ? "border-[var(--lf-brand)] text-[var(--lf-brand)]" : ""}
          aria-expanded={advancedExpanded}
          aria-controls="lf-advanced-filters-panel"
        >
          <span>Advanced</span>
          {advancedExpanded ? <UpOutlined style={{ fontSize: 10 }} /> : <DownOutlined style={{ fontSize: 10 }} />}
        </Button>

        {onManageTags && (
          <Tooltip title="Manage custom tags">
            <Button
              icon={<TagsOutlined aria-hidden />}
              onClick={onManageTags}
              disabled={disabled}
            >
              Tags
            </Button>
          </Tooltip>
        )}

        <Tooltip title="Clear all filters">
          <Button
            icon={<ClearOutlined aria-hidden />}
            onClick={resetFilters}
            disabled={disabled || activeCount === 0}
            aria-label="Clear filters"
          >
            Reset
          </Button>
        </Tooltip>

        <Tooltip
          title={
            activeCount > 0
              ? "Download every row matching these filters"
              : "Download every business"
          }
        >
          <Button
            type="primary"
            icon={<DownloadOutlined aria-hidden />}
            onClick={onExport}
            loading={isExporting}
            disabled={disabled || isExporting || totalItems === 0}
            className="ms-auto"
          >
            {isExporting ? "Preparing…" : "Export CSV"}
          </Button>
        </Tooltip>
      </div>

      {/* Desktop Expandable Advanced Filters Panel */}
      {advancedExpanded && (
        <div id="lf-advanced-filters-panel" className="lf-advanced-panel">
          <div className="lf-advanced-grid">
            {/* Status */}
            <div className="lf-advanced-field">
              <label className="lf-advanced-field-label">CRM Lead Status</label>
              <Select
                value={leadStatus || undefined}
                placeholder="All Statuses"
                allowClear
                onChange={(val) => setFilter("lead_status", val)}
                disabled={disabled}
                className="w-36"
                options={LEAD_STATUS_OPTIONS}
                aria-label="Filter by lead status"
              />
            </div>

            {/* Lead Grade */}
            <div className="lf-advanced-field">
              <label className="lf-advanced-field-label">Lead Grade</label>
              <Select
                value={leadGrade || undefined}
                placeholder="All Grades"
                allowClear
                onChange={(val) => setFilter("lead_grade", val)}
                disabled={disabled}
                className="w-36"
                options={LEAD_GRADE_OPTIONS}
                aria-label="Filter by lead grade"
              />
            </div>

            {/* Score Preset */}
            <div className="lf-advanced-field">
              <label className="lf-advanced-field-label">Score Preset</label>
              <Select
                value={currentPreset}
                placeholder="Select Preset"
                allowClear
                onChange={handleScorePresetChange}
                disabled={disabled}
                className="w-40"
                options={SCORE_PRESET_OPTIONS}
                aria-label="Score preset"
              />
            </div>

            {/* Min / Max Score Range */}
            <div className="lf-advanced-field">
              <label className="lf-advanced-field-label">Score Range (0–100)</label>
              <div className="lf-score-range-group">
                <InputNumber
                  min={0}
                  max={100}
                  value={minLeadScore}
                  placeholder="Min"
                  onChange={(val) => setFilter("min_lead_score", val !== null ? val : undefined)}
                  disabled={disabled}
                  className="w-20"
                  aria-label="Minimum lead score"
                />
                <span className="text-[var(--lf-text-muted)] text-xs">–</span>
                <InputNumber
                  min={0}
                  max={100}
                  value={maxLeadScore}
                  placeholder="Max"
                  onChange={(val) => setFilter("max_lead_score", val !== null ? val : undefined)}
                  disabled={disabled}
                  className="w-20"
                  aria-label="Maximum lead score"
                />
              </div>
            </div>

            {/* Tags Multi-select */}
            <div className="lf-advanced-field flex-1 min-w-[200px]">
              <label className="lf-advanced-field-label">Lead Tags</label>
              <Select
                mode="multiple"
                maxTagCount="responsive"
                value={tagList}
                placeholder="Select tags"
                allowClear
                onChange={(vals: string[]) =>
                  setFilter("tags", vals.length > 0 ? vals.join(",") : undefined)
                }
                disabled={disabled}
                className="w-full"
                options={tagOptions}
                aria-label="Filter by tags"
              />
            </div>
          </div>

          {isScoreRangeInvalid && (
            <span className="text-xs font-semibold text-[var(--lf-error)]">
              Minimum lead score cannot exceed maximum lead score.
            </span>
          )}
        </div>
      )}

      {/* Active Filter Chips Summary */}
      {activeChips.length > 0 && (
        <div className="lf-filter-chips-row" role="region" aria-label="Active filters">
          <span className="text-xs font-semibold text-[var(--lf-text-muted)]">Active filters:</span>
          {activeChips.map((chip) => (
            <span key={chip.id} className="lf-filter-chip">
              <span>{chip.label}</span>
              <button
                type="button"
                className="lf-filter-chip-close"
                onClick={chip.onRemove}
                aria-label={`Remove filter ${chip.label}`}
              >
                <CloseOutlined style={{ fontSize: 10 }} />
              </button>
            </span>
          ))}
          <Button
            type="link"
            size="small"
            onClick={resetFilters}
            className="text-xs text-[var(--lf-text-muted)] hover:text-[var(--lf-brand)] p-0"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Mobile Toolbar */}
      <div className="lf-filter-mobile">
        <DebouncedInput
          value={search}
          onCommit={(next) => setFilter("search", next)}
          placeholder="Search businesses"
          ariaLabel="Search businesses"
          prefix={<SearchOutlined aria-hidden />}
          disabled={disabled}
          className="lf-filter-search"
        />
        <Button
          icon={<FilterOutlined aria-hidden />}
          onClick={() => setMobileFiltersOpen(true)}
          disabled={disabled}
        >
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
        {onManageTags && (
          <Button
            icon={<TagsOutlined aria-hidden />}
            onClick={onManageTags}
            disabled={disabled}
          >
            Tags
          </Button>
        )}
        <Button
          type="primary"
          icon={<DownloadOutlined aria-hidden />}
          onClick={onExport}
          loading={isExporting}
          disabled={disabled || isExporting || totalItems === 0}
          aria-label="Export businesses"
        >
          <span className="lf-mobile-export-label">Export</span>
        </Button>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <Drawer
          title="Filter businesses"
          placement="right"
          open
          onClose={() => setMobileFiltersOpen(false)}
          destroyOnHidden
          className="lf-filter-drawer"
        >
          <div className="lf-filter-drawer-fields flex flex-col gap-4">
            <DebouncedInput
              value={city}
              onCommit={(next) => setFilter("city", next)}
              placeholder="City"
              ariaLabel="Filter by city (exact match)"
              disabled={disabled}
            />
            <DebouncedInput
              value={category}
              onCommit={(next) => setFilter("category", next)}
              placeholder="Category"
              ariaLabel="Filter by category (exact match)"
              disabled={disabled}
            />

            <div>
              <label className="text-xs font-semibold text-[var(--lf-text-muted)] mb-1 block uppercase">
                CRM Lead Status
              </label>
              <Select
                value={leadStatus || undefined}
                placeholder="Status"
                allowClear
                onChange={(val) => setFilter("lead_status", val)}
                disabled={disabled}
                className="w-full"
                options={LEAD_STATUS_OPTIONS}
                aria-label="Filter by lead status"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--lf-text-muted)] mb-1 block uppercase">
                Lead Grade
              </label>
              <Select
                value={leadGrade || undefined}
                placeholder="Grade"
                allowClear
                onChange={(val) => setFilter("lead_grade", val)}
                disabled={disabled}
                className="w-full"
                options={LEAD_GRADE_OPTIONS}
                aria-label="Filter by lead grade"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--lf-text-muted)] mb-1 block uppercase">
                Lead Score Range
              </label>
              <div className="flex flex-col gap-2">
                <Select
                  value={currentPreset}
                  placeholder="Select Preset"
                  allowClear
                  onChange={handleScorePresetChange}
                  disabled={disabled}
                  className="w-full"
                  options={SCORE_PRESET_OPTIONS}
                  aria-label="Score preset"
                />
                <div className="flex items-center gap-2">
                  <InputNumber
                    min={0}
                    max={100}
                    value={minLeadScore}
                    placeholder="Min Score"
                    onChange={(val) => setFilter("min_lead_score", val !== null ? val : undefined)}
                    disabled={disabled}
                    className="w-full"
                    aria-label="Minimum lead score"
                  />
                  <span className="text-[var(--lf-text-muted)]">–</span>
                  <InputNumber
                    min={0}
                    max={100}
                    value={maxLeadScore}
                    placeholder="Max Score"
                    onChange={(val) => setFilter("max_lead_score", val !== null ? val : undefined)}
                    disabled={disabled}
                    className="w-full"
                    aria-label="Maximum lead score"
                  />
                </div>
                {isScoreRangeInvalid && (
                  <span className="text-xs text-[var(--lf-error)]">
                    Min score cannot exceed max score.
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--lf-text-muted)] mb-1 block uppercase">
                Tags
              </label>
              <Select
                mode="multiple"
                value={tagList}
                placeholder="Select tags"
                allowClear
                onChange={(vals: string[]) =>
                  setFilter("tags", vals.length > 0 ? vals.join(",") : undefined)
                }
                disabled={disabled}
                className="w-full"
                options={tagOptions}
                aria-label="Filter by tags"
              />
            </div>

            <fieldset>
              <legend className="text-xs font-semibold text-[var(--lf-text-muted)] uppercase mb-1">
                Favorites
              </legend>
              <Checkbox
                checked={isFavorite === true}
                disabled={disabled}
                onChange={(event) =>
                  setFilter("is_favorite", event.target.checked ? true : undefined)
                }
              >
                Favorites only
              </Checkbox>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-semibold text-[var(--lf-text-muted)] uppercase mb-1">
                Website
              </legend>
              <div className="flex flex-col gap-2">
                <Checkbox
                  checked={hasWebsite === true}
                  disabled={disabled}
                  onChange={(event) =>
                    setFilter("has_website", event.target.checked ? true : undefined)
                  }
                >
                  Has website
                </Checkbox>
                <Checkbox
                  checked={hasWebsite === false}
                  disabled={disabled}
                  onChange={(event) =>
                    setFilter("has_website", event.target.checked ? false : undefined)
                  }
                >
                  No website
                </Checkbox>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-semibold text-[var(--lf-text-muted)] uppercase mb-1">
                Contact
              </legend>
              <div className="flex flex-col gap-2">
                <Checkbox
                  checked={hasEmail === true}
                  disabled={disabled}
                  onChange={(event) =>
                    setFilter("has_email", event.target.checked ? true : undefined)
                  }
                >
                  Has email
                </Checkbox>
                <Checkbox
                  checked={hasPhone === true}
                  disabled={disabled}
                  onChange={(event) =>
                    setFilter("has_phone", event.target.checked ? true : undefined)
                  }
                >
                  Has phone
                </Checkbox>
              </div>
            </fieldset>

            <div className="lf-filter-drawer-actions flex items-center justify-between gap-3 mt-4 pt-3 border-t border-[var(--lf-border-subtle)]">
              <Button
                icon={<ClearOutlined aria-hidden />}
                onClick={resetFilters}
                disabled={disabled || activeCount === 0}
                aria-label="Clear filters"
              >
                Reset
              </Button>
              <Button
                type="primary"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Show results
              </Button>
            </div>
          </div>
        </Drawer>
      )}

      {activeCount > 0 && totalItems !== undefined && (
        <p className="lf-filter-summary" aria-live="polite">
          {totalItems === 0 ? (
            <>No businesses match these filters</>
          ) : (
            <>
              <strong>{totalItems.toLocaleString()}</strong>{" "}
              {totalItems === 1 ? "business matches" : "businesses match"} these
              filters
            </>
          )}
        </p>
      )}
    </div>
  );
}
