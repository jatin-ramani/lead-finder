"use client";

import { Skeleton, Tooltip } from "antd";

import type { ScanStats as ScanStatsValue } from "../hooks/useScanJobs";

interface ScanStatsProps {
  stats: ScanStatsValue;
  isLoading: boolean;
}

interface Figure {
  key: keyof ScanStatsValue;
  label: string;
  hint?: string;
  accent?: boolean;
}

const FIGURES: Figure[] = [
  { key: "totalScans", label: "Scans Run" },
  { key: "completed", label: "Completed" },
  {
    key: "businessesFound",
    label: "Total Found",
    hint: "Total places retrieved across all geographic search cells.",
  },
  {
    key: "businessesStored",
    label: "Stored Leads",
    hint: "Verified leads stored in CRM with valid email or phone number.",
    accent: true,
  },
  {
    key: "businessesSkippedNoContact",
    label: "Skipped (No Contact)",
    hint: "Places without an email address or phone number (filtered out).",
  },
  {
    key: "businessesDuplicates",
    label: "Enriched Duplicates",
    hint: "Pre-existing leads enriched with new contact info.",
  },
];

export default function ScanStats({ stats, isLoading }: ScanStatsProps) {
  return (
    <div className="lf-scan-stats">
      {FIGURES.map((figure) => (
        <div key={figure.key} className="lf-scan-stat">
          {isLoading ? (
            <Skeleton
              active
              title={{ width: "60%" }}
              paragraph={{ rows: 1, width: "40%" }}
            />
          ) : (
            <>
              <dt className="lf-scan-stat-label">
                {figure.hint ? (
                  <Tooltip title={figure.hint}>
                    <span tabIndex={0} className="lf-scan-stat-hint">
                      {figure.label}
                    </span>
                  </Tooltip>
                ) : (
                  figure.label
                )}
              </dt>
              <dd
                className={`lf-scan-stat-value ${
                  figure.accent ? "lf-scan-stat-value--accent" : ""
                }`}
              >
                {(stats[figure.key] ?? 0).toLocaleString()}
              </dd>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

