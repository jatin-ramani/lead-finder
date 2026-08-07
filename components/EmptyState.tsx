"use client";

import { Button } from "antd";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title?: string;
  description?: ReactNode;
  action?: { label: string; onClick: () => void; icon?: ReactNode };
  secondaryAction?: { label: string; onClick: () => void };
  compact?: boolean;
}

/** Hand-drawn SVG so the illustration inherits the active theme colours. */
function Illustration() {
  return (
    <svg
      viewBox="0 0 200 140"
      width="180"
      height="126"
      role="presentation"
      className="lf-empty-illustration"
    >
      <defs>
        <linearGradient id="lf-empty-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="124" rx="66" ry="8" fill="currentColor" opacity="0.08" />

      {/* Skyline of buildings — the "businesses" that have not been found yet */}
      <g stroke="currentColor" strokeWidth="2" fill="url(#lf-empty-fade)" opacity="0.55">
        <rect x="42" y="66" width="30" height="52" rx="3" />
        <rect x="78" y="48" width="34" height="70" rx="3" />
        <rect x="118" y="74" width="28" height="44" rx="3" />
      </g>

      <g fill="currentColor" opacity="0.28">
        <rect x="49" y="74" width="6" height="6" rx="1" />
        <rect x="60" y="74" width="6" height="6" rx="1" />
        <rect x="49" y="87" width="6" height="6" rx="1" />
        <rect x="60" y="87" width="6" height="6" rx="1" />
        <rect x="86" y="58" width="7" height="7" rx="1" />
        <rect x="98" y="58" width="7" height="7" rx="1" />
        <rect x="86" y="73" width="7" height="7" rx="1" />
        <rect x="98" y="73" width="7" height="7" rx="1" />
        <rect x="125" y="83" width="6" height="6" rx="1" />
        <rect x="135" y="83" width="6" height="6" rx="1" />
      </g>

      {/* Magnifying glass */}
      <g
        stroke="var(--lf-accent)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        opacity="0.9"
      >
        <circle cx="128" cy="46" r="24" fill="var(--lf-accent)" fillOpacity="0.1" />
        <path d="M146 64 L162 80" />
      </g>
      <circle cx="120" cy="38" r="6" fill="#ffffff" opacity="0.25" />
    </svg>
  );
}

export default function EmptyState({
  title = "No Businesses Found",
  description = "Nothing matches this view yet. Adjust the filters, or run a scan to pull fresh businesses into your workspace.",
  action,
  secondaryAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={`lf-empty ${compact ? "lf-empty--compact" : ""}`}>
      <Illustration />
      <h3 className="lf-empty-title">{title}</h3>
      <p className="lf-empty-description">{description}</p>

      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {action && (
            <Button type="primary" icon={action.icon} onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
