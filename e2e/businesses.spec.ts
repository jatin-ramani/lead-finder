import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { authenticatePlaywright } from "./support/auth";

const mockCities = [
  {
    city: "Ahmedabad",
    totalBusinesses: 1,
    withWebsite: 0,
    withoutWebsite: 1,
    withEmail: 1,
    withoutEmail: 0,
    withPhone: 1,
    withoutPhone: 0,
    actionableLeads: 1,
  },
  {
    city: "Surat",
    totalBusinesses: 1,
    withWebsite: 1,
    withoutWebsite: 0,
    withEmail: 1,
    withoutEmail: 0,
    withPhone: 0,
    withoutPhone: 1,
    actionableLeads: 0,
  },
];

const businesses = [
  { id: 1, name: "Alpha Dental", phone: "111", email: "alpha@example.com", website: null, city: "Ahmedabad", category: "Dental", address: "A", status: "No Website" },
  { id: 2, name: "Beta Foods", phone: null, email: "beta@example.com", website: "https://beta.test", city: "Surat", category: "Food", address: "B", status: "Has Website" },
];

async function mockWorkspace(page: Page) {
  await page.route("**/*", async (route) => {
    const request = route.request();
    const urlString = request.url();
    if (!urlString.includes("8000")) {
      await route.continue();
      return;
    }
    const url = new URL(urlString);
    if (url.pathname === "/auth/me") return route.fulfill({ status: 200, contentType: "application/json", json: { authenticated: true } });
    if (url.pathname === "/businesses/cities") {
      return route.fulfill({ status: 200, contentType: "application/json", json: { success: true, data: mockCities } });
    }
    if (url.pathname === "/businesses/export/preview") {
      const payload = request.postDataJSON();
      const total = payload?.scope === "selected" ? payload?.business_ids?.length ?? 0 : 2;
      return route.fulfill({ status: 200, contentType: "application/json", json: { success: true, total_selected: total, matching_qualification: 1, export_count: 1 } });
    }
    if (url.pathname === "/businesses/export/csv") {
      return route.fulfill({ status: 200, headers: { "content-type": "text/csv", "content-disposition": 'attachment; filename="businesses.csv"', "access-control-expose-headers": "Content-Disposition" }, body: "\uFEFFID,Name,Phone,Email,Website,City,Category,Address,Status\r\n1,'=SUM(1+1) Caf\u00e9,+91 98765 43210,alpha@example.com,,Ahmedabad,Dental,A,No Website\r\n" });
    }
    if (
      url.pathname === "/businesses" &&
      request.method() === "GET"
    ) {
      return route.fulfill({ status: 200, contentType: "application/json", json: { success: true, data: businesses, pagination: { page: Number(url.searchParams.get("page") ?? 1), pageSize: 20, totalItems: 2, totalPages: 2 } } });
    }
    return route.continue();
  });
}

async function openMobileFilters(page: Page) {
  const trigger = page.getByRole("button", { name: /^Filters/ });
  if (await trigger.isVisible()) {
    await trigger.click();
    await expect(page.getByRole("dialog", { name: "Filter businesses" })).toBeVisible();
  }
}

async function closeMobileFilters(page: Page) {
  const apply = page.getByRole("button", { name: "Show results" });
  if (await apply.isVisible()) {
    await apply.click();
    await expect(page.getByRole("dialog", { name: "Filter businesses" })).not.toBeVisible();
  }
}

async function selectAlpha(page: Page) {
  const mobileCard = page.locator(".lf-mobile-business-card").filter({ hasText: "Alpha Dental" });
  if (await mobileCard.count() > 0 && await mobileCard.first().isVisible()) {
    await mobileCard.first().getByRole("checkbox").check();
  } else {
    await page.getByRole("row", { name: /Alpha Dental/ }).getByRole("checkbox").check();
  }
}

test.describe("Businesses Level 1 Cities & Level 2 CRM", () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePlaywright(page.context());
    await mockWorkspace(page);
  });

  test("renders Discovered Cities Grid on /businesses and allows clicking to city view", async ({ page }) => {
    await page.goto("/businesses");
    await expect(page.getByRole("heading", { name: "Discovered Cities" })).toBeVisible();
    await expect(page.getByText("Ahmedabad").first()).toBeVisible();
    await expect(page.getByText("Surat").first()).toBeVisible();

    // Click on Ahmedabad city card
    await page.getByText("Ahmedabad").first().click();

    // Verify URL updates to ?city=Ahmedabad and Level 2 table renders
    await expect(page).toHaveURL(/city=Ahmedabad/);
    await expect(page.getByText("Alpha Dental").filter({ visible: true }).first()).toBeVisible({ timeout: 15000 });

    // Click breadcrumb to return to cities grid
    await page.getByRole("button", { name: "All Cities" }).click();
    await expect(page.getByRole("heading", { name: "Discovered Cities" })).toBeVisible();
  });

  test("writes website, email and phone combinations to the URL and resets paging in city view", async ({ page }) => {
    await page.goto("/businesses?city=Ahmedabad&page=2");
    await expect(page.getByText("Ahmedabad").first()).toBeVisible();
    await openMobileFilters(page);

    const noWebsiteBox = page.getByRole("checkbox", { name: "No website" }).filter({ visible: true }).first();
    await expect(noWebsiteBox).toBeEnabled();
    await noWebsiteBox.click();
    await expect(page).toHaveURL(/has_website=false/);
    await expect(page).not.toHaveURL(/page=2/);

    const emailBox = page.getByRole("checkbox", { name: "Has email" }).filter({ visible: true }).first();
    await emailBox.click();
    await expect(page).toHaveURL(/has_email=true/);

    const phoneBox = page.getByRole("checkbox", { name: "Has phone" }).filter({ visible: true }).first();
    await phoneBox.click();
    await expect(page).toHaveURL(/has_phone=true/);

    const hasWebsiteBox = page.getByRole("checkbox", { name: "Has website", exact: true }).filter({ visible: true }).first();
    await hasWebsiteBox.click();
    await expect(page).toHaveURL(/has_website=true/);
    await expect(page).not.toHaveURL(/has_website=false/);
  });

  test("restores checkbox state with browser history", async ({ page }) => {
    await page.goto("/businesses?view=all");
    await expect(page.getByText("Alpha Dental").filter({ visible: true }).first()).toBeVisible({ timeout: 15000 });
    await openMobileFilters(page);

    const emailBox = page.getByRole("checkbox", { name: "Has email" }).filter({ visible: true }).first();
    await emailBox.click();
    await expect(page).toHaveURL(/has_email=true/);

    const phoneBox = page.getByRole("checkbox", { name: "Has phone" }).filter({ visible: true }).first();
    await phoneBox.click();
    await expect(page).toHaveURL(/has_phone=true/);

    await page.goBack();
    await expect(page.getByRole("checkbox", { name: "Has phone" }).filter({ visible: true }).first()).not.toBeChecked();
    await expect(page.getByRole("checkbox", { name: "Has email" }).filter({ visible: true }).first()).toBeChecked();

    await page.goForward();
    await expect(page.getByRole("checkbox", { name: "Has phone" }).filter({ visible: true }).first()).toBeChecked();
  });

  test("uses preview and filtered export contracts", async ({ page }) => {
    await page.goto("/businesses?view=all");
    await expect(page.getByText("Alpha Dental").filter({ visible: true }).first()).toBeVisible({ timeout: 15000 });
    await openMobileFilters(page);

    const noWebsiteBox = page.getByRole("checkbox", { name: "No website" }).filter({ visible: true }).first();
    await expect(noWebsiteBox).toBeEnabled();
    await noWebsiteBox.click();
    await expect(noWebsiteBox).toBeChecked({ timeout: 15000 });
    await closeMobileFilters(page);

    const previewPromise = page.waitForRequest((r) => r.url().endsWith("/businesses/export/preview"));
    await page.getByRole("button", { name: /Export CSV|Export businesses/ }).filter({ visible: true }).first().click();
    await expect(page.getByText("1 businesses match your current filters.")).toBeVisible();
    const preview = await previewPromise;
    expect(preview.postDataJSON().filters.has_website).toBe(false);
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("dialog", { name: "Export businesses" }).getByRole("button", { name: /Export$/ }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("businesses.csv");
    const csv = await readFile(await download.path());
    expect([...csv.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    const decoded = csv.toString("utf8");
    expect(decoded).toContain("ID,Name,Phone,Email,Website,City,Category,Address,Status");
    expect(decoded).toContain("'=SUM(1+1) Caf\u00e9");
    expect(decoded).toContain("+91 98765 43210");
    expect(decoded).toContain("alpha@example.com");
    expect(decoded.trim().split(/\r?\n/)).toHaveLength(2);
  });

  test("selected export sends ids and explicit email/phone qualification", async ({ page }) => {
    await page.goto("/businesses?view=all");
    await expect(page.getByText("Alpha Dental").filter({ visible: true }).first()).toBeVisible({ timeout: 15000 });
    await selectAlpha(page);
    await page.getByRole("button", { name: "Export selected" }).filter({ visible: true }).first().click();
    const dialog = page.getByRole("dialog", { name: "Export businesses" });
    await dialog.getByRole("radio", { name: /Selected businesses/ }).check();
    await expect(dialog.getByText("1 of 1 selected businesses match your criteria.")).toBeVisible();
    await dialog.getByRole("checkbox", { name: /Only export businesses/ }).check();
    await dialog.getByRole("checkbox", { name: "Has email" }).check();
    await dialog.getByRole("checkbox", { name: "Has phone" }).check();
    const requestPromise = page.waitForRequest((r) => new URL(r.url()).pathname === "/businesses/export/csv" && r.method() === "POST");
    await dialog.getByRole("button", { name: /Export$/ }).click();
    expect((await requestPromise).postDataJSON()).toEqual({ business_ids: [1], has_email: true, has_phone: true });
  });

  test("shows a safe backend preview error without fabricating a count", async ({ page }) => {
    await page.goto("/businesses?view=all");
    await expect(page.getByText("Alpha Dental").filter({ visible: true }).first()).toBeVisible({ timeout: 15000 });
    await page.route("**/businesses/export/preview", (route) => route.fulfill({
      status: 503,
      json: { success: false, message: "Export preview is temporarily unavailable.", error: "SERVICE_UNAVAILABLE", timestamp: "2026-08-19T00:00:00Z", requestId: "preview-test" },
    }));
    await page.getByRole("button", { name: /Export CSV|Export businesses/ }).filter({ visible: true }).first().click();
    const dialog = page.getByRole("dialog", { name: "Export businesses" });
    await expect(dialog.getByText("Failed to calculate export count")).toBeVisible();
    await expect(dialog.getByText("Export preview is temporarily unavailable.")).toBeVisible();
    await expect(dialog.getByRole("button", { name: /Export$/ })).toBeDisabled();
    await expect(dialog.getByText(/^\d+ businesses (match|will be exported)/)).not.toBeVisible();
  });

  test("does not present stale rows when a server-side filter request fails", async ({ page }) => {
    await page.goto("/businesses?view=all");
    await expect(page.getByText("Alpha Dental").filter({ visible: true }).first()).toBeVisible({ timeout: 15000 });
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.origin === "http://127.0.0.1:8000" && url.pathname === "/businesses" && url.searchParams.get("has_website") === "false") {
        return route.fulfill({
          status: 503,
          json: { success: false, message: "Business filters are temporarily unavailable.", error: "SERVICE_UNAVAILABLE", timestamp: "2026-08-19T00:00:00Z", requestId: "filters-test" },
        });
      }
      return route.fallback();
    });
    await openMobileFilters(page);
    const noWebsiteBox = page.getByRole("checkbox", { name: "No website" }).filter({ visible: true }).first();
    await noWebsiteBox.click();
    await expect(page).toHaveURL(/has_website=false/);
    await expect(page.getByText("Could not load businesses")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Alpha Dental").filter({ visible: true })).not.toBeVisible();
  });
});
