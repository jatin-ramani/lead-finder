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
  { key: "totalScans", label: "Scans run" },
  { key: "completed", label: "Completed" },
  { key: "failed", label: "Failed" },
  {
    key: "resultsReturned",
    label: "Results returned",
    // Named precisely: this double-counts a business found by two scans, and
    // calling it "businesses found" would imply a distinct count it is not.
    hint: "Total results Geoapify returned across every scan. A business found by two scans is counted twice.",
  },
  {
    key: "newBusinesses",
    label: "New businesses",
    hint: "Rows actually added — results already in your workspace are skipped.",
    accent: true,
  },
];

/**
 * Totals across the whole scan history.
 *
 * Derived in the browser, which is sound here for one specific reason:
 * `GET /scan/jobs` is unpaginated, so the array really is every job. This is
 * not the partial-page aggregation the business list had to abandon.
 */
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
                {stats[figure.key].toLocaleString()}
              </dd>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
