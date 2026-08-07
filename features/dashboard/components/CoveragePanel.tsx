"use client";

import { Skeleton } from "antd";
import { useMemo } from "react";

import LeadMixDonut, { type DonutSegment } from "@/components/charts/LeadMixDonut";
import Panel from "@/components/Panel";
import { CHART_COLORS } from "@/lib/theme";
import type { DashboardBusinessStats } from "@/types/api";

interface CoveragePanelProps {
  business: DashboardBusinessStats | undefined;
  isLoading: boolean;
}

/**
 * Website coverage across everything discovered.
 *
 * Two real segments straight from `/dashboard/stats` — no derivation, no
 * client-side aggregation, nothing estimated. The emphasis colour goes to the
 * businesses *without* a site, because in this product that is the opportunity
 * rather than the problem.
 */
export default function CoveragePanel({
  business,
  isLoading,
}: CoveragePanelProps) {
  const segments = useMemo<DonutSegment[]>(
    () =>
      business
        ? [
            {
              key: "no-website",
              label: "No website",
              value: business.withoutWebsite,
              color: CHART_COLORS.series1,
              hint: "Businesses you could build a site for",
            },
            {
              key: "has-website",
              label: "Has a website",
              value: business.withWebsite,
              color: CHART_COLORS.neutral,
              hint: "Already online — context, not a lead",
            },
          ]
        : [],
    [business],
  );

  return (
    <Panel
      title="Website coverage"
      description="How much of what you have discovered is already online"
    >
      {isLoading || !business ? (
        <Skeleton active title={false} paragraph={{ rows: 5 }} />
      ) : business.totalBusinesses === 0 ? (
        <p className="lf-panel-empty">
          Nothing discovered yet. Run a scan and this fills in.
        </p>
      ) : (
        <LeadMixDonut segments={segments} total={business.totalBusinesses} />
      )}
    </Panel>
  );
}
