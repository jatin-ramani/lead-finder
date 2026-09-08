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
        total: 4,
        sent: 4,
        failed: 0,
        skipped: 0,
        results: [
          {
            grade: "A",
            status: "sent",
            subject: "Exclusive Growth Partnership for Test Business",
            message_id: "gmail_msg_101",
            sent_at: "2026-09-08T14:30:00Z",
          },
          {
            grade: "B",
            status: "sent",
            subject: "B2B Expansion Solutions for Test Business",
            message_id: "gmail_msg_102",
            sent_at: "2026-09-08T14:30:01Z",
          },
          {
            grade: "C",
            status: "sent",
            subject: "Complimentary Digital Audit for Test Business",
            message_id: "gmail_msg_103",
            sent_at: "2026-09-08T14:30:02Z",
          },
          {
            grade: "D",
            status: "sent",
            subject: "Quick introduction for Test Business",
            message_id: "gmail_msg_104",
            sent_at: "2026-09-08T14:30:03Z",
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

test.describe("Gmail Test Email Sending Feature (Phase 5)", () => {
  test.beforeEach(async ({ context }) => {
    await authenticatePlaywright(context);
  });

  test("1. Renders Gmail Connected banner with quota progress and sender email", async ({ page }) => {
    await setupMockRoutes(page, mockGmailConnected);
    await page.goto("/automations");

    await expect(page.getByText("Gmail API Delivery", { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("outreach.leadfinder@gmail.com")).toBeVisible();
    await expect(page.getByText("15 / 400 sent")).toBeVisible();
    await expect(page.getByText("385 remaining today")).toBeVisible();
    await expect(page.getByRole("button", { name: /Disconnect/i })).toBeVisible();
  });

  test("2. Renders Disconnected state and prompts user to connect Gmail", async ({ page }) => {
    await setupMockRoutes(page, mockGmailDisconnected);
    await page.goto("/automations");

    await expect(page.getByText("Gmail API Delivery", { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Disconnected", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /Connect Gmail/i }).first()).toBeVisible();

    // Test Email section also shows warning
    await expect(page.getByText("Gmail Not Connected")).toBeVisible();
    await expect(page.getByRole("button", { name: /Connect Gmail First/i })).toBeVisible();
  });

  test("3. Validates recipient email input and grade selection", async ({ page }) => {
    await setupMockRoutes(page, mockGmailConnected);
    await page.goto("/automations");

    await expect(page.getByText("Test Email Sending")).toBeVisible({ timeout: 10_000 });

    const sendBtn = page.getByRole("button", { name: /Send Test Emails/i });
    await expect(sendBtn).toBeVisible();

    // Click without entering email
    await sendBtn.click();
    await expect(page.getByText("Recipient email address is required")).toBeVisible();

    // Enter invalid email format
    const emailInput = page.getByPlaceholder("e.g. yourname@example.com");
    await emailInput.fill("invalid-email-format");
    await sendBtn.click();
    await expect(page.getByText("Please enter a valid email address")).toBeVisible();

    // Enter valid email
    await emailInput.fill("test.verifier@example.com");
    await expect(page.getByText("Please enter a valid email address")).not.toBeVisible();

    // Uncheck all grade checkboxes
    const selectAllCheckbox = page.getByText("Select All");
    await selectAllCheckbox.click(); // Unchecks all

    // Send button is disabled when 0 templates are selected
    await expect(sendBtn).toBeDisabled();

    // Recheck Grade A
    await page.locator("label:has-text('Grade A')").click();
    await expect(sendBtn).toBeEnabled();
  });

  test("4. Opens confirmation modal with quota warning and executes successful test send", async ({
    page,
  }) => {
    await setupMockRoutes(page, mockGmailConnected);
    await page.goto("/automations");
    await expect(page.getByText("Test Email Sending")).toBeVisible({ timeout: 10_000 });

    const emailInput = page.getByPlaceholder("e.g. yourname@example.com");
    await emailInput.fill("test.verifier@example.com");

    const sendBtn = page.getByRole("button", { name: /Send Test Emails/i });
    await sendBtn.click();

    // Check confirmation modal
    await expect(page.getByText("Confirm Test Email Send")).toBeVisible();
    await expect(page.getByText("test.verifier@example.com")).toBeVisible();
    await expect(page.getByText("Daily Safety Quota Notice")).toBeVisible();

    // Confirm send
    const modalConfirmBtn = page.getByRole("button", { name: /Send 4 Test Emails/i });
    await modalConfirmBtn.click();

    // Check result display
    await expect(page.getByText("Test Summary:")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("Total: 4")).toBeVisible();
    await expect(page.getByText("Sent: 4")).toBeVisible();
    await expect(page.getByText("ID: gmail_msg_101")).toBeVisible();
    await expect(page.getByText("ID: gmail_msg_104")).toBeVisible();
  });

  test("5. Displays partial failures and quota limit reached appropriately", async ({ page }) => {
    const mockPartialResult: GmailTestSendResponse = {
      success: true,
      recipient_email: "test.verifier@example.com",
      total: 3,
      sent: 1,
      failed: 1,
      skipped: 1,
      results: [
        {
          grade: "A",
          status: "sent",
          subject: "Exclusive Partnership for Test Business",
          message_id: "gmail_msg_201",
          sent_at: "2026-09-08T14:32:00Z",
        },
        {
          grade: "B",
          status: "failed",
          subject: "B2B Solutions for Test Business",
          error: "Gmail API 429: Rate limit exceeded",
        },
        {
          grade: "C",
          status: "skipped",
          subject: "Audit for Test Business",
          error: "Daily Gmail safety limit of 400 emails reached.",
        },
      ],
    };

    await setupMockRoutes(page, mockGmailConnected, mockPartialResult);
    await page.goto("/automations");
    const emailInput = page.getByPlaceholder("e.g. yourname@example.com");
    await emailInput.fill("test.verifier@example.com");

    const sendBtn = page.getByRole("button", { name: /Send Test Emails/i });
    await sendBtn.click();

    const modalConfirmBtn = page.getByRole("button", { name: /Send 4 Test Emails/i });
    await modalConfirmBtn.click();

    await expect(page.getByText("Test Summary:")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("Sent: 1")).toBeVisible();
    await expect(page.getByText("Failed: 1")).toBeVisible();
    await expect(page.getByText("Skipped (Limit): 1")).toBeVisible();

    await expect(page.getByText("Gmail API 429: Rate limit exceeded")).toBeVisible();
    await expect(page.getByText("Daily Gmail safety limit of 400 emails reached.")).toBeVisible();
  });
});
