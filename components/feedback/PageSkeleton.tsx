"use client";

import { Skeleton } from "antd";

interface PageSkeletonProps {
  /** How many panel placeholders to draw. */
  panels?: number;
}

/**
 * Route-level loading UI.
 *
 * Mirrors the page frame — a header block and a panel grid — rather than
 * showing a centred spinner, so the layout does not jump when the real content
 * arrives. `aria-busy` plus a polite live region tells a screen reader that
 * something is happening without narrating every skeleton line.
 */
export default function PageSkeleton({ panels = 2 }: PageSkeletonProps) {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-live="polite">
      <span className="lf-visually-hidden">Loading page content</span>

      <div className="lf-grid-2">
        {Array.from({ length: panels }, (_, index) => (
          <div key={index} className="lf-panel lf-panel--skeleton">
            <Skeleton
              active
              title={{ width: "42%" }}
              paragraph={{ rows: 4, width: ["85%", "70%", "78%", "55%"] }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
