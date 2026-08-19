"use client";

import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Skeleton } from "antd";
import Link from "next/link";

import type { DashboardBusinessStats } from "@/types/api";

interface DashboardHeroProps {
  business: DashboardBusinessStats | undefined;
  opportunityShare: number;
  isLoading: boolean;
}

function Figure({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="lf-hero-figure">
      <dt>{label}</dt>
      <dd>{value.toLocaleString()}</dd>
      {hint && <p className="lf-hero-figure-hint">{hint}</p>}
    </div>
  );
}

/**
 * The one number this product exists to produce.
 *
 * Lead Finder's whole purpose is finding businesses without a website, so that
 * count is the headline and everything else is context. Giving five metrics
 * equal weight would be an admin panel; this is the answer to "why am I here".
 *
 * Deliberately **not** labelled "leads". A lead is a business with no website
 * that can also be contacted, and the backend cannot intersect those two — it
 * reports `withoutWebsite` and `withEmail` separately with no endpoint joining
 * them. Calling this "leads" would overstate it by however many of those 28
 * have no phone and no email.
 */
export default function DashboardHero({
  business,
  opportunityShare,
  isLoading,
}: DashboardHeroProps) {
  if (isLoading || !business) {
    return (
      <section className="lf-hero">
        <Skeleton
          active
          title={{ width: "30%" }}
          paragraph={{ rows: 2, width: ["55%", "40%"] }}
        />
      </section>
    );
  }

  return (
    <section className="lf-hero" aria-labelledby="lf-hero-heading">
      <div className="lf-hero-main">
        <p className="lf-hero-label" id="lf-hero-heading">
          Businesses without a website
        </p>

        <p className="lf-hero-value">
          {business.withoutWebsite.toLocaleString()}
          {business.totalBusinesses > 0 && (
            <span className="lf-hero-share">
              {opportunityShare}% of {business.totalBusinesses.toLocaleString()}
            </span>
          )}
        </p>

        <p className="lf-hero-caption">
          Every one of these is a business you could build a site for.
        </p>

        <Link href="/businesses?has_website=false" className="lf-hero-cta">
          <Button type="primary" icon={<ArrowRightOutlined aria-hidden />}>
            Review them
          </Button>
        </Link>
      </div>

      <dl className="lf-hero-figures">
        <Figure label="Total discovered" value={business.totalBusinesses} />
        <Figure label="Already online" value={business.withWebsite} />
        <Figure
          label="Reachable by email"
          value={business.withEmail}
          hint="Across all businesses, not only those without a site"
        />
      </dl>
    </section>
  );
}
