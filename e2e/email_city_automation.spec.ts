import { expect, test, type Page } from "@playwright/test";
import type {
  AIGradeTemplatesResponse,
  AISingleTemplateResponse,
  CityAutomationListResponse,
  CityAutomationReportResponse,
  CityGradeStatsResponse,
  CityStatListResponse,
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

const mockAITemplates: AIGradeTemplatesResponse = {
  success: true,
  city: "Ahmedabad",
  data: {
    A: {
      subject: "Exclusive Growth Partnership for {{business_name}}",
      body: "Hello {{contact_name}},\n\nWe evaluated {{business_name}} in Ahmedabad and would love to propose a VIP growth collaboration.",
      rationale: "High conversion VIP messaging with deep personalization.",
    },
    B: {
      subject: "B2B Expansion Solutions for {{business_name}}",
      body: "Hi {{contact_name}},\n\nConnecting from Ahmedabad regarding your operations at {{business_name}}.",
      rationale: "Professional B2B outreach with value proposition.",
    },
    C: {
      subject: "Complimentary Digital Audit for {{business_name}}",
      body: "Hello {{contact_name}},\n\nWe reviewed {{business_name}}'s web presence and prepared an initial audit overview.",
      rationale: "Low-pressure consultative advice.",
    },
    D: {
      subject: "Quick introduction for {{business_name}}",
      body: "Hi {{contact_name}},\n\nReaching out to see if {{business_name}} is currently exploring new partnerships in Ahmedabad.",
      rationale: "Simple discovery inquiry.",
    },
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
    cancelled_count: 0,
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    grade_breakdown: {
      A: { total: 40, sent: 40, failed: 0, pending: 0, cancelled: 0 },
      B: { total: 80, sent: 78, failed: 2, pending: 0, cancelled: 0 },
      C: { total: 76, sent: 72, failed: 4, pending: 0, cancelled: 0 },
      D: { total: 25, sent: 25, failed: 0, pending: 0, cancelled: 0 },
    },
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

    if (pathname === "/automations/generate-templates" && method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockAITemplates),
      });
      return;
    }

    if (pathname === "/automations/generate-single-template" && method === "POST") {
      const singleResp: AISingleTemplateResponse = {
        success: true,
        grade: "A",
        data: {
          subject: "Updated VIP Strategy for {{business_name}}",
          body: "Hello {{contact_name}},\n\nRegenerated custom template for Grade A.",
        },
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(singleResp),
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

  test("completes full workflow: City -> Leads/Grades -> AI Templates -> Review -> Start -> Progress Report", async ({
    page,
  }) => {
    await page.goto("/automations");
    await expect(page.locator("h2")).toContainText("Email Automation");

    // 1. Step 1: City & Audience Verification
    await expect(page.getByText("Step 1: Select City & Review Lead Audience")).toBeVisible();
    await expect(page.getByText("Total Leads Found")).toBeVisible();
    await expect(page.getByText("248").first()).toBeVisible();
    await expect(page.getByText("Email-Eligible Leads")).toBeVisible();
    await expect(page.getByText("221").first()).toBeVisible();
    await expect(page.getByText("27 leads in Ahmedabad do not have a valid email address and will be safely skipped.")).toBeVisible();

    // Verify Grade Distribution
    await expect(page.getByText("Grade A").first()).toBeVisible();
    await expect(page.getByText("Grade B").first()).toBeVisible();
    await expect(page.getByText("Grade C").first()).toBeVisible();
    await expect(page.getByText("Grade D").first()).toBeVisible();

    // 2. Step 2: AI Email Templates Generation
    await expect(page.getByText("Step 2: AI Email Templates by Lead Grade")).toBeVisible();
    const generateAiBtn = page.getByRole("button", { name: /Generate with AI|Generate AI Email Templates/i }).first();
    await expect(generateAiBtn).toBeVisible();
    await generateAiBtn.click();

    // Verify templates generated for all 4 grades
    await expect(page.getByText("Grade A: VIP / High Conversion")).toBeVisible();
    await expect(page.getByText("Grade B: Professional B2B")).toBeVisible();
    await expect(page.getByText("Grade C: Consultative / Audit")).toBeVisible();
    await expect(page.getByText("Grade D: Simple Discovery")).toBeVisible();

    // 3. Preview & Edit a Grade Template
    const previewEditBtn = page.getByRole("button", { name: "Preview / Edit" }).first();
    await previewEditBtn.click();
    await expect(page.getByText("Edit Grade A Template — Ahmedabad")).toBeVisible();
    await expect(page.getByText("Allowlisted Template Variables:")).toBeVisible();

    // Test Live Preview tab in modal
    await page.getByRole("tab", { name: /Live Sample Preview/i }).click();
    await expect(page.getByText("Sample Preview for Grade A Prospect")).toBeVisible();

    // Close modal
    await page.getByRole("button", { name: "Cancel" }).click();

    // 4. Step 3: Start Automation Action
    const startBtn = page.getByRole("button", { name: "Start Automation" }).first();
    await expect(startBtn).toBeEnabled();
    await startBtn.click();

    // Review Modal
    await expect(page.getByText("Review & Start Email Automation")).toBeVisible();
    await expect(page.getByText("221 Eligible Leads")).toBeVisible();

    // Confirm Start
    const confirmStartBtn = page.locator(".ant-modal-footer").getByRole("button", { name: "Start Automation" });
    await confirmStartBtn.click();

    // 5. Progress Report View
    await expect(page.getByText("Ahmedabad Email Automation")).toBeVisible();
    await expect(page.getByText("Completed")).toBeVisible();
    await expect(page.getByText("Emails Sent")).toBeVisible();
    await expect(page.getByText("215").first()).toBeVisible();
    await expect(page.getByText("Failed").first()).toBeVisible();
    await expect(page.getByText("6").first()).toBeVisible();

    // Verify Grade-Wise Performance Cards
    await expect(page.getByText("Grade-Wise Performance")).toBeVisible();
    await expect(page.getByText("Recipient Dispatch Logs")).toBeVisible();

    // 6. Test Previous Automations Drawer
    const startNewBtn = page.getByRole("button", { name: "Start New City Run" });
    await startNewBtn.click();

    const historyBtn = page.getByRole("button", { name: "Previous Automations" });
    await historyBtn.click();
    await expect(page.getByText("Automation History & Reports")).toBeVisible();
    await expect(page.getByText("Ahmedabad Automation")).toBeVisible();
    await expect(page.getByText("Surat Automation")).toBeVisible();
  });

  test("renders responsively on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/automations");
    await expect(page.getByText("Email Automation").first()).toBeVisible();
    await expect(page.getByText("Step 1: Select City & Review Lead Audience")).toBeVisible();
  });
});
