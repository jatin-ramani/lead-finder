import { expect, test, type Page } from "@playwright/test";
import type { BusinessFollowUp, FollowUpListResponse } from "@/types/api";
import { authenticatePlaywright } from "./support/auth";

const mockBusinesses = [
  {
    id: 1,
    name: "Apex Dental Clinic",
    phone: "+91 98765 43210",
    email: "apex@example.com",
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
    name: "Zenith Law Firm",
    phone: "+91 98765 11111",
    email: "zenith@example.com",
    website: "https://zenithlaw.test",
    city: "Surat",
    category: "Legal Services",
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

let globalFollowUps: Record<number, BusinessFollowUp[]> = {};
let nextFollowUpId = 500;

async function mockFollowUpRoutes(page: Page) {
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

    // GET /businesses/:id/follow-ups
    const listMatch = pathname.match(/^\/businesses\/(\d+)\/follow-ups$/);
    if (listMatch && method === "GET") {
      const bizId = Number(listMatch[1]);
      const statusParam = url.searchParams.get("status");
      let list = globalFollowUps[bizId] || [];
      if (statusParam) {
        list = list.filter((fu) => fu.status === statusParam);
      }
      const response: FollowUpListResponse = {
        success: true,
        items: list,
        total: list.length,
        page: 1,
        page_size: 50,
        total_pages: 1,
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
      return;
    }

    // POST /businesses/:id/follow-ups
    if (listMatch && method === "POST") {
      const bizId = Number(listMatch[1]);
      const postData = JSON.parse(request.postData() || "{}");
      const newFollowUp: BusinessFollowUp = {
        id: nextFollowUpId++,
        business_id: bizId,
        title: postData.title,
        description: postData.description || null,
        due_at: postData.due_at || null,
        completed_at: null,
        status: "pending",
        priority: postData.priority || "medium",
        is_overdue: Boolean(postData.due_at && new Date(postData.due_at).getTime() < Date.now()),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (!globalFollowUps[bizId]) globalFollowUps[bizId] = [];
      globalFollowUps[bizId].unshift(newFollowUp);
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: newFollowUp,
          message: "Follow-up created successfully",
        }),
      });
      return;
    }

    // PATCH /follow-ups/:id
    const patchMatch = pathname.match(/^\/follow-ups\/(\d+)$/);
    if (patchMatch && method === "PATCH") {
      const fId = Number(patchMatch[1]);
      const postData = JSON.parse(request.postData() || "{}");
      let updated: BusinessFollowUp | null = null;
      for (const bId of Object.keys(globalFollowUps)) {
        const list = globalFollowUps[Number(bId)];
        const target = list.find((fu) => fu.id === fId);
        if (target) {
          if (postData.title !== undefined) target.title = postData.title;
          if (postData.description !== undefined) target.description = postData.description;
          if (postData.priority !== undefined) target.priority = postData.priority;
          if (postData.due_at !== undefined) {
            target.due_at = postData.due_at;
            target.is_overdue = Boolean(postData.due_at && new Date(postData.due_at).getTime() < Date.now() && target.status === "pending");
          }
          target.updated_at = new Date().toISOString();
          updated = target;
          break;
        }
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: updated,
          message: "Follow-up updated successfully",
        }),
      });
      return;
    }

    // POST /follow-ups/:id/complete
    const completeMatch = pathname.match(/^\/follow-ups\/(\d+)\/complete$/);
    if (completeMatch && method === "POST") {
      const fId = Number(completeMatch[1]);
      let updated: BusinessFollowUp | null = null;
      for (const bId of Object.keys(globalFollowUps)) {
        const list = globalFollowUps[Number(bId)];
        const target = list.find((fu) => fu.id === fId);
        if (target) {
          target.status = "completed";
          target.completed_at = new Date().toISOString();
          target.is_overdue = false;
          target.updated_at = new Date().toISOString();
          updated = target;
          break;
        }
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: updated,
          message: "Follow-up marked as completed",
        }),
      });
      return;
    }

    // POST /follow-ups/:id/cancel
    const cancelMatch = pathname.match(/^\/follow-ups\/(\d+)\/cancel$/);
    if (cancelMatch && method === "POST") {
      const fId = Number(cancelMatch[1]);
      let updated: BusinessFollowUp | null = null;
      for (const bId of Object.keys(globalFollowUps)) {
        const list = globalFollowUps[Number(bId)];
        const target = list.find((fu) => fu.id === fId);
        if (target) {
          target.status = "cancelled";
          target.is_overdue = false;
          target.updated_at = new Date().toISOString();
          updated = target;
          break;
        }
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: updated,
          message: "Follow-up marked as cancelled",
        }),
      });
      return;
    }

    // DELETE /follow-ups/:id
    const deleteMatch = pathname.match(/^\/follow-ups\/(\d+)$/);
    if (deleteMatch && method === "DELETE") {
      const fId = Number(deleteMatch[1]);
      for (const bId of Object.keys(globalFollowUps)) {
        globalFollowUps[Number(bId)] = globalFollowUps[Number(bId)].filter((fu) => fu.id !== fId);
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Follow-up deleted successfully",
        }),
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

    // GET /dashboard/stats
    if (pathname === "/dashboard/stats" && method === "GET") {
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

    // GET /tags
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

    // GET /businesses/:id/notes
    if (pathname.match(/^\/businesses\/\d+\/notes$/) && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [],
          total: 0,
        }),
      });
      return;
    }

    // GET /businesses/:id/activities
    if (pathname.match(/^\/businesses\/\d+\/activities$/) && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          items: [],
          total: 0,
          page: 1,
          page_size: 20,
        }),
      });
      return;
    }

    // GET /businesses/:id/website
    if (pathname.match(/^\/businesses\/\d+\/website$/) && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: null,
        }),
      });
      return;
    }

    await route.continue();
  });
}

test.describe("Phase 3 CRM Follow-ups E2E Suite", () => {
  test.beforeEach(async ({ page }) => {
    // Reset state before each test
    globalFollowUps = {
      1: [
        {
          id: 101,
          business_id: 1,
          title: "Initial Discovery Call",
          description: "Discuss website revamp and lead generation options.",
          due_at: new Date(Date.now() + 86400000).toISOString(),
          completed_at: null,
          status: "pending",
          priority: "high",
          is_overdue: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 102,
          business_id: 1,
          title: "Overdue Follow-up Task",
          description: "Follow up on pricing contract proposal.",
          due_at: new Date(Date.now() - 86400000).toISOString(),
          completed_at: null,
          status: "pending",
          priority: "medium",
          is_overdue: true,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ],
      2: [
        {
          id: 201,
          business_id: 2,
          title: "Legal Contract Review Follow-up",
          description: "Review NDA terms with managing partner.",
          due_at: new Date(Date.now() + 172800000).toISOString(),
          completed_at: null,
          status: "pending",
          priority: "low",
          is_overdue: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    };
    nextFollowUpId = 500;

    await authenticatePlaywright(page.context());
    await mockFollowUpRoutes(page);
    await page.goto("/businesses?view=all");
    await expect(page.locator(".lf-table-card")).toBeVisible({ timeout: 10000 });
  });

  test("displays follow-ups section with overdue indicator and priority badges in BusinessDrawer", async ({ page }) => {
    // Click first business to open drawer
    await page.getByText("Apex Dental Clinic").filter({ visible: true }).first().click();

    // Verify drawer is open and Follow-ups section exists
    const drawer = page.locator(".lf-drawer");
    await expect(drawer).toBeVisible();

    const fuCard = drawer.locator(".lf-drawer-followups-card");
    await fuCard.scrollIntoViewIfNeeded();
    await expect(fuCard).toBeVisible();
    await expect(fuCard.getByText(/Follow-ups \(2\)/i)).toBeVisible();

    // Check high priority badge and title
    await expect(fuCard.getByText("Initial Discovery Call")).toBeVisible();
    await expect(fuCard.getByText("high").first()).toBeVisible();

    // Check overdue badge on the overdue task
    await expect(fuCard.getByText("Overdue Follow-up Task")).toBeVisible();
    await expect(fuCard.locator(".lf-overdue-tag")).toBeVisible();
  });

  test("can create a new follow-up with priority and due date", async ({ page }) => {
    await page.getByText("Apex Dental Clinic").filter({ visible: true }).first().click();
    const fuCard = page.locator(".lf-drawer-followups-card");
    await fuCard.scrollIntoViewIfNeeded();

    // Click Add Follow-up
    await fuCard.locator("#add-followup-button").click();
    await expect(fuCard.locator("#add-followup-form")).toBeVisible();

    // Fill form
    await fuCard.locator("#new-followup-title").fill("Send Custom Proposal Deck");
    await fuCard.locator("#new-followup-description").fill("Include package A and package B pricing breakdown.");

    // Submit
    await fuCard.locator("#save-followup-button").click();

    // Verify new follow-up appears
    await expect(fuCard.getByText("Send Custom Proposal Deck")).toBeVisible();
    await expect(fuCard.getByText(/Follow-ups \(3\)/i)).toBeVisible();
  });

  test("can edit an existing follow-up", async ({ page }) => {
    await page.getByText("Apex Dental Clinic").filter({ visible: true }).first().click();
    const fuCard = page.locator(".lf-drawer-followups-card");
    await fuCard.scrollIntoViewIfNeeded();
    await expect(fuCard.getByText("Initial Discovery Call")).toBeVisible();

    // Click edit button on the item
    const item = fuCard.locator("[data-testid='followup-item-101']");
    await item.locator("button[aria-label='Edit follow-up']").click();

    // Update title
    const editInput = item.locator("input[aria-label='Edit follow-up title']");
    await editInput.clear();
    await editInput.fill("Updated Discovery Call Agenda");

    // Save
    await item.locator("button:has-text('Save')").click();

    // Verify updated title
    await expect(fuCard.getByText("Updated Discovery Call Agenda")).toBeVisible();
  });

  test("can mark follow-up as complete and cancel it", async ({ page }) => {
    await page.getByText("Apex Dental Clinic").filter({ visible: true }).first().click();
    const fuCard = page.locator(".lf-drawer-followups-card");
    await fuCard.scrollIntoViewIfNeeded();

    const item = fuCard.locator("[data-testid='followup-item-101']");

    // Mark complete
    await item.locator("button[aria-label='Complete follow-up']").click();

    // Item should now display Completed badge
    await expect(item.getByText("Completed", { exact: true })).toBeVisible();

    // Cancel the other task
    const item2 = fuCard.locator("[data-testid='followup-item-102']");
    await item2.locator("button[aria-label='Cancel follow-up']").click();
    await expect(item2.getByText("Cancelled", { exact: true })).toBeVisible();
  });

  test("can delete a follow-up with confirmation", async ({ page }) => {
    await page.getByText("Apex Dental Clinic").filter({ visible: true }).first().click();
    const fuCard = page.locator(".lf-drawer-followups-card");
    await fuCard.scrollIntoViewIfNeeded();

    const item = fuCard.locator("[data-testid='followup-item-101']");

    // Click delete button
    await item.locator("button[aria-label='Delete follow-up']").click();

    // Ant Design popconfirm appears
    await expect(page.locator(".ant-popconfirm")).toBeVisible();
    await page.locator(".ant-popconfirm button:has-text('Delete')").click();

    // Item should be gone
    await expect(fuCard.getByText("Initial Discovery Call")).not.toBeVisible();
  });

  test("verifies cross-business cache isolation when switching leads in drawer", async ({ page }) => {
    // Open Business 1
    await page.getByText("Apex Dental Clinic").filter({ visible: true }).first().click();
    const drawer = page.locator(".lf-drawer");
    await expect(drawer).toBeVisible();
    const fuCard1 = drawer.locator(".lf-drawer-followups-card");
    await fuCard1.scrollIntoViewIfNeeded();

    await expect(fuCard1.getByText("Initial Discovery Call")).toBeVisible();
    await expect(fuCard1.getByText("Legal Contract Review Follow-up")).not.toBeVisible();

    // Close drawer
    await drawer.locator(".ant-drawer-close").click();
    await expect(drawer).not.toBeVisible();

    // Open Business 2
    await page.getByText("Zenith Law Firm").filter({ visible: true }).first().click();
    await expect(drawer).toBeVisible();
    const fuCard2 = drawer.locator(".lf-drawer-followups-card");
    await fuCard2.scrollIntoViewIfNeeded();

    await expect(fuCard2.getByText("Legal Contract Review Follow-up")).toBeVisible();
    await expect(fuCard2.getByText("Initial Discovery Call")).not.toBeVisible();
  });

  test("supports filtering follow-ups by status chips", async ({ page }) => {
    await page.getByText("Apex Dental Clinic").filter({ visible: true }).first().click();
    const fuCard = page.locator(".lf-drawer-followups-card");
    await fuCard.scrollIntoViewIfNeeded();

    // Click 'completed' filter
    await fuCard.locator("button:has-text('completed')").click();

    // Initial tasks are pending, so completed list is empty
    await expect(fuCard.getByText("No follow-ups found for this filter.")).toBeVisible();

    // Switch back to 'all'
    await fuCard.locator("button:has-text('all')").click();
    await expect(fuCard.getByText("Initial Discovery Call")).toBeVisible();
  });
});
