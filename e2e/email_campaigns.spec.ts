import { expect, test, type Page } from "@playwright/test";
import type {
  CampaignListResponse,
  CampaignRecipientListResponse,
  CampaignSingleResponse,
  EmailCampaign,
  EmailCampaignRecipient,
  EmailTemplate,
  RecipientPreviewResponse,
  TemplateListResponse,
} from "@/types/api";
import { authenticatePlaywright } from "./support/auth";

let mockTemplates: EmailTemplate[] = [];
let mockCampaigns: EmailCampaign[] = [];
let mockRecipients: EmailCampaignRecipient[] = [];
let nextCampaignId = 10;

async function mockCampaignRoutes(page: Page) {
  await page.route("**/*", async (route) => {
    const request = route.request();
    const urlString = request.url();
    if (!urlString.includes("8000") && !urlString.includes("/api/")) {
      await route.continue();
      return;
    }

    const url = new URL(urlString);
    let pathname = url.pathname;
    if (pathname.startsWith("/api/")) {
      pathname = pathname.replace(/^\/api/, "");
    }
    const method = request.method();

    if (pathname === "/auth/me") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ authenticated: true, role: "admin", user: "admin@test" }),
      });
      return;
    }

    // Templates endpoints
    if (pathname === "/templates" && method === "GET") {
      const response: TemplateListResponse = {
        success: true,
        total: mockTemplates.length,
        page: 1,
        page_size: 100,
        total_pages: 1,
        items: mockTemplates,
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
      return;
    }

    // Preview recipients
    if (pathname === "/campaigns/preview-recipients" && method === "POST") {
      const response: RecipientPreviewResponse = {
        success: true,
        total_eligible_leads: 2,
        sample_leads: [
          {
            id: 301,
            name: "Lone Star Dental",
            email: "lonestar@example.com",
            city: "Austin",
            category: "Dentist",
            lead_grade: "A",
            lead_score: 85,
            lead_status: "New",
          },
          {
            id: 302,
            name: "Downtown Smiles",
            email: "downtown@example.com",
            city: "Austin",
            category: "Dentist",
            lead_grade: "A",
            lead_score: 90,
            lead_status: "New",
          },
        ],
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
      return;
    }

    // Process due campaigns
    if (pathname === "/campaigns/process-due" && method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          campaigns_processed: 1,
          recipients_sent: 3,
          recipients_failed: 0,
          campaigns_completed: 1,
        }),
      });
      return;
    }

    // Single campaign detail
    const singleMatch = pathname.match(/^\/campaigns\/(\d+)$/);
    if (singleMatch) {
      const id = parseInt(singleMatch[1], 10);
      if (method === "GET") {
        const found = mockCampaigns.find((c) => c.id === id);
        if (!found) {
          await route.fulfill({
            status: 404,
            contentType: "application/json",
            body: JSON.stringify({ detail: "Campaign not found" }),
          });
          return;
        }
        const response: CampaignSingleResponse = {
          success: true,
          data: found,
        };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(response),
        });
        return;
      }

      if (method === "DELETE") {
        mockCampaigns = mockCampaigns.filter((c) => c.id !== id);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, message: "Campaign deleted" }),
        });
        return;
      }
    }

    // Campaign actions: start, cancel
    const startMatch = pathname.match(/^\/campaigns\/(\d+)\/start$/);
    if (startMatch && method === "POST") {
      const id = parseInt(startMatch[1], 10);
      const camp = mockCampaigns.find((c) => c.id === id);
      if (camp) {
        camp.status = "running";
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Campaign started",
          campaign_id: id,
          recipient_count: 5,
          sent_count: 5,
          failed_count: 0,
        }),
      });
      return;
    }

    const cancelMatch = pathname.match(/^\/campaigns\/(\d+)\/cancel$/);
    if (cancelMatch && method === "POST") {
      const id = parseInt(cancelMatch[1], 10);
      const camp = mockCampaigns.find((c) => c.id === id);
      if (camp) {
        camp.status = "cancelled";
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Campaign cancelled",
          campaign_id: id,
        }),
      });
      return;
    }

    // Campaign recipients
    const recipientsMatch = pathname.match(/^\/campaigns\/(\d+)\/recipients$/);
    if (recipientsMatch && method === "GET") {
      const id = parseInt(recipientsMatch[1], 10);
      const filtered = mockRecipients.filter((r) => r.campaign_id === id);
      const response: CampaignRecipientListResponse = {
        success: true,
        total: filtered.length,
        page: 1,
        page_size: 10,
        total_pages: 1,
        items: filtered,
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
      return;
    }

    // Campaigns list
    if (pathname === "/campaigns" && method === "GET") {
      const statusParam = url.searchParams.get("status");
      const searchParam = url.searchParams.get("search")?.toLowerCase();

      let filtered = [...mockCampaigns];
      if (statusParam) {
        filtered = filtered.filter((c) => c.status === statusParam);
      }
      if (searchParam) {
        filtered = filtered.filter(
          (c) =>
            c.name.toLowerCase().includes(searchParam) ||
            c.description?.toLowerCase().includes(searchParam) ||
            c.template_name?.toLowerCase().includes(searchParam)
        );
      }

      const response: CampaignListResponse = {
        success: true,
        total: filtered.length,
        page: 1,
        page_size: 10,
        total_pages: 1,
        items: filtered,
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
      return;
    }

    // Create Campaign
    if (pathname === "/campaigns" && method === "POST") {
      const body = request.postDataJSON();
      const newCampaign: EmailCampaign = {
        id: ++nextCampaignId,
        name: body.name,
        description: body.description || null,
        status: body.scheduled_at ? "scheduled" : "draft",
        template_id: body.template_id,
        template_name: mockTemplates.find((t) => t.id === body.template_id)?.name || "Selected Template",
        filter_criteria: body.filter_criteria || {},
        recipient_count: 2,
        sent_count: 0,
        failed_count: 0,
        scheduled_at: body.scheduled_at || null,
        started_at: null,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockCampaigns.unshift(newCampaign);
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: newCampaign }),
      });
      return;
    }

    await route.continue();
  });
}

test.describe("Email Campaigns Feature", () => {
  test.beforeEach(async ({ page }) => {
    mockTemplates = [
      {
        id: 1,
        name: "Cold Dental Outreach",
        description: "Introductory email for newly scanned clinics",
        subject: "Growth opportunity for {{business_name}}",
        body: "Hi {{contact_name}},\n\nWe saw {{business_name}} is expanding.",
        is_archived: false,
        created_at: "2026-09-08T10:00:00Z",
        updated_at: "2026-09-08T10:00:00Z",
      },
      {
        id: 2,
        name: "Follow-up Presentation",
        description: "Follow-up pitch for qualified prospects",
        subject: "Audit review for {{business_name}}",
        body: "Hi,\n\nFollowing up on our website audit for {{business_name}}.",
        is_archived: false,
        created_at: "2026-09-08T10:00:00Z",
        updated_at: "2026-09-08T10:00:00Z",
      },
    ];

    mockCampaigns = [
      {
        id: 1,
        name: "Q3 Dental Outreach Blitz",
        description: "Cold outreach to Austin dental clinics",
        status: "completed",
        template_id: 1,
        template_name: "Cold Dental Outreach",
        filter_criteria: { city: "Austin", lead_status: "New" },
        recipient_count: 5,
        sent_count: 4,
        failed_count: 1,
        scheduled_at: null,
        started_at: "2026-09-08T10:00:00Z",
        completed_at: "2026-09-08T10:05:00Z",
        created_at: "2026-09-08T09:30:00Z",
        updated_at: "2026-09-08T10:05:00Z",
      },
      {
        id: 2,
        name: "Denver Medical Follow-up",
        description: "Scheduled follow-up campaign",
        status: "scheduled",
        template_id: 2,
        template_name: "Follow-up Presentation",
        filter_criteria: { city: "Denver" },
        recipient_count: 3,
        sent_count: 0,
        failed_count: 0,
        scheduled_at: "2026-09-10T15:00:00Z",
        started_at: null,
        completed_at: null,
        created_at: "2026-09-08T10:10:00Z",
        updated_at: "2026-09-08T10:10:00Z",
      },
    ];

    mockRecipients = [
      {
        id: 101,
        campaign_id: 1,
        business_id: 201,
        business_name: "Austin Smiles Clinic",
        recipient_email: "austin.smiles@example.com",
        recipient_name: "Dr. Austin",
        status: "sent",
        attempt_count: 1,
        sent_at: "2026-09-08T10:01:00Z",
        attempted_at: "2026-09-08T10:01:00Z",
        error_message: null,
        provider_message_id: "mock-msg-101",
        created_at: "2026-09-08T09:35:00Z",
        updated_at: "2026-09-08T10:01:00Z",
      },
      {
        id: 102,
        campaign_id: 1,
        business_id: 202,
        business_name: "Hill Country Dental",
        recipient_email: "invalid-email@example",
        recipient_name: "Dr. Hill",
        status: "failed",
        attempt_count: 1,
        sent_at: null,
        attempted_at: "2026-09-08T10:02:00Z",
        error_message: "SMTP 550 Mailbox not found",
        provider_message_id: null,
        created_at: "2026-09-08T09:35:00Z",
        updated_at: "2026-09-08T10:02:00Z",
      },
    ];

    nextCampaignId = 10;

    await mockCampaignRoutes(page);
    await authenticatePlaywright(page.context());
  });

  test("displays email campaigns list with KPI statistics", async ({ page }) => {
    await page.goto("/campaigns");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: "Email Campaigns", exact: true })).toBeVisible();

    // Check KPI Cards
    await expect(page.getByText("Total Campaigns")).toBeVisible();
    await expect(page.getByText("Active / Running")).toBeVisible();
    await expect(page.getByText("Emails Sent")).toBeVisible();
    await expect(page.getByText("Delivery Success Rate")).toBeVisible();

    // Check campaign table rows
    await expect(page.getByText("Q3 Dental Outreach Blitz")).toBeVisible();
    await expect(page.getByText("Denver Medical Follow-up")).toBeVisible();
  });

  test("filters campaigns by status tab and search input", async ({ page }) => {
    await page.goto("/campaigns");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Q3 Dental Outreach Blitz")).toBeVisible();

    // Filter by Scheduled
    const scheduledTab = page.locator(".ant-segmented-item").filter({ hasText: "Scheduled" });
    await scheduledTab.click();
    await expect(page.getByText("Denver Medical Follow-up")).toBeVisible();

    // Search filter
    await page.getByPlaceholder("Search campaigns by name...").fill("Denver");
    await expect(page.getByText("Denver Medical Follow-up")).toBeVisible();
  });

  test("creates a new email campaign via multi-step wizard", async ({ page }) => {
    await page.goto("/campaigns");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /New Campaign/i }).click({ force: true });
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    // Step 0: Campaign Details
    await expect(modal.getByText("New Email Campaign Wizard")).toBeVisible();
    await modal.locator("input#name").fill("Austin Ortho Campaign");
    
    // Select template
    await modal.locator(".ant-select").click();
    await page.locator(".ant-select-item-option-content").filter({ hasText: "Cold Dental Outreach" }).click();

    // Next Step -> Audience Filters
    await modal.getByRole("button", { name: "Next" }).click({ force: true });
    await expect(modal.locator("input#city")).toBeVisible();
    await modal.locator("input#city").fill("Austin");

    // Next Step -> Schedule & Audience Preview
    await modal.getByRole("button", { name: "Next" }).click({ force: true });
    await expect(modal.getByText("Eligible Recipients Found")).toBeVisible();

    // Next Step -> Review & Launch
    await modal.getByRole("button", { name: "Next" }).click({ force: true });
    await expect(modal.getByText("Ready for Launch")).toBeVisible();

    // Submit / Launch Campaign
    await modal.getByRole("button", { name: "Launch Campaign" }).click({ force: true });

    // Wizard closes and new campaign appears in table
    await expect(page.getByText("Austin Ortho Campaign")).toBeVisible();
  });

  test("opens campaign detail drawer and views recipient logs", async ({ page }) => {
    await page.goto("/campaigns");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Q3 Dental Outreach Blitz")).toBeVisible();

    // Click View Details (first action button with EyeOutlined in table)
    const row = page.locator("tr").filter({ hasText: "Q3 Dental Outreach Blitz" });
    const viewBtn = row.locator(".ant-btn").first();
    await viewBtn.scrollIntoViewIfNeeded();
    await viewBtn.click({ force: true });

    // Drawer opens
    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText("Q3 Dental Outreach Blitz")).toBeVisible();
    await expect(drawer.getByText("Execution Progress")).toBeVisible();
    await expect(drawer.getByText("Recipient Dispatch Logs")).toBeVisible();

    // Check recipient log records
    await expect(drawer.getByText("Austin Smiles Clinic")).toBeVisible();
    await expect(drawer.getByText("austin.smiles@example.com")).toBeVisible();
    await expect(drawer.getByText("Hill Country Dental")).toBeVisible();
    await expect(drawer.getByText("SMTP 550 Mailbox not found")).toBeVisible();
  });

  test("cancels a scheduled campaign from the table action", async ({ page }) => {
    await page.goto("/campaigns");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Denver Medical Follow-up")).toBeVisible();

    // Click Cancel on Denver Medical Follow-up row
    const row = page.locator("tr").filter({ hasText: "Denver Medical Follow-up" });
    const cancelBtn = row.locator("button:has(.anticon-stop)");
    await cancelBtn.scrollIntoViewIfNeeded();
    await cancelBtn.click({ force: true });

    const popconfirm = page.locator(".ant-popconfirm, .ant-popover");
    await expect(popconfirm).toBeVisible();
    const okBtn = popconfirm.locator(".ant-popconfirm-buttons .ant-btn-primary, .ant-popconfirm-buttons button").filter({ hasText: /Cancel Campaign/i }).first();
    await okBtn.click({ force: true });

    // Verify row displays CANCELLED status tag
    const statusTag = page.locator("tr").filter({ hasText: "Denver Medical Follow-up" }).getByText("CANCELLED");
    await statusTag.scrollIntoViewIfNeeded();
    await expect(statusTag).toBeVisible();
  });
});
