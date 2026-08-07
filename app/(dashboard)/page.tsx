"use client";

import { Button } from "antd";
import Link from "next/link";
import { useMemo, useState } from "react";

import BusinessDrawer from "@/components/BusinessDrawer";
import CityCoverageBars, {
  type CityRow,
} from "@/components/charts/CityCoverageBars";
import LeadMixDonut, {
  type DonutSegment,
} from "@/components/charts/LeadMixDonut";
import Panel from "@/components/Panel";
import StatsCards from "@/components/StatsCards";
import TopLeads from "@/components/TopLeads";
import { hasWebsite, isPresent } from "@/lib/format";
import { CHART_COLORS } from "@/lib/theme";
import { useBusinesses } from "@/providers/BusinessProvider";
import type { Business } from "@/types/business";

function isContactable(business: Business): boolean {
  return isPresent(business.phone) || isPresent(business.email);
}

export default function DashboardPage() {
  const { businesses, stats, loading } = useBusinesses();
  const [selected, setSelected] = useState<Business | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const qualified = useMemo(
    () => businesses.filter((b) => !hasWebsite(b) && isContactable(b)),
    [businesses],
  );

  const segments = useMemo<DonutSegment[]>(() => {
    const unreachable = businesses.filter(
      (b) => !hasWebsite(b) && !isContactable(b),
    ).length;

    return [
      {
        key: "qualified",
        label: "Qualified lead",
        value: qualified.length,
        color: CHART_COLORS.series1,
        hint: "No website, and reachable by phone or email",
      },
      {
        key: "unreachable",
        label: "No website · no contact",
        value: unreachable,
        color: CHART_COLORS.series2,
        hint: "No website, but no way to reach them yet",
      },
      {
        key: "online",
        label: "Already has a website",
        value: stats.hasWebsite,
        color: CHART_COLORS.neutral,
        hint: "Not a lead for a new site build",
      },
    ];
  }, [businesses, qualified.length, stats.hasWebsite]);

  const cityRows = useMemo<CityRow[]>(() => {
    const byCity = new Map<string, CityRow>();

    for (const business of businesses) {
      const city = business.city?.trim();
      if (!city) continue;
      const row = byCity.get(city) ?? { city, total: 0, noWebsite: 0 };
      row.total += 1;
      if (!hasWebsite(business)) row.noWebsite += 1;
      byCity.set(city, row);
    }

    return Array.from(byCity.values()).sort((a, b) => b.total - a.total);
  }, [businesses]);

  const openDetails = (business: Business) => {
    setSelected(business);
    setDrawerOpen(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <StatsCards stats={stats} loading={loading} />

      <div className="lf-grid-2">
        <Panel
          title="Coverage by city"
          description="How much of each scanned city is still without a website"
        >
          <CityCoverageBars rows={cityRows} />
        </Panel>

        <Panel
          title="Lead mix"
          description="Where every business sits in your pipeline"
        >
          <LeadMixDonut segments={segments} total={stats.total} />
        </Panel>
      </div>

      <div className="lf-grid-2">
        <Panel
          title="Top leads"
          description="No website, and reachable right now"
          extra={
            <Link href="/leads">
              <Button size="small" type="text" className="lf-card-link">
                View all
              </Button>
            </Link>
          }
        >
          <TopLeads
            leads={qualified}
            loading={loading}
            onSelect={openDetails}
          />
        </Panel>

        <Panel
          title="Contact reach"
          description="How reachable your discovered businesses are"
        >
          <div className="lf-meters">
            <Meter
              label="Have a phone number"
              value={stats.phones}
              total={stats.total}
              color={CHART_COLORS.series1}
            />
            <Meter
              label="Have an email address"
              value={stats.emails}
              total={stats.total}
              color={CHART_COLORS.series2}
            />
            <Meter
              label="Qualified as a lead"
              value={qualified.length}
              total={stats.total}
              color={CHART_COLORS.series1}
            />
          </div>
        </Panel>
      </div>

      <BusinessDrawer
        business={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

/** A single ratio against a limit reads better as a meter than a chart. */
function Meter({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="lf-meter">
      <div className="lf-meter-head">
        <span className="lf-meter-label">{label}</span>
        <span className="lf-meter-value">
          {value}
          <span className="lf-meter-total">/ {total}</span>
        </span>
      </div>
      <div className="lf-meter-track">
        <span style={{ width: `${percent}%`, background: color }} />
      </div>
    </div>
  );
}
