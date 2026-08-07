"use client";

import type { ReactNode } from "react";

import { BusinessContext, useBusinessesData } from "@/hooks/useBusinesses";

/**
 * Mounts the businesses data once and shares it with the whole workspace, so
 * the navbar search/refresh and every page read the same GET /businesses result
 * instead of each issuing their own request.
 */
export default function BusinessProvider({ children }: { children: ReactNode }) {
  const value = useBusinessesData();

  return (
    <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
  );
}

// Kept so existing `@/providers/BusinessProvider` imports continue to resolve.
export { useBusinesses, SCAN_BASELINE_KEY } from "@/hooks/useBusinesses";
export type { BusinessContextValue } from "@/hooks/useBusinesses";
