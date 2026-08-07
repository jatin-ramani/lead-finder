"use client";

import {
  ArrowRightOutlined,
  RadarChartOutlined,
  ShopOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import type { ReactNode } from "react";

import Panel from "@/components/Panel";
import type { DashboardStats } from "@/types/api";
import type { DerivedStats } from "../hooks/useDashboard";

interface NextActionsProps {
  stats: DashboardStats | undefined;
  derived: DerivedStats;
}

interface Action {
  key: string;
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  primary?: boolean;
}

/**
 * Chooses what to suggest from the numbers actually returned.
 *
 * Ordered by what the state of the workspace makes most useful, and every
 * suggestion links to a route that exists and works. Suggestions that would
 * need the scraping screens are absent until those screens are built —
 * offering an action that leads nowhere is the placeholder UI this project
 * does not ship.
 */
function buildActions(
  stats: DashboardStats | undefined,
  derived: DerivedStats,
): Action[] {
  if (!stats) return [];

  const actions: Action[] = [];

  if (derived.isEmpty) {
    return [
      {
        key: "first-scan",
        icon: <ThunderboltOutlined />,
        title: "Run your first scan",
        description:
          "Pick a city and a category, and Lead Finder will pull in the businesses it finds.",
        href: "/scanner",
        primary: true,
      },
    ];
  }

  if (stats.business.withoutWebsite > 0) {
    actions.push({
      key: "review-leads",
      icon: <ShopOutlined />,
      title: `Review ${stats.business.withoutWebsite.toLocaleString()} businesses without a website`,
      description: "The opportunities you have discovered so far.",
      href: "/businesses?status=No+Website",
      primary: true,
    });
  }

  actions.push({
    key: "scan-more",
    icon: <RadarChartOutlined />,
    title: "Scan another city",
    description: `${stats.scanJobs.total.toLocaleString()} scans run so far. Widen the net with a new city or category.`,
    href: "/scanner",
  });

  if (stats.business.withEmail > 0) {
    actions.push({
      key: "email-reachable",
      icon: <ArrowRightOutlined />,
      title: `${stats.business.withEmail.toLocaleString()} businesses have an email address`,
      description: "Browse everything discovered, filtered and sorted.",
      href: "/businesses",
    });
  }

  return actions;
}

/**
 * What to do next.
 *
 * The dashboard's job is not only to report but to point somewhere. Each card
 * is a real deep link — the "without a website" one lands on the businesses
 * list already filtered, using the URL state the list reads.
 */
export default function NextActions({ stats, derived }: NextActionsProps) {
  const actions = buildActions(stats, derived);

  if (actions.length === 0) return null;

  return (
    <Panel title="What next" description="Suggested from the state of your workspace" flush>
      <ul className="lf-actions">
        {actions.map((action) => (
          <li key={action.key}>
            <Link
              href={action.href}
              className={`lf-action ${action.primary ? "is-primary" : ""}`}
            >
              <span className="lf-action-icon" aria-hidden>
                {action.icon}
              </span>
              <span className="lf-action-body">
                <span className="lf-action-title">{action.title}</span>
                <span className="lf-action-desc">{action.description}</span>
              </span>
              <ArrowRightOutlined className="lf-action-chevron" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
