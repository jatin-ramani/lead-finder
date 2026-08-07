"use client";

import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  description?: string;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Removes body padding for edge-to-edge content such as tables. */
  flush?: boolean;
}

export default function Panel({
  title,
  description,
  extra,
  children,
  className = "",
  flush = false,
}: PanelProps) {
  return (
    <section className={`lf-card ${className}`}>
      <header className="lf-card-head">
        <div className="min-w-0">
          <h2 className="lf-card-title">{title}</h2>
          {description && <p className="lf-card-desc">{description}</p>}
        </div>
        {extra && <div className="lf-card-extra">{extra}</div>}
      </header>
      <div className={flush ? "" : "lf-card-body"}>{children}</div>
    </section>
  );
}
