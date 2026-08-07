"use client";

import { useCallback, useMemo, useState } from "react";

import { hasWebsite, isPresent } from "@/lib/format";
import type { Business, BusinessFilters } from "@/types/business";

const EMPTY_FILTERS: BusinessFilters = { search: "" };

function matchesSearch(business: Business, term: string): boolean {
  if (!term) return true;
  const needle = term.toLowerCase();

  return (
    [
      business.name,
      business.phone,
      business.email,
      business.website,
      business.city,
      business.category,
      business.address,
    ] as (string | null | undefined)[]
  ).some((field) => isPresent(field) && field.toLowerCase().includes(needle));
}

export interface UseBusinessFiltersOptions {
  /** Search term coming from the top navbar, ANDed with the local search box. */
  globalSearch?: string;
  /** Restricts the dataset before filtering, e.g. the Leads page. */
  baseFilter?: (business: Business) => boolean;
}

export function useBusinessFilters(
  businesses: Business[],
  { globalSearch = "", baseFilter }: UseBusinessFiltersOptions = {},
) {
  const [filters, setFilters] = useState<BusinessFilters>(EMPTY_FILTERS);

  const setFilter = useCallback(
    <K extends keyof BusinessFilters>(key: K, value: BusinessFilters[K]) => {
      setFilters((previous) => ({ ...previous, [key]: value }));
    },
    [],
  );

  const reset = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const scoped = useMemo(
    () => (baseFilter ? businesses.filter(baseFilter) : businesses),
    [businesses, baseFilter],
  );

  const filtered = useMemo(() => {
    const localTerm = filters.search.trim().toLowerCase();
    const globalTerm = globalSearch.trim().toLowerCase();

    return scoped.filter((business) => {
      if (filters.city && business.city !== filters.city) return false;
      if (filters.category && business.category !== filters.category) return false;

      if (filters.status) {
        // "has-website" / "no-website" are derived; anything else is a raw status.
        if (filters.status === "has-website") {
          if (!hasWebsite(business)) return false;
        } else if (filters.status === "no-website") {
          if (hasWebsite(business)) return false;
        } else if (business.status !== filters.status) {
          return false;
        }
      }

      return (
        matchesSearch(business, localTerm) && matchesSearch(business, globalTerm)
      );
    });
  }, [scoped, filters, globalSearch]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.city) count += 1;
    if (filters.category) count += 1;
    if (filters.status) count += 1;
    if (filters.search.trim()) count += 1;
    return count;
  }, [filters]);

  return {
    filters,
    setFilter,
    reset,
    filtered,
    scoped,
    activeFilterCount,
    hasActiveFilters: activeFilterCount > 0,
  };
}
