import { expect, test, type Page } from "@playwright/test";
import type {
  CityGradeStatsResponse,
  CityStatListResponse,
  GmailAuthUrlResponse,
  GmailStatusResponse,
  GmailTestSendResponse,
} from "@/types/api";
import { authenticatePlaywright } from "./support/auth";

const mockCitiesResponse: CityStatListResponse = {
  success: true,
  items: [
    { city: "Ahmedabad", total_leads: 248, eligible_leads: 221, ineligible_leads: 27 },
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

const mockGmailConnected: GmailStatusResponse = {
  success: true,
  is_configured: true,
  is_connected: true,
  email_address: "outreach.leadfinder@gmail.com",
  daily_send_count: 15,
  daily_quota_limit: 400,
  daily_quota_remaining: 385,
  token_expiry: "2026-09-08T18:00:00Z",
};

const mockGmailDisconnected: GmailStatusResponse = {
  success: true,
  is_configured: true,
  is_connected: false,
  email_address: null,
  daily_send_count: 0,
  daily_quota_limit: 400,
  daily_quota_remaining: 400,
  token_expiry: null,
};

async function setupMockRoutes(
  page: Page,
  gmailStatus: GmailStatusResponse = mockGmailConnected,
  testSendResponse?: GmailTestSendResponse,
) {
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

    if (pathname === "/automations/runs" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          items: [],
          total: 0,
          page: 1,
          page_size: 20,
          total_pages: 0,
        }),
      });
      return;
    }

    if (pathname === "/integrations/gmail/status" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(gmailStatus),
      });
      return;
    }

    if (pathname === "/integrations/gmail/auth-url" && method === "GET") {
      const authResp: GmailAuthUrlResponse = {
        success: true,
        auth_url: "https://accounts.google.com/o/oauth2/v2/auth?mock=true",
        state: "mock_csrf_state_token",
        redirect_uri: "http://localhost:8000/integrations/gmail/callback",
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(authResp),
      });
      return;
    }

    if (pathname === "/integrations/gmail/test-send" && method === "POST") {
      const defaultSendResult: GmailTestSendResponse = {
        success: true,
        recipient_email: "test.verifier@example.com",
        total: 1,
        sent: 1,
        failed: 0,
        skipped: 0,
        results: [
          {
            grade: "Universal",
            status: "sent",
            subject: "[TEST] Quick idea for Test Business",
            message_id: "gmail_msg_101",
            sent_at: "2026-09-08T14:30:00Z",
          },
        ],
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(testSendResponse || defaultSendResult),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });
}

test.describe("Lead Finder — Phase 4 Gmail Test Email Verification", () => {
  test.beforeEach(async ({ context }) => {
    await authenticatePlaywright(context);
  });

  test("1. Renders Test Email Verification section in Email Automations view", async ({ page }) => {
    await setupMockRoutes(page, mockGmailDisconnected);
    await page.goto("/automations");

    await expect(page.getByText("Test Email Sending")).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByText("Verify live Gmail API delivery with safe sample variables using the Universal Master Cold Email")
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Send Test Email" })).toBeVisible();
  });

  test("2. Disables send action and shows warning when Gmail account is disconnected", async ({ page }) => {
    await setupMockRoutes(page, mockGmailDisconnected);
    await page.goto("/automations");

    await expect(page.getByText("Gmail Not Connected")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: "Connect Gmail First" })).toBeVisible();
    const sendBtn = page.getByRole("button", { name: "Send Test Email" });
    await expect(sendBtn).toBeDisabled();
  });

  test("3. Enables send action when connected and validates destination email format", async ({ page }) => {
    await setupMockRoutes(page, mockGmailConnected);
    await page.goto("/automations");

    const emailInput = page.getByPlaceholder("e.g. yourname@example.com");
    await expect(emailInput).toBeVisible({ timeout: 10_000 });

    // Enter invalid email
    await emailInput.fill("invalid-email-string");
    const sendBtn = page.getByRole("button", { name: "Send Test Email" }).first();
    await sendBtn.click();
    await expect(page.getByText("Please enter a valid email address")).toBeVisible();

    // Enter valid email
    await emailInput.fill("test.verifier@example.com");
    await expect(page.getByText("Please enter a valid email address")).not.toBeVisible();

    // Verify Active Template display
    await expect(page.getByText("Universal Master").first()).toBeVisible();
    await expect(page.getByText("Quick idea for {{Business Name}}").first()).toBeVisible();
  });

  test("4. Opens confirmation modal with quota warning and executes successful test send", async ({
    page,
  }) => {
    await setupMockRoutes(page, mockGmailConnected);
    await page.goto("/automations");
    await expect(page.getByText("Test Email Sending")).toBeVisible({ timeout: 10_000 });

    const emailInput = page.getByPlaceholder("e.g. yourname@example.com");
    await emailInput.fill("test.verifier@example.com");

    const sendBtn = page.getByRole("button", { name: "Send Test Email" }).first();
    await sendBtn.click();

    // Check confirmation modal
    await expect(page.getByText("Confirm Test Email Send")).toBeVisible();
    await expect(page.getByText("test.verifier@example.com")).toBeVisible();
    await expect(page.getByText("Daily Safety Quota Notice")).toBeVisible();

    // Confirm send
    const modalConfirmBtn = page.locator(".ant-modal-footer").getByRole("button", { name: /Send Test Email/i });
    await modalConfirmBtn.click();

    // Check result display
    await expect(page.getByText("Test Summary:")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("Total: 1")).toBeVisible();
    await expect(page.getByText("Sent: 1")).toBeVisible();
    await expect(page.getByText("ID: gmail_msg_101")).toBeVisible();
  });

  test("5. Displays partial failures and quota limit reached appropriately", async ({ page }) => {
    const mockPartialResult: GmailTestSendResponse = {
      success: false,
      recipient_email: "test.verifier@example.com",
      total: 1,
      sent: 0,
      failed: 1,
      skipped: 0,
      results: [
        {
          grade: "Universal",
          status: "failed",
          subject: "[TEST] Quick idea for Test Business",
          error: "Gmail API 429: Rate limit exceeded",
        },
      ],
    };

    await setupMockRoutes(page, mockGmailConnected, mockPartialResult);
    await page.goto("/automations");
    const emailInput = page.getByPlaceholder("e.g. yourname@example.com");
    await emailInput.fill("test.verifier@example.com");

    const sendBtn = page.getByRole("button", { name: "Send Test Email" }).first();
    await sendBtn.click();

    const modalConfirmBtn = page.locator(".ant-modal-footer").getByRole("button", { name: /Send Test Email/i });
    await modalConfirmBtn.click();

    await expect(page.getByText("Test Summary:")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("Total: 1")).toBeVisible();
    await expect(page.getByText("Failed: 1")).toBeVisible();
    await expect(page.getByText("Gmail API 429: Rate limit exceeded")).toBeVisible();
  });
});
