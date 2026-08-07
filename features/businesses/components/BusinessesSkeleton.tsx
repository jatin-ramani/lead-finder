"use client";

import { Skeleton } from "antd";

/**
 * The frame of the businesses page, before hydration.
 *
 * `useUrlFilters` reads the search params, which suspends during the static
 * render, so something has to stand in until React takes over on the client.
 * That moment is brief but it is the first thing anyone sees, and an empty box
 * would be a flash of blank followed by a layout jump.
 *
 * This is the *frame* — filter bar and table outline. The table's own skeleton,
 * which mirrors the real column widths, takes over once the query starts. Both
 * use the same Ant Design `Skeleton` primitive, so it reads as one continuous
 * loading state rather than two different ones.
 */
export default function BusinessesSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      <span className="lf-visually-hidden">Loading businesses</span>

      <div className="lf-filter-card">
        <div className="flex flex-wrap items-center gap-3">
          {[110, 240, 150, 150, 150, 92, 132].map((width, index) => (
            <Skeleton.Button
              key={index}
              active
              size="default"
              style={{ width, height: 38, borderRadius: 10 }}
            />
          ))}
        </div>
      </div>

      <div className="lf-table-card lf-table-card--pending">
        <Skeleton
          active
          title={false}
          paragraph={{
            rows: 8,
            width: ["100%", "94%", "97%", "91%", "96%", "89%", "95%", "92%"],
          }}
        />
      </div>
    </div>
  );
}
