"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { BUSINESS_SORT_FIELDS, type BusinessQuery, type BusinessSortField, type SortOrder } from "@/types/api";

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_SORT_BY: BusinessSortField = "id";
const DEFAULT_SORT_ORDER: SortOrder = "desc";
const FILTER_PARAMS = ["search", "city", "category", "has_website", "has_email", "has_phone", "view"] as const;
type FilterParam = (typeof FILTER_PARAMS)[number];

function readInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
function readBoolean(value: string | null): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}
function readSortBy(value: string | null): BusinessSortField {
  return (BUSINESS_SORT_FIELDS as readonly string[]).includes(value ?? "") ? value as BusinessSortField : DEFAULT_SORT_BY;
}

export interface UrlFilters {
  query: BusinessQuery & Required<Pick<BusinessQuery, "page" | "pageSize" | "sortBy" | "sortOrder">>;
  search: string; city: string; category: string; view: string;
  hasWebsite: boolean | undefined; hasEmail: boolean; hasPhone: boolean;
  page: number; pageSize: number; sortBy: BusinessSortField; sortOrder: SortOrder;
  activeCount: number; hasActiveFilters: boolean;
  setFilter: (key: FilterParam, value: string | boolean | undefined) => void;
  setPage: (page: number, pageSize?: number) => void;
  setSort: (sortBy: BusinessSortField, sortOrder: SortOrder) => void;
  resetFilters: () => void;
}

export function useUrlFilters(): UrlFilters {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const pendingParams = useRef(params.toString());
  useEffect(() => {
    pendingParams.current = params.toString();
  }, [params]);

  const search = params.get("search") ?? "";
  const city = params.get("city") ?? "";
  const category = params.get("category") ?? "";
  const view = params.get("view") ?? "";
  const hasWebsite = readBoolean(params.get("has_website"));
  const hasEmail = readBoolean(params.get("has_email")) === true;
  const hasPhone = readBoolean(params.get("has_phone")) === true;
  const page = readInt(params.get("page"), 1);
  const pageSize = readInt(params.get("pageSize"), DEFAULT_PAGE_SIZE);
  const sortBy = readSortBy(params.get("sortBy"));
  const sortOrder: SortOrder = params.get("sortOrder") === "asc" ? "asc" : DEFAULT_SORT_ORDER;

  const apply = useCallback((changes: Record<string, string | number | boolean | undefined>, history: "push" | "replace" = "replace") => {
    const next = new URLSearchParams(pendingParams.current);
    for (const [key, value] of Object.entries(changes)) {
      const remove = value === undefined || value === "" || (key === "page" && value === 1) ||
        (key === "pageSize" && value === DEFAULT_PAGE_SIZE) || (key === "sortBy" && value === DEFAULT_SORT_BY) ||
        (key === "sortOrder" && value === DEFAULT_SORT_ORDER);
      if (remove) next.delete(key);
      else next.set(key, String(value));
    }
    const queryStr = next.toString();
    pendingParams.current = queryStr;
    const href = queryStr ? `${pathname}?${queryStr}` : pathname;
    if (history === "push") {
      router.push(href);
    } else {
      router.replace(href);
    }
  }, [pathname, router]);

  const setFilter = useCallback((key: FilterParam, value: string | boolean | undefined) => {
    apply({ [key]: typeof value === "string" ? value.trim() || undefined : value, page: 1 }, key === "search" ? "replace" : "push");
  }, [apply]);

  const setPage = useCallback((next: number, size?: number) => {
    apply({ page: next, ...(size === undefined ? {} : { pageSize: size }) }, "push");
  }, [apply]);

  const setSort = useCallback((field: BusinessSortField, order: SortOrder) => {
    apply({ sortBy: field, sortOrder: order, page: 1 }, "replace");
  }, [apply]);

  const resetFilters = useCallback(() => {
    apply({ search: undefined, city: undefined, category: undefined, has_website: undefined, has_email: undefined, has_phone: undefined, view: undefined, page: 1 }, "push");
  }, [apply]);

  const activeCount = FILTER_PARAMS.filter((key) => key !== "view" && params.has(key)).length;

  const query = useMemo(() => ({
    page,
    pageSize,
    sortBy,
    sortOrder,
    ...(search && { search }),
    ...(city && { city }),
    ...(category && { category }),
    ...(hasWebsite !== undefined && { has_website: hasWebsite }),
    ...(hasEmail && { has_email: true }),
    ...(hasPhone && { has_phone: true }),
  }), [page, pageSize, sortBy, sortOrder, search, city, category, hasWebsite, hasEmail, hasPhone]);

  return {
    query,
    search,
    city,
    category,
    view,
    hasWebsite,
    hasEmail,
    hasPhone,
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
