/**
 * Every cache key in the app, in one place.
 *
 * Keys are hierarchical so invalidation can be as broad or as narrow as the
 * mutation warrants: `queryKeys.businesses.all` drops every list and every
 * detail, `queryKeys.businesses.detail(7)` drops one row. Scattering literal
 * arrays through feature code is how caches end up with a stale corner nobody
 * can find, so nothing outside this file writes a key by hand.
 *
 * `as const` throughout — TanStack Query hashes keys structurally, and a
 * widened `string[]` would let a typo compile into a silent cache miss.
 */

import type { BusinessQuery } from "@/types/api";

export const queryKeys = {
  businesses: {
    all: ["businesses"] as const,
    lists: () => [...queryKeys.businesses.all, "list"] as const,
    /**
     * The full query object is part of the key, so every distinct filter and
     * page combination is cached separately and going back a page is instant.
     */
    list: (query: BusinessQuery) =>
      [...queryKeys.businesses.lists(), query] as const,
    detail: (id: number) => [...queryKeys.businesses.all, id] as const,
    website: (id: number) =>
      [...queryKeys.businesses.all, id, "website"] as const,
  },

  scanJobs: {
    all: ["scanJobs"] as const,
    list: () => [...queryKeys.scanJobs.all, "list"] as const,
    latest: () => [...queryKeys.scanJobs.all, "latest"] as const,
  },

  scrapeJobs: {
    all: ["scrapeJobs"] as const,
    /** Unpaginated — the endpoint takes no parameters, so neither does the key. */
    list: () => [...queryKeys.scrapeJobs.all, "list"] as const,
    detail: (id: number) => [...queryKeys.scrapeJobs.all, id] as const,
  },

  dashboard: {
    all: ["dashboard"] as const,
  },

  system: {
    all: ["system"] as const,
    health: () => [...queryKeys.system.all, "health"] as const,
    version: () => [...queryKeys.system.all, "version"] as const,
    info: () => [...queryKeys.system.all, "info"] as const,
  },
} as const;
