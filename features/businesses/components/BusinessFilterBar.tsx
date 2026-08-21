"use client";

import {
  ClearOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Badge, Button, Checkbox, Drawer, Input, Select, Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";

import type { UrlFilters } from "@/hooks/useUrlFilters";
import { queryKeys, tagsApi } from "@/services";
import type { Tag } from "@/types/api";

/**
 * How long typing pauses before a request goes out.
 *
 * 350ms: long enough that a normal typing rate produces one request per word
 * rather than one per keystroke, short enough that it does not feel laggy.
 */
const SEARCH_DEBOUNCE_MS = 350;

interface BusinessFilterBarProps {
  filters: UrlFilters;
  /** Rows matching the current filters, across every page. */
  totalItems: number | undefined;
  onExport: () => void;
  isExporting: boolean;
  onManageTags?: () => void;
  disabled?: boolean;
}

/**
 * A debounced text input that writes to the URL.
 *
 * Local state exists so the field stays responsive while typing; the URL is
 * updated on a timer. The effect resyncs when the URL changes from elsewhere —
 * a browser Back, or the Reset button — which is the case a naive
 * `defaultValue` gets wrong, leaving a cleared filter still showing its text.
 */
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
    // Only adopt an external change; ignore the echo of our own commit, which
    // would otherwise fight the cursor mid-word.
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
      // Enter commits immediately rather than waiting out the debounce.
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

/**
 * Filters for the business list.
 *
 * All state lives in the URL. A user who filters by city, shares the link, and
 * opens it on another machine sees the exact same result set.
 */
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
    leadGrade,
    tagList,
    activeCount,
    setFilter,
    resetFilters,
  } = filters;
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: tagsData } = useQuery({
    queryKey: queryKeys.tags.list(),
    queryFn: () => tagsApi.listTags(),
    staleTime: 30_000,
  });

  const tagOptions = ((tagsData?.data || []) as Tag[]).map((t: Tag) => ({
    label: t.name,
    value: t.slug,
  }));

  return (
    <div className="lf-filter-card">
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

        <Select
          value={leadGrade || undefined}
          placeholder="Grade"
          allowClear
          onChange={(val) => setFilter("lead_grade", val)}
          disabled={disabled}
          className="w-28"
          options={[
            { label: "Grade A (80+)", value: "A" },
            { label: "Grade B (60-79)", value: "B" },
            { label: "Grade C (40-59)", value: "C" },
            { label: "Grade D (0-39)", value: "D" },
          ]}
        />

        <Select
          mode="multiple"
          maxTagCount="responsive"
          value={tagList}
          placeholder="Filter by tags"
          allowClear
          onChange={(vals: string[]) =>
            setFilter("tags", vals.length > 0 ? vals.join(",") : undefined)
          }
          disabled={disabled}
          className="min-w-[160px] max-w-[240px]"
          options={tagOptions}
        />

        <div className="flex items-center gap-2" role="group" aria-label="Website availability">
          <Checkbox
            checked={hasWebsite === true}
            disabled={disabled}
            onChange={(event) => setFilter("has_website", event.target.checked ? true : undefined)}
          >Has website</Checkbox>
          <Checkbox
            checked={hasWebsite === false}
            disabled={disabled}
            onChange={(event) => setFilter("has_website", event.target.checked ? false : undefined)}
          >No website</Checkbox>
        </div>

        <div className="flex items-center gap-2" role="group" aria-label="Contact availability">
          <Checkbox
            checked={hasEmail}
            disabled={disabled}
            onChange={(event) => setFilter("has_email", event.target.checked ? true : undefined)}
          >Has email</Checkbox>
          <Checkbox
            checked={hasPhone}
            disabled={disabled}
            onChange={(event) => setFilter("has_phone", event.target.checked ? true : undefined)}
          >Has phone</Checkbox>
        </div>

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

      <div className="lf-filter-mobile">
        <DebouncedInput value={search} onCommit={(next) => setFilter("search", next)} placeholder="Search businesses" ariaLabel="Search businesses" prefix={<SearchOutlined aria-hidden />} disabled={disabled} className="lf-filter-search" />
        <Button icon={<FilterOutlined aria-hidden />} onClick={() => setMobileFiltersOpen(true)} disabled={disabled}>Filters{activeCount > 0 ? ` (${activeCount})` : ""}</Button>
        {onManageTags && (
          <Button icon={<TagsOutlined aria-hidden />} onClick={onManageTags} disabled={disabled}>
            Tags
          </Button>
        )}
        <Button type="primary" icon={<DownloadOutlined aria-hidden />} onClick={onExport} loading={isExporting} disabled={disabled || isExporting || totalItems === 0} aria-label="Export businesses"><span className="lf-mobile-export-label">Export</span></Button>
      </div>

      {mobileFiltersOpen && (
        <Drawer
          title="Filter businesses"
          placement="right"
          open
          onClose={() => setMobileFiltersOpen(false)}
          destroyOnHidden
          className="lf-filter-drawer"
        >
          <div className="lf-filter-drawer-fields">
            <DebouncedInput value={city} onCommit={(next) => setFilter("city", next)} placeholder="City" ariaLabel="Filter by city (exact match)" disabled={disabled} />
            <DebouncedInput value={category} onCommit={(next) => setFilter("category", next)} placeholder="Category" ariaLabel="Filter by category (exact match)" disabled={disabled} />
            <Select
              value={leadGrade || undefined}
              placeholder="Grade"
              allowClear
              onChange={(val) => setFilter("lead_grade", val)}
              disabled={disabled}
              className="w-full"
              options={[
                { label: "Grade A (80+)", value: "A" },
                { label: "Grade B (60-79)", value: "B" },
                { label: "Grade C (40-59)", value: "C" },
                { label: "Grade D (0-39)", value: "D" },
              ]}
            />
            <div>
              <label className="text-xs font-semibold text-[var(--lf-text-muted)] mb-1 block">Tags</label>
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
              />
            </div>
            <fieldset><legend>Website</legend><Checkbox checked={hasWebsite === true} disabled={disabled} onChange={(event) => setFilter("has_website", event.target.checked ? true : undefined)}>Has website</Checkbox><Checkbox checked={hasWebsite === false} disabled={disabled} onChange={(event) => setFilter("has_website", event.target.checked ? false : undefined)}>No website</Checkbox></fieldset>
            <fieldset><legend>Contact</legend><Checkbox checked={hasEmail} disabled={disabled} onChange={(event) => setFilter("has_email", event.target.checked ? true : undefined)}>Has email</Checkbox><Checkbox checked={hasPhone} disabled={disabled} onChange={(event) => setFilter("has_phone", event.target.checked ? true : undefined)}>Has phone</Checkbox></fieldset>
            <div className="lf-filter-drawer-actions"><Button icon={<ClearOutlined aria-hidden />} onClick={resetFilters} disabled={disabled || activeCount === 0}>Reset</Button><Button type="primary" onClick={() => setMobileFiltersOpen(false)}>Show results</Button></div>
          </div>
        </Drawer>
      )}
      {activeCount > 0 && totalItems !== undefined && (
        // Polite: the count changes as a result of a request completing, not
        // of the keystroke itself.
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
