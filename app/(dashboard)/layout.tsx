import type { ReactNode } from "react";

import AppShell from "@/components/AppShell";
import BusinessProvider from "@/providers/BusinessProvider";

/**
 * Shell for every workspace route.
 *
 * `BusinessProvider` sits above `AppShell` so the top-navbar search and refresh
 * button operate on the same dataset the pages render.
 */
export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <BusinessProvider>
      <AppShell>{children}</AppShell>
    </BusinessProvider>
  );
}
