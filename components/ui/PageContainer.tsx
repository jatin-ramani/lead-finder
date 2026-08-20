"use client";

import React, { type ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

/**
 * Standardized page wrapper enforcing unified vertical rhythm,
 * horizontal gutters, responsive padding, and action placement.
 */
export default function PageContainer({
  children,
  actions,
  className = "",
  fullWidth = false,
}: PageContainerProps) {
  return (
    <div
      className={`lf-page-wrapper flex flex-col gap-[var(--lf-section-gap)] ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {actions && (
        <div className="lf-page-actions flex justify-end items-center mb-[-4px]">
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
