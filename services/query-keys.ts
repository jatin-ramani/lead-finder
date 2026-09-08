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

import type { BusinessQuery, ExportPreviewRequest } from "@/types/api";

export const queryKeys = {
  businesses: {
    all: ["businesses"] as const,
    cities: () => [...queryKeys.businesses.all, "cities"] as const,
    lists: () => [...queryKeys.businesses.all, "list"] as const,
    /**
     * The full query object is part of the key, so every distinct filter and
     * page combination is cached separately and going back a page is instant.
     */
    list: (query: BusinessQuery) =>
      [...queryKeys.businesses.lists(), query] as const,
    exportPreview: (request: ExportPreviewRequest) =>
      [...queryKeys.businesses.all, "export-preview", request] as const,
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
    results: (id: number, query?: Record<string, unknown>) =>
      [...queryKeys.scrapeJobs.all, id, "results", query] as const,
  },

  dashboard: {
    all: ["dashboard"] as const,
  },

  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },

  tags: {
    all: ["tags"] as const,
    list: () => [...queryKeys.tags.all, "list"] as const,
  },

  notes: {
    all: ["notes"] as const,
    business: (id: number) => [...queryKeys.notes.all, "business", id] as const,
  },

  activities: {
    all: ["activities"] as const,
    business: (id: number, page?: number, activityType?: string) =>
      [...queryKeys.activities.all, "business", id, page, activityType] as const,
  },

  followUps: {
    all: ["followUps"] as const,
    business: (id: number, status?: string, priority?: string, overdue?: boolean, page?: number) =>
      [...queryKeys.followUps.all, "business", id, status, priority, overdue, page] as const,
    detail: (id: number) => [...queryKeys.followUps.all, "detail", id] as const,
    global: (params?: Record<string, unknown>) =>
      [...queryKeys.followUps.all, "global", params] as const,
  },

  automations: {
    all: ["automations"] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.automations.all, "list", params] as const,
    detail: (id: number) => [...queryKeys.automations.all, "detail", id] as const,
    variables: () => [...queryKeys.automations.all, "variables"] as const,
    executions: (params?: Record<string, unknown>) =>
      [...queryKeys.automations.all, "executions", params] as const,
    automationExecutions: (id: number, params?: Record<string, unknown>) =>
      [...queryKeys.automations.all, "automationExecutions", id, params] as const,
    cities: () => [...queryKeys.automations.all, "cities"] as const,
    cityStats: (city: string) => [...queryKeys.automations.all, "cityStats", city] as const,
    runs: (params?: Record<string, unknown>) =>
      [...queryKeys.automations.all, "runs", params] as const,
    runReport: (id: number) => [...queryKeys.automations.all, "runReport", id] as const,
  },

  templates: {
    all: ["templates"] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.templates.all, "list", params] as const,
    detail: (id: number) => [...queryKeys.templates.all, "detail", id] as const,
    variables: () => [...queryKeys.templates.all, "variables"] as const,
  },

  campaigns: {
    all: ["campaigns"] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.campaigns.all, "list", params] as const,
    detail: (id: number) => [...queryKeys.campaigns.all, "detail", id] as const,
    recipients: (id: number, params?: Record<string, unknown>) =>
      [...queryKeys.campaigns.all, id, "recipients", params] as const,
    previewRecipients: (criteria: Record<string, unknown>) =>
      [...queryKeys.campaigns.all, "preview-recipients", criteria] as const,
  },

  gmail: {
    all: ["gmail"] as const,
    status: () => [...queryKeys.gmail.all, "status"] as const,
  },

  system: {
    all: ["system"] as const,
    health: () => [...queryKeys.system.all, "health"] as const,
    version: () => [...queryKeys.system.all, "version"] as const,
    info: () => [...queryKeys.system.all, "info"] as const,
  },
} as const;
