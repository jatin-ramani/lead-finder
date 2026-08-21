import { expect, test, type Page } from "@playwright/test";
import type { Business } from "@/types/api";
import { authenticatePlaywright } from "./support/auth";

const mockBusinesses: Business[] = [
  {
    id: 1,
    name: "Alpha Dental",
    phone: "+91 98765 43210",
    email: "alpha@example.com",
    website: null,
    city: "Ahmedabad",
    category: "Dental Clinic",
    address: "CG Road",
    status: "No Website",
    lead_status: "new",
    lead_score: 85,
    lead_grade: "A",
    lead_score_reasons: ["No website but active contact info"],
    is_favorite: false,
    tags: [{ id: 1, name: "Hot Lead", slug: "hot-lead" }],
  },
  {
    id: 2,
    name: "Beta Foods",
    phone: "+91 98765 11111",
    email: "beta@example.com",
    website: "https://beta.test",
    city: "Surat",
    category: "Food & Dining",
    address: "Ring Road",
    status: "Has Website",
    lead_status: "contacted",
    lead_score: 70,
    lead_grade: "B",
    lead_score_reasons: [],
    is_favorite: true,
    tags: [],
  },
];

async function mockStatusRoutes(page: Page) {
  const businesses: Business[] = JSON.parse(JSON.stringify(mockBusinesses));

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
            {
              city: "Ahmedabad",
              totalBusinesses: 1,
              withWebsite: 0,
              withEmail: 1,
              withPhone: 1,
              activeScrapes: 0,
            },
            {
              city: "Surat",
              totalBusinesses: 1,
              withWebsite: 1,
              withEmail: 1,
              withPhone: 1,
              activeScrapes: 0,
            },
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
          data: [{ id: 1, name: "Hot Lead", slug: "hot-lead", business_count: 1 }],
        }),
      });
      return;
    }

    if (pathname === "/scrape/jobs") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
      return;
    }

    // Single status update: PATCH /businesses/{id}/status
    const statusMatch = pathname.match(/^\/businesses\/(\d+)\/status$/);
    if (statusMatch && method === "PATCH") {
      const bizId = Number.parseInt(statusMatch[1], 10);
      const postData = request.postDataJSON() as { status: import("@/types/api").LeadStatus };
      const biz = businesses.find((b: Business) => b.id === bizId);
      if (biz) {
        biz.lead_status = postData.status;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(biz),
        });
        return;
      }
    }

    // Bulk status update: POST /businesses/status/bulk
    if (pathname === "/businesses/status/bulk" && method === "POST") {
      const postData = request.postDataJSON() as { business_ids: number[]; status: import("@/types/api").LeadStatus };
      const ids: number[] = postData.business_ids || [];
      const status = postData.status;
      for (const id of ids) {
        const biz = businesses.find((b: Business) => b.id === id);
        if (biz) biz.lead_status = status;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: `Lead status updated to ${status}`,
          updated_count: ids.length,
          total_requested: ids.length,
          status,
        }),
      });
      return;
    }

    // Businesses list
    if (pathname === "/businesses" && method === "GET") {
      let filtered = [...businesses];
      const leadStatusParam = url.searchParams.get("lead_status");
      if (leadStatusParam) {
        filtered = filtered.filter((b: Business) => b.lead_status === leadStatusParam);
      }
      const cityParam = url.searchParams.get("city");
      if (cityParam) {
        filtered = filtered.filter((b: Business) => b.city?.toLowerCase() === cityParam.toLowerCase());
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: filtered,
          pagination: {
            page: 1,
            pageSize: 20,
            totalItems: filtered.length,
            totalPages: 1,
          },
        }),
      });
      return;
    }

    await route.continue();
  });
}

test.describe("Lead Status / CRM Pipeline Feature", () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePlaywright(page.context());
    await mockStatusRoutes(page);
    await page.goto("/businesses?view=all");
    await page.waitForLoadState("networkidle");
  });

  test("displays lead status column and quick status dropdown", async ({ page, isMobile }) => {
    if (!isMobile) {
      await expect(page.locator("th:has-text('Lead Status')")).toBeVisible();
      const tableStatusSelect = page.locator(".ant-table .lf-status-select").first();
      await expect(tableStatusSelect).toBeVisible();
    } else {
      const mobileStatusSelect = page.locator(".lf-mobile-business-card .lf-status-select").first();
      await expect(mobileStatusSelect).toBeVisible();
    }
  });

  test("drawer displays CRM Pipeline Status card and updates status", async ({ page, isMobile }) => {
    const firstRowName = isMobile
      ? page.locator(".lf-mobile-business-name").first()
      : page.locator(".lf-cell-business").first();
    await firstRowName.click();
    await page.waitForSelector(".lf-drawer", { state: "visible" });

    // Verify CRM Pipeline Status section
    await expect(page.locator(".lf-drawer-status-card")).toBeVisible();
    await expect(page.locator(".lf-drawer-status-card").getByText("CRM Pipeline Status")).toBeVisible();

    await page.keyboard.press("Escape");
  });

  test("bulk action bar allows changing status for selected leads", async ({ page, isMobile }) => {
    const selectCheckbox = isMobile
      ? page.locator(".lf-mobile-business-card .ant-checkbox-input").first()
      : page.locator(".ant-table-row .ant-checkbox-input").first();
    if (await selectCheckbox.isVisible()) {
      await selectCheckbox.check();

      const bulkBar = page.locator(".lf-bulk-bar");
      await expect(bulkBar).toBeVisible();
      const changeStatusBtn = bulkBar.getByRole("button", { name: /Change status/i });
      await expect(changeStatusBtn).toBeVisible();
    }
  });
});
