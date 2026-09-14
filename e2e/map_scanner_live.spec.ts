import { expect, test, type Locator, type Page } from "@playwright/test";

import type { Business, Tag } from "@/types/api";

import { authenticatePlaywright } from "./support/auth";

const priorityTag: Tag = { id: 1, name: "Priority", slug: "priority" };
const nurtureTag: Tag = { id: 2, name: "Nurture", slug: "nurture" };

const fullyQualifiedLead: Business = {
  id: 1,
  name: "Saffron Street Kitchen",
  city: "Ahmedabad",
  category: "catering",
  phone: "+91 98765 43210",
  email: "hi@saffron.example",
  address: "Satellite, Ahmedabad",
  status: "No Website",
  website: null,
  lead_status: "new",
  lead_grade: "A",
  lead_score: 95,
  is_favorite: true,
  tags: [priorityTag],
  latitude: 23.028,
  longitude: 72.512,
};

/**
 * Each near-match differs from the fully qualified lead in one server filter.
 * That makes the final single-result assertion prove the complete map contract
 * rather than merely asserting that the client put query parameters in a URL.
 */
const mapLeads: Business[] = [
  fullyQualifiedLead,
  {
    ...fullyQualifiedLead,
    id: 2,
    name: "Mumbai Saffron Kitchen",
    city: "Mumbai",
    address: "Bandra, Mumbai",
    latitude: 19.0596,
    longitude: 72.8295,
  },
  {
    ...fullyQualifiedLead,
    id: 3,
    name: "Ahmedabad Event Venue",
    category: "events",
    latitude: 23.031,
    longitude: 72.571,
  },
  {
    ...fullyQualifiedLead,
    id: 4,
    name: "No Email Catering",
    email: null,
    latitude: 23.035,
    longitude: 72.587,
  },
  {
    ...fullyQualifiedLead,
    id: 5,
    name: "No Phone Catering",
    phone: null,
    latitude: 23.037,
    longitude: 72.59,
  },
  {
    ...fullyQualifiedLead,
    id: 6,
    name: "Grade B Catering",
    lead_grade: "B",
    latitude: 23.04,
    longitude: 72.595,
  },
  {
    ...fullyQualifiedLead,
    id: 7,
    name: "Lower Score Catering",
    lead_score: 79,
    latitude: 23.041,
    longitude: 72.599,
  },
  {
    ...fullyQualifiedLead,
    id: 8,
    name: "Contacted Catering",
    lead_status: "contacted",
    latitude: 23.025,
    longitude: 72.518,
  },
  {
    ...fullyQualifiedLead,
    id: 9,
    name: "Not Favorite Catering",
    is_favorite: false,
    latitude: 23.023,
    longitude: 72.516,
  },
  {
    ...fullyQualifiedLead,
    id: 10,
    name: "Nurture Catering",
    tags: [nurtureTag],
    latitude: 23.022,
    longitude: 72.514,
  },
  {
    ...fullyQualifiedLead,
    id: 11,
    name: "Website Catering",
    status: "Has Website",
    website: "https://royalpalace.example",
    latitude: 23.02,
    longitude: 72.51,
  },
  {
    ...fullyQualifiedLead,
    id: 12,
    name: "Awaiting Geocode Catering",
    address: "Ahmedabad",
    latitude: null,
    longitude: null,
  },
];

function apiPath(urlString: string): string {
  const pathname = new URL(urlString).pathname;
  return pathname.startsWith("/api/") ? pathname.replace(/^\/api/, "") : pathname;
}

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function hasValidCoordinates(business: Business): boolean {
  return business.latitude != null
    && business.longitude != null
    && Number.isFinite(business.latitude)
    && Number.isFinite(business.longitude)
    && business.latitude >= -90
    && business.latitude <= 90
    && business.longitude >= -180
    && business.longitude <= 180;
}

function filterMapLeads(leads: Business[], url: URL): Business[] {
  const search = url.searchParams.get("search")?.trim().toLowerCase();
  const city = url.searchParams.get("city");
  const category = url.searchParams.get("category");
  const leadStatus = url.searchParams.get("lead_status")?.toLowerCase();
  const leadGrade = url.searchParams.get("lead_grade")?.toUpperCase();
  const minimumScore = url.searchParams.get("min_lead_score");
  const maximumScore = url.searchParams.get("max_lead_score");
  const requestedTags = url.searchParams
    .get("tags")
    ?.split(",")
    .map((tag) => tag.trim())
    .filter(Boolean) ?? [];

  return leads.filter((lead) => {
    if (search) {
      const searchable = [lead.name, lead.phone, lead.email, lead.website]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(search));
      if (!searchable) return false;
    }

    // These comparisons intentionally mirror backend/database/crud.py.
    if (city && lead.city !== city) return false;
    if (category && lead.category !== category) return false;

    const qualificationFilters: Array<[string, boolean]> = [
      ["has_website", hasText(lead.website)],
      ["has_email", hasText(lead.email)],
      ["has_phone", hasText(lead.phone)],
      ["is_favorite", Boolean(lead.is_favorite)],
    ];
    for (const [parameter, actual] of qualificationFilters) {
      const expected = url.searchParams.get(parameter);
      if (expected !== null && actual !== (expected === "true")) return false;
    }

    if (leadStatus && lead.lead_status !== leadStatus) return false;
    if (leadGrade && lead.lead_grade !== leadGrade) return false;
    if (minimumScore !== null && (lead.lead_score ?? 0) < Number(minimumScore)) return false;
    if (maximumScore !== null && (lead.lead_score ?? 0) > Number(maximumScore)) return false;

    return requestedTags.every((token) => {
      const normalizedSlug = token.toLowerCase().replaceAll(" ", "-");
      return (lead.tags ?? []).some((tag) =>
        tag.slug === normalizedSlug
        || tag.name.toLowerCase() === token.toLowerCase()
        || String(tag.id) === token,
      );
    });
  });
}

function citySummaries(leads: Business[]) {
  return Array.from(leads.reduce((byCity, lead) => {
    const city = lead.city ?? "Unknown";
    byCity.set(city, (byCity.get(city) ?? 0) + 1);
    return byCity;
  }, new Map<string, number>())).map(([city, totalBusinesses]) => ({
    city,
    totalBusinesses,
    enrichedCount: totalBusinesses,
    averageRating: 4.5,
  }));
}

function tagOptions(leads: Business[]): Tag[] {
  return Array.from(new Map(
    leads.flatMap((lead) => lead.tags ?? []).map((tag) => [tag.id, tag]),
  ).values());
}

async function openSelectByPlaceholder(scope: Page | Locator, placeholder: string): Promise<void> {
  const select = scope.locator(".ant-select").filter({ hasText: placeholder });
  await expect(select).toHaveCount(1);
  await select.getByRole("combobox").click();
}

async function selectVisibleOption(page: Page, text: string): Promise<void> {
  const option = page.getByText(text, { exact: true }).last();
  await expect(option).toBeVisible();
  await option.click();
}

function scannerDetail(status: "Running" | "Paused" | "Completed" | "Failed" = "Running") {
  return {
    id: 501,
    city: "Ahmedabad",
    category: "catering",
    status,
    progress: status === "Completed" ? 100 : 60,
    coverage_progress: status === "Completed" ? 100 : 60,
    total_cells: 4,
    completed_cells: status === "Completed" ? 4 : 2,
    current_cell: "Zone 3: North-East (4.2km)",
    businesses_found: 45,
    businesses_stored: 30,
    businesses_skipped_no_contact: 5,
    businesses_duplicates: 10,
    center_latitude: 23.0225,
    center_longitude: 72.5714,
    scan_radius_km: 15,
    cells: [
      { cell_index: 0, latitude: 23.0225, longitude: 72.5714, radius_meters: 3000, label: "Center (0.0km)", status: "completed", results_count: 25, stored_count: 18 },
      { cell_index: 1, latitude: 23.045, longitude: 72.5714, radius_meters: 3000, label: "North (2.5km)", status: "completed", results_count: 20, stored_count: 12 },
      { cell_index: 2, latitude: 23.035, longitude: 72.6, radius_meters: 3000, label: "Zone 3: North-East (4.2km)", status: status === "Running" ? "running" : status === "Failed" ? "failed" : "pending", results_count: 0, stored_count: 0 },
      { cell_index: 3, latitude: 23.01, longitude: 72.54, radius_meters: 3000, label: "South-West (3.7km)", status: "pending", results_count: 0, stored_count: 0 },
    ],
    recent_leads: [
      { id: 101, name: "Ahmedabad Gourmet Hub", city: "Ahmedabad", category: "catering", phone: "+91 99887 76655", has_email: true, has_phone: true, has_website: false, latitude: 23.024, longitude: 72.573, lead_grade: "A", lead_score: 91 },
      { id: 102, name: "Grand Horizon Banquets", city: "Ahmedabad", category: "catering", phone: "+91 99887 76656", has_email: false, has_phone: true, has_website: true, latitude: 23.046, longitude: 72.572, lead_grade: "B", lead_score: 79 },
    ],
  };
}

async function mockApi(page: Page, options?: { leads?: Business[]; scanStatus?: "Running" | "Paused" | "Completed" | "Failed" }) {
  const leads = options?.leads ?? mapLeads;
  const scan = scannerDetail(options?.scanStatus);

  await page.route("**/*", async (route) => {
    const request = route.request();
    const pathname = apiPath(request.url());
    const method = request.method();

    if (pathname === "/auth/me") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ authenticated: true, role: "admin" }) });
      return;
    }
    if (pathname === "/businesses/cities") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: citySummaries(leads) }) });
      return;
    }
    if (pathname === "/tags") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: tagOptions(leads) }) });
      return;
    }
    if (pathname === "/businesses/map") {
      const filtered = filterMapLeads(leads, new URL(request.url()));
      const located = filtered.filter(hasValidCoordinates).sort((left, right) => right.id - left.id);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: located, totalItems: filtered.length, locatedItems: located.length, unlocatedItems: filtered.length - located.length }) });
      return;
    }
    if (pathname === "/scan/jobs" && method === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([{ id: scan.id, city: scan.city, category: scan.category, status: scan.status, progress: scan.progress, total_cells: scan.total_cells, completed_cells: scan.completed_cells }]) });
      return;
    }
    if (pathname === "/scan/jobs/latest") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(scan) });
      return;
    }
    if (pathname === "/scan/jobs/501") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(scan) });
      return;
    }
    if (pathname === "/businesses/101" && method === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ...mapLeads[0], id: 101, name: "Ahmedabad Gourmet Hub", phone: "+91 99887 76655", email: "gourmet@example.test", lead_score: 91 }) });
      return;
    }
    if (pathname.match(/^\/businesses\/\d+\/notes$/)) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: [], total: 0 }) });
      return;
    }
    if (pathname.match(/^\/businesses\/\d+\/activities/)) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, items: [], total: 0, page: 1, page_size: 20, total_pages: 0 }) });
      return;
    }
    if (pathname.match(/^\/businesses\/\d+\/follow-ups/)) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, items: [], total: 0, page: 1, page_size: 20, total_pages: 0 }) });
      return;
    }
    if (pathname.match(/^\/businesses\/\d+\/website-data/)) {
      await route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ detail: "No website data" }) });
      return;
    }

    await route.continue();
  });
}

test.describe("Lead Map & Live Geographic Scanner Suite", () => {
  test.beforeEach(async ({ context }) => {
    await authenticatePlaywright(context);
  });

  test("map applies the server contract, keeps City View and Fit controls separate, and opens the existing business drawer", async ({ page }) => {
    await mockApi(page);
    await page.goto("/map");

    const map = page.locator(".leaflet-container");
    const fitVisibleLeads = page.getByRole("button", { name: "Fit visible leads" });
    const centerOnCityScan = page.getByRole("button", { name: "Center on verified scan data" });
    await expect(page.getByRole("heading", { name: "Lead Map" })).toBeVisible();
    await expect(map).toBeVisible();
    await expect(fitVisibleLeads).toBeEnabled();
    await expect(centerOnCityScan).toBeEnabled();
    expect(await fitVisibleLeads.getAttribute("aria-label")).not.toEqual(await centerOnCityScan.getAttribute("aria-label"));
    await centerOnCityScan.click();
    await expect(map).toBeVisible();
    await fitVisibleLeads.click();
    await expect(map).toBeVisible();

    const compactFilters = page.getByRole("button", { name: /Filters$/ });
    const filtersAreInDrawer = await compactFilters.isVisible();
    if (filtersAreInDrawer) await compactFilters.click();
    const filterScope: Page | Locator = filtersAreInDrawer
      ? page.getByRole("dialog", { name: "Map filters" })
      : page;

    const hasWebsiteResponse = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return apiPath(response.url()) === "/businesses/map" && url.searchParams.get("has_website") === "true";
    });
    await filterScope.getByRole("checkbox", { name: "Has website" }).check();
    const hasWebsitePayload = await hasWebsiteResponse.then((response) => response.json()) as { data: Business[]; totalItems: number };
    expect(hasWebsitePayload.totalItems).toBe(1);
    expect(hasWebsitePayload.data.map((lead) => lead.id)).toEqual([11]);
    await filterScope.getByRole("checkbox", { name: "Has website" }).uncheck();

    await filterScope.getByRole("checkbox", { name: "No website" }).check();
    await filterScope.getByRole("checkbox", { name: "Has email" }).check();
    const combinedQualificationResponse = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return apiPath(response.url()) === "/businesses/map"
        && url.searchParams.get("has_website") === "false"
        && url.searchParams.get("has_email") === "true"
        && url.searchParams.get("has_phone") === "true";
    });
    await filterScope.getByRole("checkbox", { name: "Has phone" }).check();
    const qualificationPayload = await combinedQualificationResponse.then((response) => response.json()) as { data: Business[] };
    expect(qualificationPayload.data).not.toHaveLength(0);
    expect(qualificationPayload.data.every((lead) => !hasText(lead.website) && hasText(lead.email) && hasText(lead.phone))).toBe(true);

    const ahmedabadCount = mapLeads.filter((lead) => lead.city === "Ahmedabad").length;
    const coverageRequest = page.waitForResponse((response) => apiPath(response.url()) === "/scan/jobs/501");
    await filterScope.getByRole("combobox", { name: "City filter" }).click();
    await page.getByText(`Ahmedabad (${ahmedabadCount})`, { exact: true }).last().click();
    await coverageRequest;
    const mapCoverage = page.getByTestId("map-scan-coverage");
    await expect(mapCoverage).toContainText("Scanner coverage: Ahmedabad");
    await expect(mapCoverage.getByLabel("Scanner cell state legend")).toContainText("Current");
    await expect(mapCoverage.getByLabel("Scanner cell state legend")).toContainText("Completed");

    await filterScope.locator('input[placeholder="Exact category"]').fill("catering");
    await openSelectByPlaceholder(filterScope, "All grades");
    await selectVisibleOption(page, "Grade A");
    await openSelectByPlaceholder(filterScope, "All statuses");
    await selectVisibleOption(page, "New");
    await filterScope.locator('input[placeholder="Min score"]').fill("90");
    await openSelectByPlaceholder(filterScope, "Filter by tags");
    await selectVisibleOption(page, "Priority");

    const completeFilterResponse = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return apiPath(response.url()) === "/businesses/map"
        && url.searchParams.get("city") === "Ahmedabad"
        && url.searchParams.get("category") === "catering"
        && url.searchParams.get("has_website") === "false"
        && url.searchParams.get("has_email") === "true"
        && url.searchParams.get("has_phone") === "true"
        && url.searchParams.get("lead_grade") === "A"
        && url.searchParams.get("lead_status") === "new"
        && url.searchParams.get("min_lead_score") === "90"
        && url.searchParams.get("tags") === "priority"
        && url.searchParams.get("is_favorite") === "true";
    });
    await filterScope.getByRole("checkbox", { name: "Favorites" }).check();
    const completeFilterPayload = await completeFilterResponse.then((response) => response.json()) as {
      success: boolean;
      data: Business[];
      totalItems: number;
      locatedItems: number;
      unlocatedItems: number;
    };
    expect(completeFilterPayload).toMatchObject({ success: true, totalItems: 2, locatedItems: 1, unlocatedItems: 1 });
    expect(completeFilterPayload.data.map((lead) => lead.id)).toEqual([fullyQualifiedLead.id]);
    await expect(page.locator(".lf-map-lead-pin-wrap")).toHaveCount(1);

    if (filtersAreInDrawer) {
      await page.getByRole("button", { name: "Show map" }).click();
      await expect(page.getByRole("dialog", { name: "Map filters" })).toBeHidden();
    }

    const leadPin = page.locator(".lf-map-lead-pin-wrap").first();
    await leadPin.click();
    await expect(page.getByRole("button", { name: "Open lead details" })).toBeVisible();
    await page.getByRole("button", { name: "Open lead details" }).click();
    await expect(page.getByRole("dialog", { name: "Business details" })).toBeVisible();
  });
  test("map clusters a large real-coordinate result set instead of rendering every pin", async ({ page }) => {
    const clusteredLeads = Array.from({ length: 10_000 }, (_, index) => ({
      ...mapLeads[0],
      id: index + 10_000,
      name: `Clustered lead ${index + 1}`,
      latitude: 23.0338,
      longitude: 72.585,
    }));
    await mockApi(page, { leads: clusteredLeads });
    await page.goto("/map");

    await expect(page.locator(".lf-map-cluster-pin")).toBeVisible();
    expect(await page.locator(".lf-map-lead-pin-wrap").count()).toBeLessThan(25);
    await expect(page.locator(".lf-map-cluster")).toHaveText("10000");
  });

  test("scanner renders actual cells, clusters discovered leads, and opens canonical lead details", async ({ page }) => {
    await mockApi(page);
    await page.goto("/scanner");

    await expect(page.getByRole("heading", { name: "Lead Scanner" })).toBeVisible();
    await expect(page.getByText("Continuous Scanner Monitor")).toBeVisible();
    const scannerMap = page.locator(".leaflet-container");
    const zoomIn = page.getByRole("button", { name: "Zoom in scanner map" });
    const zoomOut = page.getByRole("button", { name: "Zoom out scanner map" });
    await expect(scannerMap).toBeVisible({ timeout: 20_000 });
    await expect(zoomIn).toBeVisible();
    await expect(zoomOut).toBeVisible();
    await zoomIn.focus();
    await expect(zoomIn).toBeFocused();
    await zoomIn.press("Enter");
    await zoomOut.focus();
    await expect(zoomOut).toBeFocused();
    await zoomOut.press("Enter");
    await expect(page.getByLabel("Scan cell state legend")).toContainText("Running");
    await expect(page.getByText("Cell 2 / 4")).toBeVisible();
    await expect(page.locator(".lf-scan-cell-current")).toBeVisible();

    const leadPin = page.locator(".lf-scan-marker-pin").first();
    await expect(leadPin).toBeVisible();
    await leadPin.click();
    await expect(page.getByText("Phone: +91 99887 76655")).toBeVisible();
    await page.getByRole("button", { name: "Open Lead Details" }).click();
    await expect(page.getByRole("heading", { name: "Ahmedabad Gourmet Hub" })).toBeVisible();
  });

  test("map filters and scanner stay usable at 375px, 390px, and 414px", async ({ page }) => {
    await mockApi(page);

    for (const width of [375, 390, 414]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/map");
      await expect(page.getByRole("heading", { name: "Lead Map" })).toBeVisible();
      await page.getByRole("button", { name: /Filters$/ }).click();
      await expect(page.getByText("Map filters", { exact: true })).toBeVisible();
      await page.keyboard.press("Escape");
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), { message: `No horizontal overflow on map at ${width}px` }).toBe(true);

      await page.goto("/scanner");
      await expect(page.getByRole("heading", { name: "Lead Scanner" })).toBeVisible();
      await expect(page.getByLabel("Scan cell state legend")).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), { message: `No horizontal overflow on scanner at ${width}px` }).toBe(true);
    }
  });
});