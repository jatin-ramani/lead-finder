'use client';

import type { ReactNode } from "react";
import AppShell from "@/components/AppShell";
import ProtectedLayout from "@/components/ProtectedLayout";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedLayout>
      <AppShell>{children}</AppShell>
    </ProtectedLayout>
  );
}
