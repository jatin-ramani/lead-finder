"use client";

import React, { type ReactNode } from "react";

interface CardProps {
  title?: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
}

/**
 * Standardized Card primitive unifying header padding, typography,
 * border radius, surface elevations, and dark/light mode consistency.
 */
export default function Card({
  title,
  description,
  extra,
  footer,
  children,
  className = "",
  bodyClassName = "",
  noPadding = false,
  bordered = true,
  hoverable = false,
  onClick,
}: CardProps) {
  const hasHeader = Boolean(title || description || extra);

  return (
    <div
      className={`lf-card ${bordered ? "" : "border-0"} ${
        hoverable ? "cursor-pointer transition-all hover:border-[var(--lf-brand)] hover:shadow-[var(--lf-shadow-sm)]" : ""
      } ${className}`}
      onClick={onClick}
    >
      {hasHeader && (
        <div className="lf-card-head">
          <div className="min-w-0 flex-1">
            {typeof title === "string" ? (
              <h3 className="lf-card-title">{title}</h3>
            ) : (
              title
            )}
            {description && (
              <p className="lf-card-desc">{description}</p>
            )}
          </div>
          {extra && <div className="lf-card-extra shrink-0">{extra}</div>}
        </div>
      )}

      <div
        className={`lf-card-body ${noPadding ? "!p-0" : ""} ${bodyClassName}`}
      >
        {children}
      </div>

      {footer && (
        <div className="lf-card-footer px-5 py-3.5 border-t border-[var(--lf-border-subtle)] bg-[var(--lf-subtle)]">
          {footer}
        </div>
      )}
    </div>
  );
}
