"use client";

import { Tooltip } from "antd";

import { formatNumber } from "@/lib/format";
import { CHART_COLORS } from "@/lib/theme";

export interface CityRow {
  city: string;
  total: number;
  noWebsite: number;
}

interface CityCoverageBarsProps {
  rows: CityRow[];
  limit?: number;
}

/**
 * Nominal categories (city names), one measure — so every bar takes the same
 * slot-1 hue rather than a value ramp, and the stacked remainder sits in the
 * de-emphasis gray.
 */
export default function CityCoverageBars({
  rows,
  limit = 8,
}: CityCoverageBarsProps) {
  const visible = rows.slice(0, limit);
  const max = Math.max(...visible.map((row) => row.total), 1);
  const hidden = rows.length - visible.length;

  if (visible.length === 0) {
    return (
      <p className="lf-panel-empty">
        No cities scanned yet — run a scan to populate this chart.
      </p>
    );
  }

  return (
    <div className="lf-bars">
      {visible.map((row) => {
        const totalPct = (row.total / max) * 100;
        const leadPct = (row.noWebsite / max) * 100;
        const sitePct = totalPct - leadPct;

        return (
          <div key={row.city} className="lf-bar-row">
            <span className="lf-bar-label" title={row.city}>
              {row.city}
            </span>

            <span className="lf-bar-track">
              <Tooltip
                title={`${row.city} · ${row.noWebsite} without a website`}
                placement="top"
              >
                <span
                  className="lf-bar-fill lf-bar-fill--lead"
                  style={{ width: `${leadPct}%`, background: CHART_COLORS.series1 }}
                />
              </Tooltip>
              <Tooltip
                title={`${row.city} · ${row.total - row.noWebsite} already online`}
                placement="top"
              >
                <span
                  className="lf-bar-fill lf-bar-fill--site"
                  style={{ width: `${sitePct}%`, background: CHART_COLORS.neutral }}
                />
              </Tooltip>
            </span>

            <span className="lf-bar-value">
              <strong>{formatNumber(row.noWebsite)}</strong>
              <span className="lf-bar-value-total">
                / {formatNumber(row.total)}
              </span>
            </span>
          </div>
        );
      })}

      <div className="lf-bars-legend">
        <span className="lf-legend-inline">
          <span
            className="lf-legend-dot"
            style={{ background: CHART_COLORS.series1 }}
            aria-hidden
          />
          No website
        </span>
        <span className="lf-legend-inline">
          <span
            className="lf-legend-dot"
            style={{ background: CHART_COLORS.neutral }}
            aria-hidden
          />
          Has website
        </span>
        {hidden > 0 && (
          <span className="lf-legend-more">+{hidden} more cities</span>
        )}
      </div>
    </div>
  );
}
