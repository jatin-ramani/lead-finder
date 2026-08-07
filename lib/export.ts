import { hasWebsite } from "@/lib/format";
import type { Business } from "@/types/business";

const COLUMNS: { header: string; value: (business: Business) => string }[] = [
  { header: "Name", value: (b) => b.name },
  { header: "Phone", value: (b) => b.phone ?? "" },
  { header: "Email", value: (b) => b.email ?? "" },
  { header: "Website", value: (b) => b.website ?? "" },
  { header: "Has Website", value: (b) => (hasWebsite(b) ? "Yes" : "No") },
  { header: "City", value: (b) => b.city ?? "" },
  { header: "Category", value: (b) => b.category ?? "" },
  { header: "Address", value: (b) => b.address ?? "" },
  { header: "Status", value: (b) => b.status ?? "" },
];

/**
 * Escapes a CSV field. The leading-character guard stops spreadsheet apps from
 * evaluating a scraped value like "=cmd" as a formula.
 */
function escapeCsv(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function toCsv(businesses: Business[]): string {
  const rows = [
    COLUMNS.map((column) => escapeCsv(column.header)).join(","),
    ...businesses.map((business) =>
      COLUMNS.map((column) => escapeCsv(column.value(business))).join(","),
    ),
  ];
  // BOM so Excel reads the UTF-8 accents in scraped business names correctly.
  return "﻿" + rows.join("\r\n");
}

export function exportBusinessesCsv(businesses: Business[]): void {
  const stamp = new Date().toISOString().slice(0, 10);
  const blob = new Blob([toCsv(businesses)], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `lead-finder-${stamp}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
