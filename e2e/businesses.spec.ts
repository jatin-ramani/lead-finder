import { expect, test, type Page } from "@playwright/test";

const businesses = [
  { id: 1, name: "Alpha Dental", phone: "111", email: "alpha@example.com", website: null, city: "Ahmedabad", category: "Dental", address: "A", status: "No Website" },
  { id: 2, name: "Beta Foods", phone: null, email: "beta@example.com", website: "https://beta.test", city: "Surat", category: "Food", address: "B", status: "Has Website" },
];

async function mockWorkspace(page: Page) {
  await page.route("**/*", async (route) => {
    const request = route.request(); const url = new URL(request.url());
    if (url.pathname === "/auth/me") return route.fulfill({ json: { authenticated: true } });
    if (url.pathname === "/businesses/export/preview") {
      return route.fulfill({ json: { success: true, total_selected: 2, matching_qualification: 1, export_count: 1 } });
    }
    if (url.pathname === "/businesses/export/csv") {
      return route.fulfill({ status: 200, headers: { "content-type": "text/csv", "content-disposition": 'attachment; filename="businesses.csv"' }, body: "ID,Name\r\n1,Alpha Dental\r\n" });
    }
    if (url.pathname === "/businesses" && request.method() === "GET") {
      return route.fulfill({ json: { success: true, data: businesses, pagination: { page: Number(url.searchParams.get("page") ?? 1), pageSize: 20, totalItems: 2, totalPages: 2 } } });
    }
    return route.continue();
  });
}

test.describe("Businesses server contract", () => {
  test.beforeEach(async ({ page }) => { await mockWorkspace(page); await page.goto("/businesses"); await expect(page.getByText("Alpha Dental")).toBeVisible(); });

  test("writes website, email and phone combinations to the URL and resets paging", async ({ page }) => {
    await page.goto("/businesses?page=2");
    await page.getByRole("checkbox", { name: "No website" }).check();
    await expect(page).toHaveURL(/has_website=false/); await expect(page).not.toHaveURL(/page=2/);
    await page.getByRole("checkbox", { name: "Has email" }).check();
    await page.getByRole("checkbox", { name: "Has phone" }).check();
    await expect(page).toHaveURL(/has_email=true/); await expect(page).toHaveURL(/has_phone=true/);
    await page.getByRole("checkbox", { name: "Has website", exact: true }).check();
    await expect(page).toHaveURL(/has_website=true/); await expect(page).not.toHaveURL(/has_website=false/);
  });

  test("restores checkbox state with browser history", async ({ page }) => {
    await page.getByRole("checkbox", { name: "Has email" }).check();
    await page.getByRole("checkbox", { name: "Has phone" }).check();
    await page.goBack(); await expect(page.getByRole("checkbox", { name: "Has phone" })).not.toBeChecked();
    await expect(page.getByRole("checkbox", { name: "Has email" })).toBeChecked();
    await page.goForward(); await expect(page.getByRole("checkbox", { name: "Has phone" })).toBeChecked();
  });

  test("uses preview and filtered export contracts", async ({ page }) => {
    await page.getByRole("checkbox", { name: "No website" }).check();
    await page.getByRole("button", { name: /Export CSV/ }).click();
    await expect(page.getByText("1 businesses will be exported.")).toBeVisible();
    const preview = await page.waitForRequest((r) => r.url().endsWith("/businesses/export/preview"));
    expect(preview.postDataJSON().filters.has_website).toBe(false);
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export", exact: true }).click();
    const download = await downloadPromise; expect(download.suggestedFilename()).toBe("businesses.csv");
  });

  test("selected export sends ids and explicit email/phone qualification", async ({ page }) => {
    await page.getByRole("checkbox", { name: "Select Alpha Dental" }).check();
    await page.getByRole("button", { name: "Export selected" }).click();
    await page.getByRole("radio", { name: /Selected businesses/ }).check();
    await page.getByRole("checkbox", { name: /Only export businesses/ }).check();
    await page.getByRole("checkbox", { name: "Has email" }).check();
    await page.getByRole("checkbox", { name: "Has phone" }).check();
    const requestPromise = page.waitForRequest((r) => r.url().endsWith("/businesses/export/csv") && r.method() === "POST");
    await page.getByRole("button", { name: "Export", exact: true }).click();
    expect((await requestPromise).postDataJSON()).toEqual({ business_ids: [1], has_email: true, has_phone: true });
  });
});
