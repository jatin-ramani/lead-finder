import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { authenticatePlaywright } from "./support/auth";

const businesses = [
  { id: 1, name: "Alpha Dental", phone: "111", email: "alpha@example.com", website: null, city: "Ahmedabad", category: "Dental", address: "A", status: "No Website" },
  { id: 2, name: "Beta Foods", phone: null, email: "beta@example.com", website: "https://beta.test", city: "Surat", category: "Food", address: "B", status: "Has Website" },
];

async function mockWorkspace(page: Page) {
  await page.route("**/*", async (route) => {
    const request = route.request(); const url = new URL(request.url());
    if (url.pathname === "/auth/me") return route.fulfill({ json: { authenticated: true } });
    if (url.pathname === "/businesses/export/preview") {
      const payload = request.postDataJSON();
      const total = payload.scope === "selected" ? payload.business_ids.length : 2;
      return route.fulfill({ json: { success: true, total_selected: total, matching_qualification: 1, export_count: 1 } });
    }
    if (url.pathname === "/businesses/export/csv") {
      return route.fulfill({ status: 200, headers: { "content-type": "text/csv", "content-disposition": 'attachment; filename="businesses.csv"', "access-control-expose-headers": "Content-Disposition" }, body: "\uFEFFID,Name,Phone,Email,Website,City,Category,Address,Status\r\n1,'=SUM(1+1) Caf\u00e9,+91 98765 43210,alpha@example.com,,Ahmedabad,Dental,A,No Website\r\n" });
    }
    if (
      url.origin === "http://127.0.0.1:8000" &&
      url.pathname === "/businesses" &&
      request.method() === "GET"
    ) {
      return route.fulfill({ json: { success: true, data: businesses, pagination: { page: Number(url.searchParams.get("page") ?? 1), pageSize: 20, totalItems: 2, totalPages: 2 } } });
    }
    return route.continue();
  });
}

test.describe("Businesses server contract", () => {
  test.beforeEach(async ({ page }) => { await authenticatePlaywright(page.context()); await mockWorkspace(page); await page.goto("/businesses"); await expect(page.getByText("Alpha Dental")).toBeVisible(); });

  test("writes website, email and phone combinations to the URL and resets paging", async ({ page }) => {
    await page.goto("/businesses?page=2");
    await expect(page.getByRole("checkbox", { name: "No website" })).toBeEnabled();
    await page.getByRole("checkbox", { name: "No website" }).click();
    await expect(page).toHaveURL(/has_website=false/); await expect(page).not.toHaveURL(/page=2/);
    await page.getByRole("checkbox", { name: "Has email" }).click();
    await page.getByRole("checkbox", { name: "Has phone" }).click();
    await expect(page).toHaveURL(/has_email=true/); await expect(page).toHaveURL(/has_phone=true/);
    await page.getByRole("checkbox", { name: "Has website", exact: true }).click();
    await expect(page).toHaveURL(/has_website=true/); await expect(page).not.toHaveURL(/has_website=false/);
  });

  test("restores checkbox state with browser history", async ({ page }) => {
    await page.getByRole("checkbox", { name: "Has email" }).click();
    await expect(page).toHaveURL(/has_email=true/);
    await page.getByRole("checkbox", { name: "Has phone" }).click();
    await expect(page).toHaveURL(/has_phone=true/);
    await page.goBack(); await expect(page.getByRole("checkbox", { name: "Has phone" })).not.toBeChecked();
    await expect(page.getByRole("checkbox", { name: "Has email" })).toBeChecked();
    await page.goForward(); await expect(page.getByRole("checkbox", { name: "Has phone" })).toBeChecked();
  });

  test("uses preview and filtered export contracts", async ({ page }) => {
    await expect(page.getByRole("checkbox", { name: "No website" })).toBeEnabled();
    await page.getByRole("checkbox", { name: "No website" }).click();
    await expect(page.getByRole("checkbox", { name: "No website" })).toBeChecked();
    const previewPromise = page.waitForRequest((r) => r.url().endsWith("/businesses/export/preview"));
    await page.getByRole("button", { name: /Export CSV/ }).click();
    await expect(page.getByText("1 businesses match your current filters.")).toBeVisible();
    const preview = await previewPromise;
    expect(preview.postDataJSON().filters.has_website).toBe(false);
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("dialog", { name: "Export businesses" }).getByRole("button", { name: /Export$/ }).click();
    const download = await downloadPromise; expect(download.suggestedFilename()).toBe("businesses.csv");
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
    await page.getByRole("row", { name: /Alpha Dental/ }).getByRole("checkbox").check();
    await page.getByRole("button", { name: "Export selected" }).click();
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
    await page.route("**/businesses/export/preview", (route) => route.fulfill({
      status: 503,
      json: { success: false, message: "Export preview is temporarily unavailable.", error: "SERVICE_UNAVAILABLE", timestamp: "2026-08-19T00:00:00Z", requestId: "preview-test" },
    }));
    await page.getByRole("button", { name: /Export CSV/ }).click();
    const dialog = page.getByRole("dialog", { name: "Export businesses" });
    await expect(dialog.getByText("Failed to calculate export count")).toBeVisible();
    await expect(dialog.getByText("Export preview is temporarily unavailable.")).toBeVisible();
    await expect(dialog.getByRole("button", { name: /Export$/ })).toBeDisabled();
    await expect(dialog.getByText(/^\d+ businesses (match|will be exported)/)).not.toBeVisible();
  });

  test("does not present stale rows when a server-side filter request fails", async ({ page }) => {
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
    await page.getByRole("checkbox", { name: "No website" }).click();
    await expect(page).toHaveURL(/has_website=false/);
    await expect(page.getByText("Could not load businesses")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Alpha Dental")).not.toBeVisible();
  });

});
