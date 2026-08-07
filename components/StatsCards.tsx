"use client";

import {
  CloseCircleOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Skeleton } from "antd";
import type { ReactNode } from "react";

import { formatNumber } from "@/lib/format";
import type { BusinessStats } from "@/types/business";

interface StatDefinition {
  key: keyof BusinessStats;
  label: string;
  icon: ReactNode;
  accent: string;
  /** Renders "N% of total" beneath the value. */
  share?: boolean;
  caption?: string;
}

const STATS: StatDefinition[] = [
  {
    key: "total",
    label: "Total Businesses",
    icon: <DatabaseOutlined />,
    accent: "#E5B93C",
    caption: "in your workspace",
  },
  // No-website is the opportunity in a lead-gen tool, so it wears the accent,
  // not a red "bad" status. Has-website is context and stays neutral.
  {
    key: "noWebsite",
    label: "No Website",
    icon: <CloseCircleOutlined />,
    accent: "#E5B93C",
    share: true,
  },
  {
    key: "hasWebsite",
    label: "Has Website",
    icon: <GlobalOutlined />,
    accent: "#A1A1AA",
    share: true,
  },
  {
    key: "emails",
    label: "Emails Found",
    icon: <MailOutlined />,
    accent: "#9078E8",
    share: true,
  },
  {
    key: "phones",
    label: "Phone Numbers Found",
    icon: <PhoneOutlined />,
    accent: "#3FC3E8",
    share: true,
  },
  {
    key: "todayScan",
    label: "Found Today",
    icon: <ThunderboltOutlined />,
    accent: "#E5B93C",
    caption: "since first load today",
  },
];

interface StatsCardsProps {
  stats: BusinessStats;
  loading?: boolean;
}

export default function StatsCards({ stats, loading = false }: StatsCardsProps) {
  return (
    <div className="lf-stat-grid">
      {STATS.map((stat) => {
        const value = stats[stat.key];
        const share =
          stat.share && stats.total > 0
            ? Math.round((value / stats.total) * 100)
            : null;

        return (
          <article key={stat.key} className="lf-stat-card">
            {loading ? (
              <Skeleton
                active
                title={{ width: "55%" }}
                paragraph={{ rows: 1, width: "35%" }}
              />
            ) : (
              <>
                <header className="lf-stat-head">
                  <span className="lf-stat-label">{stat.label}</span>
                  <span
                    className="lf-stat-icon"
                    style={{
                      color: stat.accent,
                      background: `color-mix(in srgb, ${stat.accent} 14%, transparent)`,
                    }}
                    aria-hidden
                  >
                    {stat.icon}
                  </span>
                </header>

                <p className="lf-stat-value">{formatNumber(value)}</p>

                {/* A share, not a trend — the API has no history, so there is
                    deliberately no up/down arrow here. */}
                <p className="lf-stat-meta">
                  {share !== null ? (
                    <>
                      <span
                        className="lf-share-chip"
                        style={{
                          color: stat.accent,
                          background: `color-mix(in srgb, ${stat.accent} 13%, transparent)`,
                        }}
                      >
                        {share}%
                      </span>
                      <span className="lf-stat-caption">of total</span>
                    </>
                  ) : (
                    <span className="lf-stat-caption">{stat.caption}</span>
                  )}
                </p>
              </>
            )}
          </article>
        );
      })}
    </div>
  );
}
