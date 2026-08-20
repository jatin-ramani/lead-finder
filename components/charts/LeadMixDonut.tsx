"use client";

import { useMemo, useState } from "react";

import { CHART_COLORS } from "@/lib/theme";
import { formatNumber } from "@/lib/format";

export interface DonutSegment {
  key: string;
  label: string;
  value: number;
  color: string;
  hint: string;
}

const SIZE = 180;
const RADIUS = 70;
const STROKE = 20;
const GAP_DEG = 3;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(startDeg: number, endDeg: number): string {
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const start = polar(cx, cy, RADIUS, endDeg);
  const end = polar(cx, cy, RADIUS, startDeg);
  const largeArc = endDeg - startDeg <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

interface LeadMixDonutProps {
  segments: DonutSegment[];
  total: number;
}

export default function LeadMixDonut({ segments, total }: LeadMixDonutProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const arcs = useMemo(() => {
    const drawable = segments.filter((segment) => segment.value > 0);
    if (total <= 0 || drawable.length === 0) return [];

    const gap = drawable.length > 1 ? GAP_DEG : 0;
    let cursor = 0;

    return drawable.map((segment) => {
      const sweep = (segment.value / total) * 360;
      const start = cursor + gap / 2;
      const end = cursor + sweep - gap / 2;
      cursor += sweep;
      return { segment, path: arcPath(start, Math.max(start + 0.01, end)) };
    });
  }, [segments, total]);

  const active = segments.find((segment) => segment.key === hovered) ?? null;
  const centreValue = active ? active.value : total;
  const centreLabel = active ? active.label : "Businesses";

  return (
    <div className="lf-donut-wrap">
      <div className="lf-donut-figure">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="lf-donut"
          role="img"
          aria-label={`Lead mix: ${segments
            .map((segment) => `${segment.label} ${segment.value}`)
            .join(", ")}`}
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--lf-track)"
            strokeWidth={STROKE}
          />
          {arcs.map(({ segment, path }) => (
            <path
              key={segment.key}
              d={path}
              fill="none"
              stroke={segment.color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              className="lf-donut-arc transition-opacity duration-150 cursor-pointer"
              opacity={hovered && hovered !== segment.key ? 0.35 : 1}
              onMouseEnter={() => setHovered(segment.key)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>

        <div className="lf-donut-centre" aria-hidden>
          <span className="lf-donut-centre-value">
            {formatNumber(centreValue)}
          </span>
          <span className="lf-donut-centre-label">{centreLabel}</span>
        </div>
      </div>

      <ul className="lf-legend">
        {segments.map((segment) => {
          const share =
            total > 0 ? Math.round((segment.value / total) * 100) : 0;

          return (
            <li
              key={segment.key}
              className={`lf-legend-row ${
                hovered === segment.key ? "is-hovered" : ""
              }`}
              onMouseEnter={() => setHovered(segment.key)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="lf-legend-left">
                <span
                  className="lf-legend-dot"
                  style={{ background: segment.color }}
                  aria-hidden
                />
                <span className="lf-legend-label" title={segment.hint || undefined}>
                  {segment.label}
                </span>
              </div>
              <div className="lf-legend-right">
                <span className="lf-legend-value">
                  {formatNumber(segment.value)}
                </span>
                <span className="lf-legend-share">{share}%</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export const DONUT_COLORS = CHART_COLORS;
