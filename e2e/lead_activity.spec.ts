import { expect, test, type Page } from "@playwright/test";
import type { BusinessActivity, BusinessActivityListResponse } from "@/types/api";
import { authenticatePlaywright } from "./support/auth";

const mockBusinesses = [
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

let globalActivities: Record<number, BusinessActivity[]> = {};
let nextActivityId = 200;

async function mockActivityRoutes(page: Page) {
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
          expires_at: new Date(Date.now() + 86400000).toISOString(),
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
            { city: "Ahmedabad", totalBusinesses: 1, withWebsite: 0, withEmail: 1, withPhone: 1 },
            { city: "Surat", totalBusinesses: 1, withWebsite: 1, withEmail: 1, withPhone: 1 },
          ],
        }),
      });
      return;
    }

    // GET /businesses/:id/activities
    const activitiesMatch = pathname.match(/^\/businesses\/(\d+)\/activities$/);
    if (activitiesMatch && method === "GET") {
      const bizId = Number(activitiesMatch[1]);
      const list = globalActivities[bizId] || [];
      const response: BusinessActivityListResponse = {
        success: true,
        items: list,
        total: list.length,
        page: 1,
        page_size: 20,
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
      return;
    }

    // PATCH /businesses/:id/status
    const statusMatch = pathname.match(/^\/businesses\/(\d+)\/status$/);
    if (statusMatch && method === "PATCH") {
      const bizId = Number(statusMatch[1]);
      const postData = JSON.parse(request.postData() || "{}");
      const target = mockBusinesses.find((b) => b.id === bizId);
      if (target) {
        const oldStatus = target.lead_status;
        target.lead_status = postData.status;
        if (!globalActivities[bizId]) globalActivities[bizId] = [];
        globalActivities[bizId].unshift({
          id: ++nextActivityId,
          business_id: bizId,
          activity_type: "status_changed",
          title: `Status changed to ${postData.status}`,
          description: `${oldStatus} → ${postData.status}`,
          metadata: { old_status: oldStatus, new_status: postData.status },
          created_at: new Date().toISOString(),
        });
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Lead status updated",
          business: target,
        }),
      });
      return;
    }

    // PATCH /businesses/:id/favorite
    const favMatch = pathname.match(/^\/businesses\/(\d+)\/favorite$/);
    if (favMatch && method === "PATCH") {
      const bizId = Number(favMatch[1]);
      const postData = JSON.parse(request.postData() || "{}");
      const target = mockBusinesses.find((b) => b.id === bizId);
      if (target) {
        target.is_favorite = postData.is_favorite;
        if (!globalActivities[bizId]) globalActivities[bizId] = [];
        globalActivities[bizId].unshift({
          id: ++nextActivityId,
          business_id: bizId,
          activity_type: postData.is_favorite ? "favorite_added" : "favorite_removed",
          title: postData.is_favorite ? "Added to favorites" : "Removed from favorites",
          description: postData.is_favorite ? "Marked as favorite lead" : "Unmarked from favorites",
          created_at: new Date().toISOString(),
        });
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Favorite updated",
          business: target,
        }),
      });
      return;
    }

    // GET /businesses/:id/notes
    const notesMatch = pathname.match(/^\/businesses\/(\d+)\/notes$/);
    if (notesMatch && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [], total: 0 }),
      });
      return;
    }

    // GET /businesses
    if (pathname === "/businesses" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: mockBusinesses,
          pagination: {
            page: 1,
            pageSize: 20,
            totalItems: mockBusinesses.length,
            totalPages: 1,
          },
        }),
      });
      return;
    }

    if (pathname === "/dashboard/stats") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          total_businesses: 2,
          with_website: 1,
          without_website: 1,
          with_email: 2,
          without_email: 0,
          with_phone: 2,
          without_phone: 0,
          actionable_leads: 2,
          top_cities: [],
          top_categories: [],
        }),
      });
      return;
    }

    if (pathname === "/tags" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [{ id: 1, name: "Hot Lead", slug: "hot-lead", usage_count: 1 }],
        }),
      });
      return;
    }

    await route.continue();
  });
}

test.describe("Phase 2 Feature 1: Lead Activity / History Timeline", () => {
  test.beforeEach(async ({ page }) => {
    globalActivities = {
      1: [
        {
          id: 101,
          business_id: 1,
          activity_type: "business_created",
          title: "Business created",
          description: "Lead discovered and added to CRM",
          created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
        },
      ],
      2: [],
    };
    await authenticatePlaywright(page.context());
    await mockActivityRoutes(page);
    await page.goto("/businesses?view=all");
    await expect(page.locator(".lf-table-card")).toBeVisible({ timeout: 10000 });
  });

  test("renders activity history timeline inside business drawer", async ({ page }) => {
    await page.getByText("Alpha Dental").filter({ visible: true }).first().click();

    // Verify Drawer is open
    const drawer = page.locator(".lf-drawer");
    await expect(drawer).toBeVisible();

    // Verify Activity & History section heading
    const activityHeading = drawer.getByRole("heading", { name: /Activity & History/i });
    await activityHeading.scrollIntoViewIfNeeded();
    await expect(activityHeading).toBeVisible();

    // Verify initial business_created activity is listed
    const bizCreatedTitle = drawer.getByText("Business created");
    await bizCreatedTitle.scrollIntoViewIfNeeded();
    await expect(bizCreatedTitle).toBeVisible();
    await expect(drawer.getByText("Lead discovered and added to CRM")).toBeVisible();

    // Close drawer
    await drawer.locator(".ant-drawer-close").click();
    await expect(drawer).not.toBeVisible();
  });

  test("displays empty state when business has no recorded activity", async ({ page }) => {
    await page.getByText("Beta Foods").filter({ visible: true }).first().click();

    const drawer = page.locator(".lf-drawer");
    await expect(drawer).toBeVisible();

    // Check empty state message
    const emptyMsg = drawer.getByText(/No activity recorded yet for this lead/i);
    await emptyMsg.scrollIntoViewIfNeeded();
    await expect(emptyMsg).toBeVisible();

    // Close drawer
    await drawer.locator(".ant-drawer-close").click();
    await expect(drawer).not.toBeVisible();
  });

  test("dynamically adds status change activity when status is modified", async ({ page }) => {
    await page.getByText("Alpha Dental").filter({ visible: true }).first().click();

    const drawer = page.locator(".lf-drawer");
    await expect(drawer).toBeVisible();

    // Change status from NEW to INTERESTED via Drawer select
    const statusSelect = drawer.locator(".lf-drawer-status-card .ant-select");
    await statusSelect.scrollIntoViewIfNeeded();
    await statusSelect.click();

    const option = page.locator(".ant-select-dropdown:visible .ant-select-item-option-content").filter({ hasText: /INTERESTED/i }).first();
    await expect(option).toBeVisible();
    await option.click();

    // Verify timeline updates with new status activity
    const statusActivity = drawer.getByText(/Status changed to interested/i);
    await statusActivity.scrollIntoViewIfNeeded();
    await expect(statusActivity).toBeVisible();
  });

  test("dynamically adds favorite activity when favorite is toggled", async ({ page }) => {
    await page.getByText("Alpha Dental").filter({ visible: true }).first().click();

    const drawer = page.locator(".lf-drawer");
    await expect(drawer).toBeVisible();

    // Toggle favorite in drawer
    const favButton = drawer.getByRole("button", { name: /Add to favorites/i });
    await favButton.click();

    // Verify timeline shows Added to favorites
    const favActivity = drawer.getByText("Added to favorites");
    await favActivity.scrollIntoViewIfNeeded();
    await expect(favActivity).toBeVisible();
  });

  test("drawer switching isolates activity cache with zero cross-lead leakage", async ({ page }) => {
    // 1. Open Alpha Dental (has activity)
    await page.getByText("Alpha Dental").filter({ visible: true }).first().click();
    const drawer = page.locator(".lf-drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText("Business created")).toBeVisible();

    // Close drawer
    await drawer.locator(".ant-drawer-close").click();
    await expect(drawer).not.toBeVisible();

    // 2. Open Beta Foods (has NO activity)
    await page.getByText("Beta Foods").filter({ visible: true }).first().click();
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(/No activity recorded yet for this lead/i)).toBeVisible();
    await expect(drawer.getByText("Business created")).not.toBeVisible();

    // Close drawer
    await drawer.locator(".ant-drawer-close").click();
    await expect(drawer).not.toBeVisible();

    // 3. Re-open Alpha Dental (activity restored)
    await page.getByText("Alpha Dental").filter({ visible: true }).first().click();
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText("Business created")).toBeVisible();
  });
});

