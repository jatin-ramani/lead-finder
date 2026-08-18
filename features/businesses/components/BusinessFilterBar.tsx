"use client";

import {
  ClearOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Badge, Button, Checkbox, Input, Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";

import type { UrlFilters } from "@/hooks/useUrlFilters";

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
    />
  );
}

/**
 * Filters for the business list.
 *
 * Everything here writes to the URL, so the view is shareable and the back
 * button works. Nothing filters in the browser — the backend does the work and
 * the totals are honest across every page, not just the visible one.
 *
 * **City and category are search inputs, not dropdowns.** The backend matches
 * them exactly and exposes no endpoint listing distinct values, so a dropdown
 * could only ever be populated from the current page — presenting a partial
 * list as though it were the complete set of cities. A user who did not see
 * "Rajkot" would reasonably conclude no Rajkot businesses existed. An input
 * that matches exactly is honest about what it does.
 */
export default function BusinessFilterBar({
  filters,
  totalItems,
  onExport,
  isExporting,
  disabled = false,
}: BusinessFilterBarProps) {
  const {
    search,
    city,
    category,
    hasWebsite,
    hasEmail,
    hasPhone,
    activeCount,
    setFilter,
    resetFilters,
  } = filters;

  return (
    <div className="lf-filter-card">
      <div className="flex flex-wrap items-center gap-3">
        <span className="lf-filter-legend">
          <FilterOutlined aria-hidden />
          Filters
          {activeCount > 0 && (
            <Badge
              count={activeCount}
              color="var(--lf-accent)"
              style={{ boxShadow: "none", color: "#0b0b0b" }}
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
