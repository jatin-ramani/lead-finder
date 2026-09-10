import { expect, test, type Page } from "@playwright/test";
import type {
  CityAutomationListResponse,
  CityAutomationReportResponse,
  CityGradeStatsResponse,
  CityStatListResponse,
  MasterTemplateResponse,
} from "@/types/api";
import { authenticatePlaywright } from "./support/auth";

const mockCitiesResponse: CityStatListResponse = {
  success: true,
  items: [
    { city: "Ahmedabad", total_leads: 248, eligible_leads: 221, ineligible_leads: 27 },
    { city: "Surat", total_leads: 143, eligible_leads: 139, ineligible_leads: 4 },
    { city: "Vadodara", total_leads: 95, eligible_leads: 88, ineligible_leads: 7 },
  ],
};

const mockAhmedabadStats: CityGradeStatsResponse = {
  success: true,
  city: "Ahmedabad",
  total_leads: 248,
  email_eligible_leads: 221,
  ineligible_leads: 27,
  grades: {
    A: { total: 42, eligible: 40, ineligible: 2 },
    B: { total: 86, eligible: 80, ineligible: 6 },
    C: { total: 91, eligible: 76, ineligible: 15 },
    D: { total: 29, eligible: 25, ineligible: 4 },
  },
};

const mockMasterTemplate: MasterTemplateResponse = {
  success: true,
  city: "Ahmedabad",
  data: {
    name: "Universal Master Cold Email — Ahmedabad",
    subject: "Quick idea for {{Business Name}}",
    body: "<p>Hi {{Contact Name}},</p>\n\n<p>I came across {{Business Name}} in {{City}}.</p>\n\n<p>We build modern websites and AI-powered systems that help businesses <strong>look more credible, capture more leads and turn visitors into customers.</strong></p>\n\n<p>These days, a website isn't just an online presence — it can become one of the strongest channels for <strong>new customers, enquiries and appointments.</strong></p>\n\n<p>Would you be interested in seeing a quick demo?</p>\n\n<p>Best,<br>\n<strong>Jatin Ramani</strong><br>\nFounder, Codebait<br>\n7861035002</p>",
    variables: ["business_name", "contact_name", "city"],
  },
};

const mockReportRunning: CityAutomationReportResponse = {
  success: true,
  data: {
    id: 101,
    name: "Email Automation — Ahmedabad",
    city: "Ahmedabad",
    status: "completed",
    recipient_count: 221,
    sent_count: 215,
    failed_count: 6,
    pending_count: 0,
    processing_count: 0,
    remaining_count: 0,
    cancelled_count: 0,
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    grade_breakdown: {
      A: { total: 40, sent: 40, failed: 0, pending: 0, cancelled: 0 },
      B: { total: 80, sent: 78, failed: 2, pending: 0, cancelled: 0 },
      C: { total: 76, sent: 72, failed: 4, pending: 0, cancelled: 0 },
      D: { total: 25, sent: 25, failed: 0, pending: 0, cancelled: 0 },
    },
    remaining_recipients: [],
    recipient_logs: [
      {
        id: 1,
        business_id: 10,
        business_name: "Ahmedabad Prime Dental",
        recipient_email: "contact@primedental.example",
        lead_grade: "A",
        status: "sent",
        error_message: null,
        sent_at: new Date().toISOString(),
      },
      {
        id: 2,
        business_id: 11,
        business_name: "Gujarat Auto Hub",
        recipient_email: "info@gujhub.example",
        lead_grade: "B",
        status: "failed",
        error_message: "SMTP 550: Mailbox quota exceeded",
        sent_at: null,
      },
    ],
  },
};

const mockRunsList: CityAutomationListResponse = {
  success: true,
  total: 2,
  page: 1,
  page_size: 20,
  total_pages: 1,
  items: [
    {
      id: 101,
      name: "Email Automation — Ahmedabad",
      city: "Ahmedabad",
      status: "completed",
      recipient_count: 221,
      sent_count: 215,
      failed_count: 6,
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    },
    {
      id: 100,
      name: "Email Automation — Surat",
      city: "Surat",
      status: "completed",
      recipient_count: 139,
      sent_count: 135,
      failed_count: 4,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      completed_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
};

async function mockCityAutomationRoutes(page: Page) {
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
        body: JSON.stringify({ authenticated: true, role: "admin", user: "admin@test" }),
      });
      return;
    }

    if (pathname === "/integrations/gmail/status" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          is_connected: true,
          email: "connected@example.com",
          daily_quota_used: 10,
          daily_quota_limit: 400,
        }),
      });
      return;
    }

    if (pathname === "/automations/cities" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockCitiesResponse),
      });
      return;
    }

    if (pathname === "/automations/city-stats" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockAhmedabadStats),
      });
      return;
    }

    if (pathname === "/automations/master-template" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockMasterTemplate),
      });
      return;
    }

    if (pathname === "/automations/variables" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { key: "business_name", label: "Business Name", description: "Company name" },
          { key: "contact_name", label: "Contact Name", description: "Contact name" },
          { key: "email", label: "Email Address", description: "Email" },
          { key: "lead_status", label: "Lead Status", description: "Pipeline status" },
          { key: "lead_score", label: "Lead Score", description: "Lead qualification score" },
        ]),
      });
      return;
    }

    if (pathname === "/automations/start-city-automation" && method === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(mockReportRunning),
      });
      return;
    }

    if (pathname.startsWith("/automations/runs/") && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockReportRunning),
      });
      return;
    }

    if (pathname === "/automations/export-mobile-numbers" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers: {
          "Content-Disposition": 'attachment; filename="Ahmedabad.xlsx"',
          "Access-Control-Expose-Headers": "Content-Disposition",
        },
        body: Buffer.from("PK\x03\x04mockxlsx"),
      });
      return;
    }

    if (pathname === "/automations/runs" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRunsList),
      });
      return;
    }

    // Default fallback
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });
}

test.describe("City-First Email Automation End-to-End Workflow", () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePlaywright(page.context());
    await mockCityAutomationRoutes(page);
  });

  test("completes full workflow: City -> Leads/Grades -> Universal Master Cold Email -> Review -> Start -> Progress Report", async ({
    page,
  }) => {
    await page.goto("/automations");
    await expect(page.locator("h2")).toContainText("Email Automation");

    // 1. Step 1: City & Audience Verification
    await expect(page.getByText("Step 1: Select City & Review Lead Audience").first()).toBeVisible();
    await expect(page.getByText("Total Leads", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("248").first()).toBeVisible();
    await expect(page.getByText("Email-Eligible Leads", { exact: true })).toBeVisible();
    await expect(page.getByText("221").first()).toBeVisible();
    await expect(page.getByText("27 leads in Ahmedabad do not have a valid email address and will be safely skipped.").first()).toBeVisible();

    // Verify Grade Distribution
    await expect(page.getByText("Grade A Leads").first()).toBeVisible();
    await expect(page.getByText("Grade B Leads").first()).toBeVisible();
    await expect(page.getByText("Grade C Leads").first()).toBeVisible();
    await expect(page.getByText("Grade D Leads").first()).toBeVisible();
    await expect(page.getByText("All eligible leads receive the Universal Master Cold Email").first()).toBeVisible();

    // 2. Step 2: Universal Master Cold Email Template
    await expect(page.getByText("Step 2: Universal Master Cold Email").first()).toBeVisible();
    await expect(page.getByText("Universal Template").first()).toBeVisible();
    await expect(page.getByText("Quick idea for {{Business Name}}").first()).toBeVisible();

    // 3. Preview & Edit Master Template
    const previewEditBtn = page.getByRole("button", { name: "Preview / Edit" }).first();
    await previewEditBtn.click();
    await expect(page.getByText("Edit Cold Email Template — Ahmedabad").first()).toBeVisible();
    await expect(page.getByText("Allowlisted Template Variables:").first()).toBeVisible();

    // Test Live Preview tab in modal
    await page.getByRole("tab", { name: /Live Sample Preview/i }).click();
    await expect(page.getByText("Sample Preview for Grade").first()).toBeVisible();

    // Close modal
    await page.getByRole("button", { name: "Cancel" }).first().click();

    // 4. Step 3: Start Automation Action
    const startBtn = page.getByRole("button", { name: "Start Automation" }).first();
    await expect(startBtn).toBeEnabled();
    await startBtn.click();

    // Review Modal
    await expect(page.getByText("Review & Start Email Automation").first()).toBeVisible();
    await expect(page.getByText("221 Eligible Leads").first()).toBeVisible();
    await expect(page.getByText("Universal (All Grades)").first()).toBeVisible();

    // Confirm Start
    const confirmStartBtn = page.locator(".ant-modal-footer").getByRole("button", { name: "Start Automation" });
    await confirmStartBtn.click();

    // 5. Progress Report View
    await expect(page.getByText("Ahmedabad Email Automation").first()).toBeVisible();
    await expect(page.getByText("Completed").first()).toBeVisible();
    await expect(page.getByText("Emails Sent").first()).toBeVisible();
    await expect(page.getByText("215").first()).toBeVisible();
    await expect(page.getByText("Failed").first()).toBeVisible();
    await expect(page.getByText("6").first()).toBeVisible();

    // Verify Grade-Wise Performance Cards
    await expect(page.getByText("Grade-Wise Performance").first()).toBeVisible();
    await expect(page.getByText("Recipient Dispatch Logs").first()).toBeVisible();

    // 6. Test Previous Automations Drawer
    const startNewBtn = page.getByRole("button", { name: "Start New City Run" });
    await startNewBtn.click();
    const historyBtn = page.getByRole("button", { name: "Previous Automations" });
    await historyBtn.click();
    await expect(page.getByText("Automation History & Reports").first()).toBeVisible();
    await expect(page.getByText("Ahmedabad Automation").first()).toBeVisible();
    await expect(page.getByText("Surat Automation").first()).toBeVisible();
  });

  test("active automation displays only remaining unsent leads and decreases dynamically", async ({ page }) => {
    let pollCount = 0;

    const report1 = {
      success: true,
      data: {
        id: 101,
        name: "Email Automation — Ahmedabad",
        city: "Ahmedabad",
        status: "running",
        recipient_count: 2,
        sent_count: 0,
        failed_count: 0,
        pending_count: 2,
        processing_count: 0,
        remaining_count: 2,
        cancelled_count: 0,
        skipped_count: 0,
        percentage: 0,
        created_at: new Date().toISOString(),
        grade_breakdown: {
          A: { total: 1, sent: 0, failed: 0, pending: 1, processing: 0, cancelled: 0, skipped: 0 },
          B: { total: 1, sent: 0, failed: 0, pending: 1, processing: 0, cancelled: 0, skipped: 0 },
          C: { total: 0, sent: 0, failed: 0, pending: 0, processing: 0, cancelled: 0, skipped: 0 },
          D: { total: 0, sent: 0, failed: 0, pending: 0, processing: 0, cancelled: 0, skipped: 0 },
        },
        remaining_recipients: [
          {
            id: 101,
            business_id: 1,
            business_name: "Ahmedabad Prime Dental",
            recipient_email: "contact@primedental.example",
            lead_grade: "A",
            status: "pending",
          },
          {
            id: 102,
            business_id: 2,
            business_name: "Gujarat Auto Hub",
            recipient_email: "info@gujhub.example",
            lead_grade: "B",
            status: "pending",
          },
        ],
        recipient_logs: [],
      },
    };

    const report2 = {
      success: true,
      data: {
        id: 101,
        name: "Email Automation — Ahmedabad",
        city: "Ahmedabad",
        status: "running",
        recipient_count: 2,
        sent_count: 1,
        failed_count: 0,
        pending_count: 1,
        processing_count: 0,
        remaining_count: 1,
        cancelled_count: 0,
        skipped_count: 0,
        percentage: 50,
        created_at: new Date().toISOString(),
        grade_breakdown: {
          A: { total: 1, sent: 1, failed: 0, pending: 0, processing: 0, cancelled: 0, skipped: 0 },
          B: { total: 1, sent: 0, failed: 0, pending: 1, processing: 0, cancelled: 0, skipped: 0 },
          C: { total: 0, sent: 0, failed: 0, pending: 0, processing: 0, cancelled: 0, skipped: 0 },
          D: { total: 0, sent: 0, failed: 0, pending: 0, processing: 0, cancelled: 0, skipped: 0 },
        },
        remaining_recipients: [
          {
            id: 102,
            business_id: 2,
            business_name: "Gujarat Auto Hub",
            recipient_email: "info@gujhub.example",
            lead_grade: "B",
            status: "pending",
          },
        ],
        recipient_logs: [
          {
            id: 101,
            business_id: 1,
            business_name: "Ahmedabad Prime Dental",
            recipient_email: "contact@primedental.example",
            lead_grade: "A",
            status: "sent",
            sent_at: new Date().toISOString(),
          },
        ],
      },
    };

    await page.route("**/automations/start-city-automation", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(report1),
      });
    });

    await page.route("**/automations/runs/101", async (route) => {
      pollCount++;
      const resp = pollCount === 1 ? report1 : report2;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(resp),
      });
    });

    await page.goto("/automations");

    // Master template is ready automatically; click Start Automation
    const startActionBtn = page.getByRole("button", { name: "Start Automation" }).first();
    await startActionBtn.scrollIntoViewIfNeeded();
    await startActionBtn.click();
    const modalStartBtn = page.locator(".ant-modal-footer").getByRole("button", { name: "Start Automation" });
    await modalStartBtn.click();

    // Verify Remaining Unsent tab is active and shows initially
    await expect(page.getByText("Remaining Unsent (2)").first()).toBeVisible();
    await expect(page.getByText("Ahmedabad Prime Dental").first()).toBeVisible();
    await expect(page.getByText("Gujarat Auto Hub").first()).toBeVisible();

    // Trigger refresh / advance poll to get report2
    await page.getByRole("button", { name: "Refresh" }).first().click();

    // Now remaining is 1: Ahmedabad Prime Dental left the remaining list!
    await expect(page.getByText("Remaining Unsent (1)").first()).toBeVisible();
    await expect(page.getByText("Gujarat Auto Hub").first()).toBeVisible();
    await expect(page.getByText("Ahmedabad Prime Dental")).not.toBeVisible();

    // Delivered tab shows Ahmedabad Prime Dental
    await page.getByRole("button", { name: /Delivered \(1\)/i }).click({ force: true });
    await expect(page.getByText("Ahmedabad Prime Dental").first()).toBeVisible();
  });

  test("renders and triggers Export Mobile Numbers for selected city", async ({ page }) => {
    await page.goto("/automations");
    const exportBtn = page.getByRole("button", { name: "Export Mobile Numbers" }).first();
    await expect(exportBtn).toBeVisible({ timeout: 10_000 });

    const downloadPromise = page.waitForEvent("download");
    await exportBtn.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("Ahmedabad.xlsx");
  });

  test("renders responsively on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/automations");
    await expect(page.getByText("Email Automation").first()).toBeVisible();
    await expect(page.getByText("Step 1: Select City & Review Lead Audience").first()).toBeVisible();
  });
});
