import { expect, test, type Page } from "@playwright/test";
import type { Business } from "@/types/api";
import { authenticatePlaywright } from "./support/auth";

const mockBusinesses: Business[] = [
  {
    id: 1,
    name: "Apex Dental Clinic",
    phone: "+91 98765 00001",
    email: "contact@apexdental.test",
    website: null,
    city: "Ahmedabad",
    category: "Dental",
    address: "101 Ashram Road",
    status: "No Website",
    lead_status: "contacted",
    lead_score: 95,
    lead_grade: "A",
    lead_score_reasons: ["No website", "Active email and phone"],
    is_favorite: true,
    tags: [
      { id: 1, name: "Hot Lead", slug: "hot-lead" },
      { id: 2, name: "Priority", slug: "priority" },
    ],
  },
  {
    id: 2,
    name: "Smile Craft Clinic",
    phone: null,
    email: "info@smilecraft.test",
    website: "https://smilecraft.test",
    city: "Ahmedabad",
    category: "Dental",
    address: "202 SG Highway",
    status: "Has Website",
    lead_status: "interested",
    lead_score: 75,
    lead_grade: "B",
    lead_score_reasons: ["Has website", "Has email"],
    is_favorite: false,
    tags: [{ id: 1, name: "Hot Lead", slug: "hot-lead" }],
  },
  {
    id: 3,
    name: "Surat Spice Villa",
    phone: "+91 98765 00003",
    email: null,
    website: "https://suratspice.test",
    city: "Surat",
    category: "Restaurant",
    address: "5 Ring Road",
    status: "Has Website",
    lead_status: "follow_up",
    lead_score: 55,
    lead_grade: "C",
    lead_score_reasons: ["Has website", "Has phone"],
    is_favorite: true,
    tags: [{ id: 2, name: "Priority", slug: "priority" }],
  },
  {
    id: 4,
    name: "Surat Diagnostic Lab",
    phone: "+91 98765 00004",
    email: null,
    website: null,
    city: "Surat",
    category: "Healthcare",
    address: "12 Majura Gate",
    status: "No Website",
    lead_status: "new",
    lead_score: 30,
    lead_grade: "D",
    lead_score_reasons: ["No website", "Missing email"],
    is_favorite: false,
    tags: [{ id: 3, name: "Enterprise", slug: "enterprise" }],
  },
  {
    id: 5,
    name: "Rajkot Mega Mart",
    phone: "+91 98765 00005",
    email: "sales@rajkotmart.test",
    website: "https://rajkotmart.test",
    city: "Rajkot",
    category: "Retail",
    address: "88 Yagnik Road",
    status: "Has Website",
    lead_status: "converted",
    lead_score: 85,
    lead_grade: "A",
    lead_score_reasons: ["Has website", "Has email and phone"],
    is_favorite: true,
    tags: [
      { id: 1, name: "Hot Lead", slug: "hot-lead" },
      { id: 2, name: "Priority", slug: "priority" },
      { id: 3, name: "Enterprise", slug: "enterprise" },
    ],
  },
  {
    id: 6,
    name: "Vadodara General Store",
    phone: null,
    email: null,
    website: null,
    city: "Vadodara",
    category: "Retail",
    address: "4 Alkapuri",
    status: "No Website",
    lead_status: "lost",
    lead_score: 10,
    lead_grade: "D",
    lead_score_reasons: ["No website", "No contact info"],
    is_favorite: false,
    tags: [],
  },
];

function filterBusinesses(url: URL): Business[] {
  return mockBusinesses.filter((b) => {
    const search = url.searchParams.get("search")?.toLowerCase();
    if (search) {
      const match =
        b.name.toLowerCase().includes(search) ||
        (b.email && b.email.toLowerCase().includes(search)) ||
        (b.phone && b.phone.toLowerCase().includes(search));
      if (!match) return false;
    }

    const city = url.searchParams.get("city");
    if (city && b.city?.toLowerCase() !== city.toLowerCase()) return false;

    const category = url.searchParams.get("category");
    if (category && b.category?.toLowerCase() !== category.toLowerCase()) return false;

    const hasWebsite = url.searchParams.get("has_website");
    if (hasWebsite === "true" && !b.website) return false;
    if (hasWebsite === "false" && b.website) return false;

    const hasEmail = url.searchParams.get("has_email");
    if (hasEmail === "true" && !b.email) return false;
    if (hasEmail === "false" && b.email) return false;

    const hasPhone = url.searchParams.get("has_phone");
    if (hasPhone === "true" && !b.phone) return false;
    if (hasPhone === "false" && b.phone) return false;

    const isFav = url.searchParams.get("is_favorite");
    if (isFav === "true" && !b.is_favorite) return false;
    if (isFav === "false" && b.is_favorite) return false;

    const leadStatus = url.searchParams.get("lead_status");
    if (leadStatus && b.lead_status !== leadStatus) return false;

    const leadGrade = url.searchParams.get("lead_grade");
    if (leadGrade && b.lead_grade !== leadGrade) return false;

    const minScore = url.searchParams.get("min_lead_score");
    if (minScore !== null && (b.lead_score ?? 0) < Number(minScore)) return false;

    const maxScore = url.searchParams.get("max_lead_score");
    if (maxScore !== null && (b.lead_score ?? 0) > Number(maxScore)) return false;

    const tags = url.searchParams.get("tags");
    if (tags) {
      const required = tags.split(",").map((t) => t.trim().toLowerCase());
      const bTags = (b.tags || []).map((t) => t.slug.toLowerCase());
      if (!required.every((req) => bTags.includes(req))) return false;
    }

    return true;
  });
}

async function mockFilterRoutes(page: Page) {
  await page.route("**/*", async (route) => {
    const request = route.request();
    const urlString = request.url();
    if (!urlString.includes("8000")) {
      await route.continue();
      return;
    }

    const url = new URL(urlString);
    const pathname = url.pathname;
    const method = request.method();

    if (pathname === "/auth/me") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          authenticated: true,
          mode: "token",
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        }),
      });
      return;
    }

    if (pathname === "/businesses/cities") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            { city: "Ahmedabad", totalBusinesses: 2, withWebsite: 1, withoutWebsite: 1, withEmail: 2, withoutEmail: 0, withPhone: 1, withoutPhone: 1, actionableLeads: 1 },
            { city: "Surat", totalBusinesses: 2, withWebsite: 1, withoutWebsite: 1, withEmail: 0, withoutEmail: 2, withPhone: 2, withoutPhone: 0, actionableLeads: 1 },
            { city: "Rajkot", totalBusinesses: 1, withWebsite: 1, withoutWebsite: 0, withEmail: 1, withoutEmail: 0, withPhone: 1, withoutPhone: 0, actionableLeads: 1 },
            { city: "Vadodara", totalBusinesses: 1, withWebsite: 0, withoutWebsite: 1, withEmail: 0, withoutEmail: 1, withPhone: 0, withoutPhone: 1, actionableLeads: 0 },
          ],
        }),
      });
      return;
    }

    if (pathname === "/tags") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            { id: 1, name: "Hot Lead", slug: "hot-lead", business_count: 3 },
            { id: 2, name: "Priority", slug: "priority", business_count: 3 },
            { id: 3, name: "Enterprise", slug: "enterprise", business_count: 2 },
          ],
        }),
      });
      return;
    }

    if (pathname === "/businesses/export/preview") {
      const body = request.postDataJSON() || {};
      const previewFilters = body.filters || {};
      const fakeUrl = new URL("http://127.0.0.1:8000/businesses");
      Object.entries(previewFilters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          fakeUrl.searchParams.set(k, String(v));
        }
      });
      const filtered = filterBusinesses(fakeUrl);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          export_count: filtered.length,
          scope: body.scope || "filtered",
        }),
      });
      return;
    }

    if (pathname === "/businesses" && method === "GET") {
      const filtered = filterBusinesses(url);
      const pageNum = Number(url.searchParams.get("page") ?? 1);
      const pageSize = Number(url.searchParams.get("pageSize") ?? 20);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: filtered,
          pagination: {
            page: pageNum,
            pageSize,
            totalItems: filtered.length,
            totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
          },
        }),
      });
      return;
    }

    await route.continue();
  });
}

test.describe("Advanced Filters System E2E Suite", () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePlaywright(page.context());
    await mockFilterRoutes(page);
    await page.goto("/businesses?view=all");
    await page.waitForLoadState("networkidle");
  });

  test("renders all primary controls and expands advanced filters panel", async ({ page, isMobile }) => {
    if (!isMobile) {
      await expect(page.getByRole("textbox", { name: "Search businesses" })).toBeVisible();
      await expect(page.getByRole("textbox", { name: "Filter by city (exact match)" })).toBeVisible();
      await expect(page.getByRole("textbox", { name: "Filter by category (exact match)" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Favorites" })).toBeVisible();

      // Click Advanced Filters toggle button
      const advBtn = page.getByRole("button", { name: /Advanced/i });
      await expect(advBtn).toBeVisible();
      await advBtn.click();

      // Verify advanced panel content
      await expect(page.locator("#lf-advanced-filters-panel")).toBeVisible();
      await expect(page.locator("#lf-advanced-filters-panel").getByText("CRM Lead Status")).toBeVisible();
      await expect(page.locator("#lf-advanced-filters-panel").getByText("Lead Grade")).toBeVisible();
      await expect(page.locator("#lf-advanced-filters-panel").getByText("Score Range")).toBeVisible();
      await expect(page.locator("#lf-advanced-filters-panel").getByText("Lead Tags")).toBeVisible();
    } else {
      await expect(page.getByRole("button", { name: /Filters/i })).toBeVisible();
    }
  });

  test("filters by Grade A and Score 80-100 combination", async ({ page, isMobile }) => {
    if (!isMobile) {
      // Open advanced panel
      await page.getByRole("button", { name: /Advanced/i }).click();

      // Select Grade A
      const gradeSelect = page.locator("#lf-advanced-filters-panel").getByLabel("Filter by lead grade");
      await gradeSelect.click();
      await page.locator(".ant-select-dropdown:visible").getByText("Grade A (80+)").click();

      // Select Score Preset Grade A (80-100)
      const scorePreset = page.locator("#lf-advanced-filters-panel").getByLabel("Score preset");
      await scorePreset.click();
      const scoreOption = page.locator(".ant-select-dropdown:visible").getByText("Grade A (80–100)");
      await expect(scoreOption).toBeVisible();
      await scoreOption.click();

      // Verify filtered results (Apex Dental Clinic & Rajkot Mega Mart)
      await expect(page).toHaveURL(/lead_grade=A/);
      await expect(page).toHaveURL(/min_lead_score=80/);
      await expect(page.getByText("Apex Dental Clinic").filter({ visible: true })).toBeVisible();
      await expect(page.getByText("Rajkot Mega Mart").filter({ visible: true })).toBeVisible();
      await expect(page.getByText("Surat Diagnostic Lab")).toBeHidden();

      // Verify active filter chips
      await expect(page.locator(".lf-filter-chip").getByText("Grade: A")).toBeVisible();
      await expect(page.locator(".lf-filter-chip").getByText("Score: 80–100")).toBeVisible();
    }
  });

  test("filters by Favorites and Contacted status combination", async ({ page, isMobile }) => {
    if (!isMobile) {
      // Toggle favorites
      await page.getByRole("button", { name: "Favorites" }).click();
      await expect(page).toHaveURL(/is_favorite=true/);

      // Open advanced and select Contacted status
      await page.getByRole("button", { name: /Advanced/i }).click();
      const statusSelect = page.locator("#lf-advanced-filters-panel .ant-select").first();
      await statusSelect.click();
      await page.locator(".ant-select-dropdown:visible .ant-select-item-option").filter({ hasText: "Contacted" }).first().click();

      await expect(page).toHaveURL(/lead_status=contacted/);
      await expect(page.getByText("Apex Dental Clinic").filter({ visible: true })).toBeVisible();
      await expect(page.getByText("Rajkot Mega Mart")).toBeHidden();

      // Verify chips
      await expect(page.locator(".lf-filter-chip").getByText("Favorites Only")).toBeVisible();
      await expect(page.locator(".lf-filter-chip").getByText("Status: Contacted")).toBeVisible();
    }
  });

  test("removes individual filter using chip close button", async ({ page, isMobile }) => {
    if (!isMobile) {
      await page.goto("/businesses?city=Ahmedabad&lead_grade=A&view=all");
      await page.waitForLoadState("networkidle");

      await expect(page.locator(".lf-filter-chip").getByText("City: Ahmedabad")).toBeVisible();
      await expect(page.locator(".lf-filter-chip").getByText("Grade: A")).toBeVisible();

      // Remove City chip
      const removeCityBtn = page.getByRole("button", { name: "Remove filter City: Ahmedabad" });
      await removeCityBtn.click();

      // URL should no longer have city=Ahmedabad but still have lead_grade=A
      await expect(page).not.toHaveURL(/city=Ahmedabad/);
      await expect(page).toHaveURL(/lead_grade=A/);
    }
  });

  test("clear all button resets all filters", async ({ page, isMobile }) => {
    if (!isMobile) {
      await page.goto("/businesses?city=Ahmedabad&has_website=true&is_favorite=true&view=all");
      await page.waitForLoadState("networkidle");

      const resetBtn = page.getByRole("button", { name: "Clear filters" }).first();
      await resetBtn.click();

      await expect(page).not.toHaveURL(/city=/);
      await expect(page).not.toHaveURL(/has_website=/);
      await expect(page).not.toHaveURL(/is_favorite=/);
    }
  });

  test("empty state displays when filters match zero leads with clear button", async ({ page }) => {
    await page.goto("/businesses?city=Ahmedabad&search=nonexistentbusinessxyz");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("No matching businesses").filter({ visible: true })).toBeVisible();
    await expect(page.getByText("No business matches the current filters.").filter({ visible: true })).toBeVisible();

    // Click clear filters from empty state
    const clearBtn = page.getByRole("button", { name: "Clear filters" }).filter({ visible: true }).first();
    await clearBtn.click();

    // After reset, user is back on discovered cities grid; clicking Ahmedabad shows businesses
    await expect(page.getByRole("heading", { name: "Discovered Cities" })).toBeVisible({ timeout: 10000 });
    await page.getByText("Ahmedabad").first().click();
    await expect(page).toHaveURL(/city=Ahmedabad/);
    await expect(page.getByText("Apex Dental Clinic").filter({ visible: true }).first()).toBeVisible();
  });

  test("active filters flow into Export Modal preview", async ({ page, isMobile }) => {
    if (!isMobile) {
      await page.goto("/businesses?city=Ahmedabad&has_website=false&view=all");
      await page.waitForLoadState("networkidle");

      const exportBtn = page.getByRole("button", { name: /Export/i }).filter({ visible: true }).first();
      await exportBtn.click();

      const modal = page.locator(".ant-modal");
      await expect(modal).toBeVisible();
      await expect(modal.getByText("Export businesses", { exact: true })).toBeVisible();
      // Preview should calculate 1 matching business (Apex Dental Clinic)
      await expect(modal.getByText(/1 business(es)? match/i)).toBeVisible({ timeout: 10000 });
    }
  });

  test("mobile filter drawer supports setting and resetting filters", async ({ page, isMobile }) => {
    if (isMobile) {
      const filtersTrigger = page.getByRole("button", { name: /Filters/i });
      await filtersTrigger.click();

      const drawer = page.locator(".lf-filter-drawer");
      await expect(drawer).toBeVisible();

      // Check Favorites checkbox in drawer
      const favCheckbox = drawer.locator("fieldset").filter({ hasText: "Favorites" }).getByRole("checkbox");
      await favCheckbox.click();

      // Click Show results
      await drawer.getByRole("button", { name: "Show results" }).click();

      await expect(page).toHaveURL(/is_favorite=true/);
    }
  });
});
