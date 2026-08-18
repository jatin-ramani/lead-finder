"use client";

import { App } from "antd";
import { useMutation } from "@tanstack/react-query";

import { saveBlob } from "@/lib/download";
import { businessesApi } from "@/services";
import type { BusinessQuery, ContactQualification } from "@/types/api";

/**
 * CSV export, through the backend.
 *
 * The previous frontend built the CSV in the browser from the rows it happened
 * to be holding. That cannot work against a paginated list — it would export
 * one page and call it the whole set — and it duplicated escaping rules the
 * backend already implements, including the leading-character guard that stops
 * a scraped value like `=cmd` being executed as a spreadsheet formula.
 *
 * A mutation rather than a query: it is a user-triggered action with a side
 * effect on their filesystem, it must never be cached, and it must never be
 * retried automatically.
 */
export function useExportBusinesses() {
  const { message } = App.useApp();

  /** Everything matching the current filters, not merely the visible page. */
  const exportFiltered = useMutation({
    mutationFn: (query: BusinessQuery) =>
      businessesApi.exportBusinessesCsv(query),
    onSuccess: ({ blob, filename }) => {
      saveBlob(blob, filename);
      message.success("Export downloaded");
    },
  });

  /** Only the chosen rows, with optional contact restriction. */
  const exportSelected = useMutation({
    mutationFn: ({
      ids,
      qualification,
    }: {
      ids: number[];
      qualification?: ContactQualification;
    }) => businessesApi.exportSelectedBusinessesCsv(ids, qualification),
    onSuccess: ({ blob, filename }) => {
      saveBlob(blob, filename);
      message.success("Export downloaded");
    },
  });

  return {
    exportFiltered: exportFiltered.mutate,
    exportSelected: (ids: number[], qualification?: ContactQualification) =>
      exportSelected.mutate({ ids, qualification }),
    isExporting: exportFiltered.isPending || exportSelected.isPending,
  };
}
