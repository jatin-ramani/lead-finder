import type { Business } from "@/types/api";

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
  "var(--lf-brand)",
  "var(--lf-info)",
  "var(--lf-success)",
];

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// `computeStats` and `uniqueValues` used to live here. Both aggregated the
// full business list in the browser, which only worked because the client held
// every row. `GET /dashboard/stats` returns the same figures computed in SQL,
// and paginated lists mean the client no longer has the data to aggregate.

export function toSelectOptions(values: string[]) {
  return values.map((value) => ({ label: value, value }));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/**
 * Parses a timestamp from the API.
 *
 * The backend writes `datetime.now(timezone.utc)` into a naive `DateTime`
 * column, so the offset is dropped on the way to the database and the JSON
 * comes back as `2026-08-07T03:58:55.597176` — a UTC instant wearing no
 * timezone designator.
 *
 * ECMAScript says a date-time string without a designator is **local** time.
 * Handing that string straight to `new Date()` therefore shifts every
 * timestamp by the viewer's UTC offset — five and a half hours in India,
 * enough to render "8 hours ago" as "14 hours ago" or push it onto the wrong
 * day. Appending `Z` when no designator is present is what keeps it honest.
 */
export function parseApiDate(value?: string | null): Date | null {
  if (!isPresent(value)) return null;

  const raw = value.trim();
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);
  const parsed = new Date(hasZone ? raw : `${raw}Z`);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** "3 hours ago". Returns null when there is no timestamp to format. */
export function formatRelativeTime(value?: string | null): string | null {
  const date = parseApiDate(value);
  if (!date) return null;

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const magnitude = Math.abs(seconds);

  if (magnitude < 45) return "just now";

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const [unit, secondsPerUnit] of RELATIVE_UNITS) {
    if (magnitude >= secondsPerUnit) {
      return formatter.format(Math.round(seconds / secondsPerUnit), unit);
    }
  }

  return "just now";
}

/** The full local date and time, for a tooltip behind the relative one. */
export function formatAbsoluteTime(value?: string | null): string | null {
  const date = parseApiDate(value);
  if (!date) return null;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** "1m 23s" — how long something took. Null unless both ends are known. */
export function formatDuration(
  from?: string | null,
  to?: string | null,
): string | null {
  const start = parseApiDate(from);
  const end = parseApiDate(to);

  if (!start || !end) return null;

  const seconds = Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));

  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return remainder === 0 ? `${minutes}m` : `${minutes}m ${remainder}s`;
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
