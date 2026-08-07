import type { Business, BusinessStats } from "@/types/business";

/** Treats empty strings, "null" and "-" as missing, which the scraper does emit. */
export function isPresent(value?: string | null): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed !== "" && trimmed !== "-" && trimmed.toLowerCase() !== "null";
}

export function hasWebsite(business: Business): boolean {
  return isPresent(business.website);
}

/** Prefixes bare domains so `<a href>` does not resolve them as a relative path. */
export function toAbsoluteUrl(website?: string | null): string | null {
  if (!isPresent(website)) return null;
  const value = website.trim();
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

/** Strips protocol and trailing slash for a compact table cell. */
export function toDisplayUrl(website?: string | null): string {
  if (!isPresent(website)) return "";
  return website.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export function toMapsUrl(business: Business): string {
  const query = [business.name, business.address, business.city]
    .filter(isPresent)
    .join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * The scraper stores multi-line listings as one field, e.g.
 * "+91 79 2676 5592;+91 79 2676 5591". Split them so a dial link targets a
 * single number instead of concatenating both into an unreachable one.
 */
export function splitPhones(phone?: string | null): string[] {
  if (!isPresent(phone)) return [];
  return phone
    .split(/[;,/]|\s{2,}/)
    .map((part) => part.trim())
    .filter((part) => part !== "");
}

export function primaryPhone(phone?: string | null): string | null {
  return splitPhones(phone)[0] ?? null;
}

export function toTelHref(phone: string): string {
  const first = splitPhones(phone)[0] ?? phone;
  return `tel:${first.replace(/[^\d+]/g, "")}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0] ?? "").join("").toUpperCase() || "?";
}

/**
 * Deterministic accent per business so avatars stay stable across renders.
 * All steps are light enough to carry the dark ink the avatar chips use.
 */
const AVATAR_COLORS = [
  "#E5B93C",
  "#7DD3FC",
  "#C4B5FD",
  "#F9A8D4",
  "#FDBA74",
  "#5EEAD4",
  "#A5B4FC",
];

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function computeStats(
  businesses: Business[],
  todayScan: number,
): BusinessStats {
  let noWebsite = 0;
  let emails = 0;
  let phones = 0;

  for (const business of businesses) {
    if (!hasWebsite(business)) noWebsite += 1;
    if (isPresent(business.email)) emails += 1;
    if (isPresent(business.phone)) phones += 1;
  }

  return {
    total: businesses.length,
    noWebsite,
    hasWebsite: businesses.length - noWebsite,
    emails,
    phones,
    todayScan,
  };
}

/** Unique, sorted, non-empty values for a field — powers the filter dropdowns. */
export function uniqueValues(
  businesses: Business[],
  key: keyof Business,
): string[] {
  const set = new Set<string>();
  for (const business of businesses) {
    const value = business[key];
    if (typeof value === "string" && isPresent(value)) {
      set.add(value.trim());
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function toSelectOptions(values: string[]) {
  return values.map((value) => ({ label: value, value }));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatTime(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
