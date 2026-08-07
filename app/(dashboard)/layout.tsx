import type { ReactNode } from "react";

import AppShell from "@/components/AppShell";
import QueryProvider from "@/providers/QueryProvider";

/**
 * Shell for every workspace route.
 *
 * `QueryProvider` sits above `AppShell` rather than inside each page so the
 * cache spans navigations — moving between routes reuses what was already
 * fetched instead of starting again.
 *
 * It replaces a `BusinessProvider` that fetched the entire business list once
 * and shared the array. That worked only while the list endpoint returned
 * everything; it is now paginated, and server state belongs in a cache that
 * understands staleness, retries and invalidation.
 */
export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <QueryProvider>
      <AppShell>{children}</AppShell>
    </QueryProvider>
  );
}
