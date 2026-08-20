"use client";

import React, { type ReactNode } from "react";
import { Table, type TableProps } from "antd";

interface DataTableProps<T extends object = Record<string, unknown>>
  extends TableProps<T> {
  cardTitle?: ReactNode;
  cardDescription?: ReactNode;
  cardExtra?: ReactNode;
  wrapperClassName?: string;
  isPending?: boolean;
}

/**
 * Standardized data-table wrapper enforcing strict dark-mode surface inheritance,
 * header hierarchy, cell alignments, hover states, and loading states.
 */
export default function DataTable<T extends object = Record<string, unknown>>({
  cardTitle,
  cardDescription,
  cardExtra,
  wrapperClassName = "",
  isPending = false,
  className = "",
  ...tableProps
}: DataTableProps<T>) {
  const hasHeader = Boolean(cardTitle || cardDescription || cardExtra);

  return (
    <div
      className={`lf-table-card ${
        isPending ? "lf-table-card--pending" : ""
      } ${wrapperClassName}`}
    >
      {hasHeader && (
        <div className="lf-card-head pb-4 border-b border-[var(--lf-border-subtle)]">
          <div className="min-w-0 flex-1">
            {typeof cardTitle === "string" ? (
              <h3 className="lf-card-title">{cardTitle}</h3>
            ) : (
              cardTitle
            )}
            {cardDescription && (
              <p className="lf-card-desc">{cardDescription}</p>
            )}
          </div>
          {cardExtra && <div className="shrink-0">{cardExtra}</div>}
        </div>
      )}

      <Table<T>
        className={`lf-data-table ${className}`}
        {...tableProps}
      />
    </div>
  );
}
