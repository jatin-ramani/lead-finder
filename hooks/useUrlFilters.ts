"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import {
  BUSINESS_SORT_FIELDS,
  type BusinessQuery,
  type BusinessSortField,
  type SortOrder,
} from "@/types/api";

/**
 * The list's filter, sort and pagination state, stored in the URL.
 *
 * Not `useState`. The URL is the only place this state can live and still be
 * shareable, survive a reload, and work with the back button — someone who
 * filters to Surat and sends a colleague the link should be sending them the
 * filtered view, not the default one.
 *
 * It also removes an entire class of bug: with one source of truth there is
 * nothing to keep in sync, so the table cannot end up showing page 3 while the
 * paginator says page 1.
 *
 * Defaults are never written into the URL. `/businesses` and
 * `/businesses?page=1&pageSize=20&sortBy=id&sortOrder=desc` are the same view,
 * and only the first is worth looking at.
 */

export const DEFAULT_PAGE_SIZE = 20;
/** The backend clamps to 100; offering more would silently mislead. */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const DEFAULT_SORT_BY: BusinessSortField = "id";
const DEFAULT_SORT_ORDER: SortOrder = "desc";

/** Filters that reset paging when changed — page 3 of a new filter is meaningless. */
const FILTER_PARAMS = ["search", "city", "category", "status"] as const;

type FilterParam = (typeof FILTER_PARAMS)[number];

function readInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readSortBy(value: string | null): BusinessSortField {
  return (BUSINESS_SORT_FIELDS as readonly string[]).includes(value ?? "")
    ? (value as BusinessSortField)
    : DEFAULT_SORT_BY;
}

function readSortOrder(value: string | null): SortOrder {
  return value === "asc" ? "asc" : DEFAULT_SORT_ORDER;
}

export interface UrlFilters {
  /** Ready to hand straight to the API client. */
  query: Required<Pick<BusinessQuery, "page" | "pageSize" | "sortBy" | "sortOrder">> &
    BusinessQuery;

  search: string;
  city: string;
  category: string;
  status: string;
  page: number;
  pageSize: number;
  sortBy: BusinessSortField;
  sortOrder: SortOrder;

  /** How many filters are narrowing the list, for the badge on the filter bar. */
  activeCount: number;
  hasActiveFilters: boolean;

  setFilter: (key: FilterParam, value: string | undefined) => void;
  setPage: (page: number, pageSize?: number) => void;
  setSort: (sortBy: BusinessSortField, sortOrder: SortOrder) => void;
  resetFilters: () => void;
}

export function useUrlFilters(): UrlFilters {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const city = searchParams.get("city") ?? "";
  const category = searchParams.get("category") ?? "";
  const status = searchParams.get("status") ?? "";
  const page = readInt(searchParams.get("page"), 1);
  const pageSize = readInt(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE);
  const sortBy = readSortBy(searchParams.get("sortBy"));
  const sortOrder = readSortOrder(searchParams.get("sortOrder"));

  /**
   * Applies a set of changes and navigates.
   *
   * `replace`, not `push`: typing in a search box would otherwise stack one
   * history entry per keystroke, and the back button would crawl backwards
   * through the word rather than leaving the page.
   *
   * `scroll: false` keeps the viewport still — re-sorting a table you have
   * scrolled to should not throw you back to the top.
   */
  const apply = useCallback(
    (changes: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(changes)) {
        const isDefault =
          value === undefined ||
          value === "" ||
          (key === "page" && value === 1) ||
          (key === "pageSize" && value === DEFAULT_PAGE_SIZE) ||
          (key === "sortBy" && value === DEFAULT_SORT_BY) ||
          (key === "sortOrder" && value === DEFAULT_SORT_ORDER);

        if (isDefault) next.delete(key);
        else next.set(key, String(value));
      }

      const queryString = next.toString();

      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const setFilter = useCallback(
    (key: FilterParam, value: string | undefined) => {
      // Changing a filter always returns to page 1: the result set is
      // different, so the old page number refers to nothing.
      apply({ [key]: value?.trim() || undefined, page: 1 });
    },
    [apply],
  );

  const setPage = useCallback(
    (nextPage: number, nextPageSize?: number) => {
      apply({
        page: nextPage,
        ...(nextPageSize === undefined ? {} : { pageSize: nextPageSize }),
      });
    },
    [apply],
  );

  const setSort = useCallback(
    (nextSortBy: BusinessSortField, nextSortOrder: SortOrder) => {
      // Re-sorting also returns to page 1 — page 3 of a different ordering is
      // a different set of rows, which reads as data loss.
      apply({ sortBy: nextSortBy, sortOrder: nextSortOrder, page: 1 });
    },
    [apply],
  );

  const resetFilters = useCallback(() => {
    apply({
      search: undefined,
      city: undefined,
      category: undefined,
      status: undefined,
      page: 1,
    });
  }, [apply]);

  const activeCount = FILTER_PARAMS.filter((key) =>
    Boolean(searchParams.get(key)),
  ).length;

  const query = useMemo(
    () => ({
      page,
      pageSize,
      sortBy,
      sortOrder,
      // Blank values are omitted rather than sent: `?city=` is an exact match
      // on the empty string and would return nothing.
      ...(search ? { search } : {}),
      ...(city ? { city } : {}),
      ...(category ? { category } : {}),
      ...(status ? { status } : {}),
    }),
    [page, pageSize, sortBy, sortOrder, search, city, category, status],
  );

  return {
    query,
    search,
    city,
    category,
    status,
    page,
    pageSize,
    sortBy,
    sortOrder,
    activeCount,
    hasActiveFilters: activeCount > 0,
    setFilter,
    setPage,
    setSort,
    resetFilters,
  };
}
