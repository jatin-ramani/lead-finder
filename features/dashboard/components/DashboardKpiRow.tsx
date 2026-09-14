"use client";

import {
  ArrowRightOutlined,
  MailOutlined,
  GlobalOutlined,
  PhoneOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Skeleton } from "antd";
import Link from "next/link";
import React from "react";

import type { DashboardBusinessStats } from "@/types/api";

interface DashboardKpiRowProps {
  business: DashboardBusinessStats | undefined;
  opportunityShare: number;
  isLoading: boolean;
}

export default function DashboardKpiRow({
  business,
  opportunityShare,
  isLoading,
}: DashboardKpiRowProps) {
  if (isLoading || !business) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((key) => (
          <div key={key} className="lf-kpi-card">
            <Skeleton active paragraph={{ rows: 2 }} title={{ width: "40%" }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Hero Dark Green Card - Total Leads */}
      <div className="lf-kpi-card lf-kpi-card--hero">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm">
              <TeamOutlined />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-white/80">
              Total Discovered
            </span>
          </div>
          <Link
            href="/businesses"
            className="lf-kpi-arrow-btn lf-kpi-arrow-btn--hero"
            aria-label="View all leads"
          >
            <ArrowRightOutlined />
          </Link>
        </div>

        <div className="mt-4">
          <div className="text-3xl font-bold tracking-tight text-white">
            {business.totalBusinesses.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/85">
              {opportunityShare}% No Website
            </span>
            <span className="text-xs text-white/70">
              {business.actionableLeads > 0 ? `${business.actionableLeads} actionable` : "across all cities"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Reachable by Email */}
      <div className="lf-kpi-card">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--lf-accent-soft)] text-sm text-[var(--lf-brand)]">
              <MailOutlined />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--lf-text-secondary)]">
              With Email
            </span>
          </div>
          <Link
            href="/businesses?has_email=true"
            className="lf-kpi-arrow-btn"
            aria-label="View businesses with email"
          >
            <ArrowRightOutlined />
          </Link>
        </div>

        <div className="mt-4">
          <div className="text-3xl font-bold tracking-tight text-[var(--lf-text)]">
            {business.withEmail.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center rounded-full bg-[var(--lf-accent-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--lf-brand)]">
              Ready for outreach
            </span>
            <span className="text-xs text-[var(--lf-text-muted)]">
              Direct email
            </span>
          </div>
        </div>
      </div>

      {/* 3. With Phone / WhatsApp */}
      <div className="lf-kpi-card">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--lf-accent-soft)] text-sm text-[var(--lf-brand)]">
              <PhoneOutlined />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--lf-text-secondary)]">
              With Phone / Mobile
            </span>
          </div>
          <Link
            href="/businesses?has_phone=true"
            className="lf-kpi-arrow-btn"
            aria-label="View businesses with phone"
          >
            <ArrowRightOutlined />
          </Link>
        </div>

        <div className="mt-4">
          <div className="text-3xl font-bold tracking-tight text-[var(--lf-text)]">
            {business.withPhone.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center rounded-full bg-[var(--lf-accent-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--lf-brand)]">
              WhatsApp eligible
            </span>
            <span className="text-xs text-[var(--lf-text-muted)]">
              Direct call & export
            </span>
          </div>
        </div>
      </div>

      {/* 4. No Website Opportunity */}
      <div className="lf-kpi-card">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--lf-warning-soft)] text-sm text-[var(--lf-warning)]">
              <GlobalOutlined />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--lf-text-secondary)]">
              No Website
            </span>
          </div>
          <Link
            href="/businesses?has_website=false"
            className="lf-kpi-arrow-btn"
            aria-label="View businesses without website"
          >
            <ArrowRightOutlined />
          </Link>
        </div>

        <div className="mt-4">
          <div className="text-3xl font-bold tracking-tight text-[var(--lf-text)]">
            {business.withoutWebsite.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center rounded-full bg-[var(--lf-warning-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--lf-warning)]">
              Web dev pitches
            </span>
            <span className="text-xs text-[var(--lf-text-muted)]">
              High opportunity
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
