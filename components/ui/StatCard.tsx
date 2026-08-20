"use client";

import React, { type ReactNode } from "react";
import { Skeleton, Tooltip } from "antd";

interface StatCardProps {
  label: string;
  value: string | number | ReactNode;
  hint?: string;
  accent?: boolean;
  success?: boolean;
  warning?: boolean;
  error?: boolean;
  info?: boolean;
  icon?: ReactNode;
  change?: string | ReactNode;
  isLoading?: boolean;
  className?: string;
}

/**
 * Standardized KPI / metric card component with consistent typography,
 * padding, tabular numerals, and status highlights.
 */
export default function StatCard({
  label,
  value,
  hint,
  accent = false,
  success = false,
  warning = false,
  error = false,
  info = false,
  icon,
  change,
  isLoading = false,
  className = "",
}: StatCardProps) {
  let valueColorClass = "text-[var(--lf-text)]";
  if (accent) valueColorClass = "text-[var(--lf-brand)]";
  else if (success) valueColorClass = "text-[var(--lf-success)]";
  else if (warning) valueColorClass = "text-[var(--lf-warning)]";
  else if (error) valueColorClass = "text-[var(--lf-error)]";
  else if (info) valueColorClass = "text-[var(--lf-info)]";

  return (
    <div className={`lf-scan-stat ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="lf-scan-stat-label">{label}</span>
        {icon && <div className="text-[var(--lf-text-muted)] shrink-0">{icon}</div>}
      </div>

      <div className="my-1.5">
        {isLoading ? (
          <Skeleton.Input active size="small" className="!w-24 !h-7" />
        ) : (
          <div className={`lf-scan-stat-value ${valueColorClass}`}>
            {value}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 min-h-[16px]">
        {hint && (
          <Tooltip title={hint}>
            <span className="lf-scan-stat-hint">{hint}</span>
          </Tooltip>
        )}
        {change && (
          <span className="text-[11px] font-semibold">{change}</span>
        )}
      </div>
    </div>
  );
}
