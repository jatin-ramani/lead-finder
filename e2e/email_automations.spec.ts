import { expect, test, type Page, type Request } from "@playwright/test";
import type {
  CityAutomationListResponse,
  CityAutomationReportResponse,
  CityGradeStatsResponse,
  CityStatListResponse,
  GmailStatusResponse,
  MasterTemplateResponse,
  SupportedVariable,
} from "@/types/api";
import { authenticatePlaywright } from "./support/auth";

const FIXTURE_TIME = "2026-09-11T10:00:00Z";

const cities: CityStatListResponse = {
  success: true,
  items: [
    { city: "Ahmedabad", total_leads: 248, eligible_leads: 221, ineligible_leads: 27, already_sent_leads: 15 },
    { city: "Surat", total_leads: 143, eligible_leads: 139, ineligible_leads: 4, already_sent_leads: 7 },
  ],
};

const cityStats: Record<string, CityGradeStatsResponse> = {
  Ahmedabad: {
    success: true,
    city: "Ahmedabad",
    total_leads: 248,
    email_eligible_leads: 221,
    ineligible_leads: 27,
    already_sent_leads: 15,
    grades: {
      A: { total: 42, eligible: 40, ineligible: 2, already_sent: 3 },
      B: { total: 86, eligible: 80, ineligible: 6, already_sent: 6 },
      C: { total: 91, eligible: 76, ineligible: 15, already_sent: 4 },
      D: { total: 29, eligible: 25, ineligible: 4, already_sent: 2 },
    },
  },
  Surat: {
    success: true,
    city: "Surat",
    total_leads: 143,
    email_eligible_leads: 139,
    ineligible_leads: 4,
    already_sent_leads: 7,
    grades: {
      A: { total: 30, eligible: 29, ineligible: 1, already_sent: 2 },
      B: { total: 53, eligible: 52, ineligible: 1, already_sent: 3 },
      C: { total: 40, eligible: 39, ineligible: 1, already_sent: 1 },
      D: { total: 20, eligible: 19, ineligible: 1, already_sent: 1 },
    },
  },
};

const gmailStatus: GmailStatusResponse = {
  success: true,
  is_configured: true,
  is_connected: true,
  email_address: "outreach@example.test",
  daily_send_count: 15,
  daily_quota_limit: 400,
  daily_quota_remaining: 385,
  token_expiry: "2026-09-12T10:00:00Z",
};

const variables: SupportedVariable[] = [
  { key: "business_name", label: "Business Name", description: "CRM business name" },
  { key: "contact_name", label: "Contact Name", description: "Known contact name" },
  { key: "city", label: "City", description: "Business city" },
  { key: "lead_score", label: "Lead Score", description: "Lead score" },
];

function masterTemplate(city: string): MasterTemplateResponse {
  return {
    success: true,
    city,
    data: {
      name: `Universal Master Cold Email — ${city}`,
      subject: "Quick idea for {{Business Name}}",
      body: `<p>Hello {{Contact Name}},</p><p>I found {{Business Name}} in {{City}}.</p>`,
      variables: ["business_name", "contact_name", "city"],
    },
  };
}

const report: CityAutomationReportResponse = {
  success: true,
  message: "Automation launched successfully",
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
    skipped_count: 0,
    percentage: 100,
    created_at: FIXTURE_TIME,
    completed_at: FIXTURE_TIME,
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
        business_id: 1,
        business_name: "Ahmedabad Prime Dental",
        recipient_email: "contact@prime-dental.example",
        lead_grade: "A",
        status: "sent",
        sent_at: FIXTURE_TIME,
      },
      {
        id: 2,
        business_id: 2,
        business_name: "Gujarat Auto Hub",
        recipient_email: "info@auto-hub.example",
        lead_grade: "B",
        status: "failed",
        error_message: "Mailbox rejected the delivery",
      },
    ],
  },
};

const runs: CityAutomationListResponse = {
  success: true,
  total: 2,
  page: 1,
  page_size: 50,
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
      created_at: FIXTURE_TIME,
      completed_at: FIXTURE_TIME,
    },
    {
      id: 100,
      name: "Email Automation — Surat",
      city: "Surat",
      status: "completed",
      recipient_count: 139,
      sent_count: 136,
      failed_count: 3,
      created_at: "2026-09-10T10:00:00Z",
      completed_at: "2026-09-10T10:00:00Z",
    },
  ],
};

/**
 * Tests must work both when local development talks to the backend directly
 * and when the browser uses Next's same-origin `/api` proxy.
 */
function apiPath(request: Request): string | null {
  const url = new URL(request.url());
  if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
    return url.pathname.slice("/api".length) || "/";
  }

  const isLocalBackend =
    (url.hostname === "127.0.0.1" || url.hostname === "localhost") &&
    url.port === "8000";
  return isLocalBackend ? url.pathname : null;
}

async function mockCityAutomationRoutes(page: Page) {
  await page.route("**/*", async (route) => {
    const request = route.request();
    const pathname = apiPath(request);
    if (!pathname) {
      await route.continue();
      return;
    }

    const method = request.method();
    const url = new URL(request.url());

    if (pathname === "/auth/me") {
      await route.fulfill({ json: { authenticated: true, role: "admin", user: "admin@test" } });
      return;
    }

    if (pathname === "/health") {
      await route.fulfill({
        json: { status: "healthy", database: "connected", timestamp: FIXTURE_TIME },
      });
      return;
    }

    if (pathname === "/integrations/gmail/status" && method === "GET") {
      await route.fulfill({ json: gmailStatus });
      return;
    }

    if (pathname === "/automations/cities" && method === "GET") {
      await route.fulfill({ json: cities });
      return;
    }

    if (pathname === "/automations/city-stats" && method === "GET") {
      await route.fulfill({ json: cityStats[url.searchParams.get("city") || "Ahmedabad"] });
      return;
    }

    if (pathname === "/automations/master-template" && method === "GET") {
      await route.fulfill({ json: masterTemplate(url.searchParams.get("city") || "Ahmedabad") });
      return;
    }

    if (pathname === "/automations/variables" && method === "GET") {
      await route.fulfill({ json: variables });
      return;
    }

    if (pathname === "/automations/start-city-automation" && method === "POST") {
      await route.fulfill({ status: 201, json: report });
      return;
    }

    if (pathname === "/automations/runs/101" && method === "GET") {
      await route.fulfill({ json: report });
      return;
    }

    if (pathname === "/automations/runs" && method === "GET") {
      await route.fulfill({ json: runs });
      return;
    }

    if (pathname === "/automations/export-mobile-numbers" && method === "GET") {
      await route.fulfill({
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers: {
          "Access-Control-Expose-Headers": "Content-Disposition",
          "Content-Disposition": 'attachment; filename="Ahmedabad-mobile-numbers.xlsx"',
        },
        body: Buffer.from("PK\x03\x04mock-xlsx"),
      });
      return;
    }

    await route.fulfill({ status: 404, json: { success: false, message: `Unhandled mock route: ${pathname}` } });
  });
}

test.describe("City-first Email Automation workspace", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem("leadfinder_active_automation_id"));
    await mockCityAutomationRoutes(page);
    await authenticatePlaywright(page.context());
  });

  test("shows Gmail delivery, city audience, and an editable universal template", async ({ page }) => {
    await page.goto("/automations");

    await expect(page.getByRole("heading", { name: "Email Automation", level: 1 })).toBeVisible();
    await expect(page.getByText("Gmail API Delivery", { exact: true })).toBeVisible();
    const gmailDeliveryBanner = page.locator(".ant-card").filter({ has: page.getByText("Gmail API Delivery", { exact: true }) });
    await expect(gmailDeliveryBanner.getByText("Connected", { exact: true })).toBeVisible();
    await expect(page.getByText("outreach@example.test")).toBeVisible();
    await expect(page.getByText("15 / 400 sent")).toBeVisible();

    await expect(page.getByText("Step 1: Select City & Review Lead Audience")).toBeVisible();
    await expect(page.getByText("Email-Eligible Leads", { exact: true })).toBeVisible();
    await expect(page.getByText("221", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("15 leads in Ahmedabad have already been emailed and are excluded from this automation.")).toBeVisible();
    await expect(page.getByText("Grade A Leads")).toBeVisible();

    const citySelector = page.getByRole("combobox").first();
    await citySelector.click();
    await citySelector.press("ArrowDown");
    await citySelector.press("Enter");
    await expect(page.getByText("139", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Universal Master Cold Email — Surat")).toBeVisible();

    await expect(page.getByText("Step 2: Universal Master Cold Email")).toBeVisible();
    const editButton = page.getByRole("button", { name: "Preview / Edit" });
    await editButton.click();

    const modal = page.locator(".ant-modal");
    await expect(modal.getByText(/Edit Cold Email Template/)).toBeVisible();
    await expect(modal.getByText("Allowlisted Template Variables:")).toBeVisible();
    await modal.getByRole("tab", { name: /Live Sample Preview/ }).click();
    await expect(modal.getByText("Sample Preview for Grade")).toBeVisible();

    await modal.getByRole("tab", { name: /Template Content/ }).click();
    await modal.locator("input#subject").fill("A better website for {{Business Name}}");
    await modal.getByRole("button", { name: "Save Template" }).click();
    await expect(page.getByText("A better website for {{Business Name}}")).toBeVisible();
  });

  test("launches the selected city, shows its report, and preserves report history", async ({ page }) => {
    await page.goto("/automations");

    const launchRequest = page.waitForRequest(
      (request) => apiPath(request) === "/automations/start-city-automation" && request.method() === "POST",
    );
    await page.getByRole("button", { name: "Start Automation" }).first().click();

    const confirmation = page.locator(".ant-modal");
    await expect(confirmation.getByText("Review & Start Email Automation")).toBeVisible();
    await expect(confirmation.getByText("221 Eligible Leads")).toBeVisible();
    await expect(confirmation.getByText("Universal (All Grades)")).toBeVisible();
    await confirmation.locator(".ant-modal-footer").getByRole("button", { name: "Start Automation" }).click();

    const request = await launchRequest;
    expect(request.postDataJSON()).toMatchObject({
      city: "Ahmedabad",
      template: { subject: "Quick idea for {{Business Name}}" },
    });

    await expect(page.getByText("Ahmedabad Email Automation")).toBeVisible();
    await expect(page.getByText("Emails Sent", { exact: true })).toBeVisible();
    await expect(page.getByText("215", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Recipient Dispatch Logs")).toBeVisible();

    await page.getByRole("button", { name: "Start New City Run" }).click();
    await page.getByRole("button", { name: "Previous Automations" }).click();
    const history = page.locator(".ant-drawer");
    await expect(history.getByText("Automation History & Reports")).toBeVisible();
    await expect(history.getByText("Ahmedabad Automation")).toBeVisible();
    await expect(history.getByText("Surat Automation")).toBeVisible();
  });

  test("keeps city export usable without horizontal overflow at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/automations");

    await expect(page.getByText("Email Automation").first()).toBeVisible();
    const exportButton = page.getByRole("button", { name: "Export Mobile Numbers" }).first();
    await expect(exportButton).toBeVisible();
    const downloadPromise = page.waitForEvent("download");
    await exportButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("Ahmedabad-mobile-numbers.xlsx");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
});