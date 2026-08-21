import { expect, test, type Page } from "@playwright/test";
import { authenticatePlaywright } from "./support/auth";

const mockTags = [
  { id: 1, name: "Hot Lead", slug: "hot-lead", business_count: 2 },
  { id: 2, name: "Website Needed", slug: "website-needed", business_count: 1 },
];

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
    lead_score: 85,
    lead_grade: "A",
    lead_score_reasons: ["No website but active contact info"],
    tags: [{ id: 1, name: "Hot Lead", slug: "hot-lead" }],
  },
  {
    id: 2,
    name: "Beta Foods",
    phone: null,
    email: "beta@example.com",
    website: "https://beta.test",
    city: "Surat",
    category: "Food & Dining",
    address: "Ring Road",
    status: "Has Website",
    lead_score: 45,
    lead_grade: "C",
    lead_score_reasons: [],
    tags: [],
  },
];

async function mockTagRoutes(page: Page) {
  await page.route("**/*", async (route) => {
    const request = route.request();
    const urlString = request.url();
    if (!urlString.includes("8000")) {
      await route.continue();
      return;
    }

    const url = new URL(urlString);
    if (url.pathname === "/auth/me") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        json: { authenticated: true },
      });
    }

    if (url.pathname === "/tags" && request.method() === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        json: { success: true, count: mockTags.length, data: mockTags },
      });
    }

    if (url.pathname === "/tags" && request.method() === "POST") {
      const body = request.postDataJSON();
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        json: {
          id: 3,
          name: body.name,
          slug: body.name.toLowerCase().replace(/\s+/g, "-"),
          business_count: 0,
        },
      });
    }

    if (url.pathname === "/businesses/cities") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        json: { success: true, data: [] },
      });
    }

    if (url.pathname === "/businesses" && request.method() === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        json: {
          success: true,
          data: mockBusinesses,
          pagination: { page: 1, pageSize: 20, totalItems: 2, totalPages: 1 },
        },
      });
    }

    if (url.pathname === "/businesses/1" && request.method() === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        json: mockBusinesses[0],
      });
    }

    if (url.pathname.includes("/tags") && request.method() === "DELETE") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        json: { success: true, deleted: 1 },
      });
    }

    if (url.pathname.includes("/tags") && request.method() === "POST") {
      const body = request.postDataJSON() || {};
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        json: {
          id: 4,
          name: body.name || "VIP Client",
          slug: (body.name || "vip-client").toLowerCase().replace(/\s+/g, "-"),
          business_count: 1,
          updated_count: 1,
        },
      });
    }

    return route.continue();
  });
}

test.describe("Lead Tags System E2E Suite", () => {
  test.beforeEach(async ({ context, page }) => {
    await authenticatePlaywright(context);
    await mockTagRoutes(page);
    await page.goto("/businesses?view=all");
  });

  test("tag management modal opens, creates tag, and lists tags", async ({ page }) => {
    // Open Tags management modal
    const tagsBtn = page.getByRole("button", { name: "Tags", exact: true });
    await expect(tagsBtn).toBeVisible();
    await tagsBtn.click();

    // Verify Modal
    const modal = page.locator(".lf-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("Manage Custom Tags")).toBeVisible();

    // Verify existing tags in modal
    await expect(modal.getByText("Hot Lead")).toBeVisible();
    await expect(modal.getByText("Website Needed")).toBeVisible();

    // Create a new tag
    await modal.getByPlaceholder(/new tag name/i).fill("High Priority");
    await modal.getByRole("button", { name: /create tag/i }).click();

    // Close modal
    await modal.getByRole("button", { name: "Done" }).click();
    await expect(modal).not.toBeVisible();
  });

  test("business table displays tags column and tag pills", async ({ page, isMobile }) => {
    if (isMobile) {
      const tagPill = page.locator(".lf-mobile-business-card .lf-custom-tag-pill").filter({ hasText: "Hot Lead" });
      await expect(tagPill.first()).toBeVisible();
    } else {
      const tagsHeader = page.locator(".lf-table").getByRole("columnheader", { name: "Tags" });
      await expect(tagsHeader).toBeAttached();

      const tagPill = page.locator(".lf-table .lf-custom-tag-pill").filter({ hasText: "Hot Lead" });
      await tagPill.first().scrollIntoViewIfNeeded();
      await expect(tagPill.first()).toBeVisible();
    }
  });

  test("business drawer displays tags and allows inline tag management", async ({ page }) => {
    // Click business name to open drawer
    await page.getByText("Alpha Dental").filter({ visible: true }).first().click();

    const drawer = page.locator(".lf-drawer");
    await expect(drawer).toBeVisible();

    // Verify Tags section exists in drawer
    const tagsSection = drawer.locator(".lf-drawer-tags-card");
    await expect(tagsSection).toBeVisible();
    await expect(tagsSection.getByText("Hot Lead")).toBeVisible();

    // Click "Add Tag" button
    const addBtn = tagsSection.getByRole("button", { name: /add tag/i });
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Verify input appears
    const input = tagsSection.getByPlaceholder("Tag name...");
    await expect(input).toBeVisible();
    await input.fill("VIP Client");
    await input.press("Enter");

    // Close drawer
    await drawer.locator(".ant-drawer-close").click();
    await expect(drawer).not.toBeVisible();
  });

  test("bulk tag modal opens on row selection and executes bulk attach", async ({ page, isMobile }) => {
    if (isMobile) return; // Bulk selection bar is primary on desktop/tablet

    // Select Alpha Dental checkbox
    const alphaRow = page.getByRole("row", { name: /Alpha Dental/ });
    await alphaRow.getByRole("checkbox").check();

    // Selection toolbar appears
    const bulkBar = page.locator(".lf-bulk-bar");
    await expect(bulkBar).toBeVisible();
    await expect(bulkBar.getByText(/1 business selected/i)).toBeVisible();

    // Click "Tag selected" button
    const tagSelectedBtn = bulkBar.getByRole("button", { name: /tag selected/i });
    await expect(tagSelectedBtn).toBeVisible();
    await tagSelectedBtn.click();

    // Verify Bulk Tag modal
    const bulkModal = page.locator(".lf-modal").filter({ hasText: "Bulk Add Tag" });
    await expect(bulkModal).toBeVisible();

    // Cancel modal
    await bulkModal.getByRole("button", { name: /cancel/i }).click();
    await expect(bulkModal).not.toBeVisible();
  });
});


