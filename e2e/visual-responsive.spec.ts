import { expect, test, type Page } from "@playwright/test";
import { authenticatePlaywright } from "./support/auth";

const business = { id: 1, name: "Apex Dental Clinic", phone: "+91 98765 43210", email: "hello@apex.test", website: null, city: "Ahmedabad", category: "Dental clinic", address: "Ashram Road", status: "No Website" };

async function mockProduct(page: Page) {
  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === "/auth/me") return route.fulfill({ json: { authenticated: request.headers().cookie?.includes("leadfinder_session=") ?? false } });
    if (url.origin !== "http://127.0.0.1:8000") return route.continue();
    const responses: Record<string, unknown> = {
      "/dashboard/stats": { business: { totalBusinesses: 248, withWebsite: 81, withoutWebsite: 167, withEmail: 93, withoutEmail: 155, withPhone: 201, actionableLeads: 72 }, websiteData: { completed: 71, failed: 10, pending: 0, totalScraped: 81 }, scrapeJobs: { total: 8, running: 0, completed: 7, failed: 1 }, scanJobs: { total: 12, running: 0, completed: 12 }, latestScanJob: null, latestScrapeJob: null },
      "/businesses": { success: true, data: [business], pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 } },
      "/scan/jobs": [],
      "/scrape/jobs": { success: true, data: [] },
      "/health": { status: "healthy", database: "connected", timestamp: "2026-08-19T00:00:00Z" },
      "/version": { name: "Lead Finder API", version: "1.0.0" },
      "/system": { pythonVersion: "3.13", platform: "Windows", database: "sqlite", apiVersion: "1.0.0", serverTime: "2026-08-19T00:00:00Z" },
      "/": { message: "Lead Finder API" },
    };
    if (url.pathname in responses) return route.fulfill({ json: responses[url.pathname] });
    return route.fulfill({ status: 404, json: { success: false, message: "Not found", error: "NOT_FOUND", timestamp: "2026-08-19T00:00:00Z", requestId: "visual-qa" } });
  });
}

test("all product routes are responsive without horizontal overflow", async ({ context, page }, testInfo) => {
  await mockProduct(page);
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Lead Finder Admin" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("login.png"), fullPage: true });

  await authenticatePlaywright(context);
  for (const route of ["/", "/businesses", "/scanner", "/scraping", "/system"]) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    const name = route === "/" ? "dashboard" : route.slice(1);
    await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true });
  }
});
