import { expect, test, type Page } from "@playwright/test";
import type {
  AutomationListResponse,
  AutomationSingleResponse,
  EmailAutomation,
  EmailAutomationExecution,
  ExecutionListResponse,
  ProcessDueResponse,
  SupportedVariable,
} from "@/types/api";
import { authenticatePlaywright } from "./support/auth";

let mockAutomations: EmailAutomation[] = [
  {
    id: 1,
    name: "Welcome New Scanned Leads",
    description: "Initial introduction email for newly discovered businesses",
    trigger_type: "lead_created",
    subject_template: "Welcome {{business_name}}!",
    body_template: "Hello {{contact_name}},\n\nWe saw {{business_name}} and would love to connect.",
    enabled: true,
    delay_minutes: 0,
    max_retries: 3,
    created_at: "2026-09-07T10:00:00Z",
    updated_at: "2026-09-07T10:00:00Z",
  },
  {
    id: 2,
    name: "Follow-Up Reminder Outreach",
    description: "Remind prospect when follow-up task is due",
    trigger_type: "follow_up_due",
    subject_template: "Reminder: {{follow_up_title}} for {{business_name}}",
    body_template: "Hi,\n\nFollowing up on our scheduled item {{follow_up_title}}.",
    enabled: false,
    delay_minutes: 15,
    max_retries: 3,
    created_at: "2026-09-07T10:00:00Z",
    updated_at: "2026-09-07T10:00:00Z",
  },
];

const mockExecutions: EmailAutomationExecution[] = [
  {
    id: 101,
    automation_id: 1,
    business_id: 1,
    follow_up_id: null,
    status: "sent",
    trigger_event: "lead_created",
    trigger_key: "auto_1_biz_1_lead_created",
    recipient_email: "contact@apexclinic.example",
    rendered_subject: "Welcome Apex Clinic!",
    rendered_body: "Hello Dr. Smith,\n\nWe saw Apex Clinic and would love to connect.",
    provider: "mock",
    provider_message_id: "mock_msg_987",
    error_message: null,
    retry_count: 0,
    next_retry_at: null,
    scheduled_at: "2026-09-07T10:05:00Z",
    sent_at: "2026-09-07T10:05:01Z",
    created_at: "2026-09-07T10:05:00Z",
    updated_at: "2026-09-07T10:05:01Z",
    automation_name: "Welcome New Scanned Leads",
    business_name: "Apex Clinic",
  },
];

const mockVariables: SupportedVariable[] = [
  { key: "business_name", label: "Business Name", description: "Name of business", example: "Apex Clinic" },
  { key: "contact_name", label: "Contact Name", description: "Contact name", example: "Dr. Smith" },
  { key: "email", label: "Email Address", description: "Contact email", example: "contact@apexclinic.example" },
  { key: "lead_status", label: "CRM Status", description: "Pipeline status", example: "New" },
  { key: "follow_up_title", label: "Follow-Up Title", description: "Task title", example: "Send proposal" },
];

let nextAutoId = 10;

async function mockAutomationRoutes(page: Page) {
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

    if (pathname === "/health") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "healthy", database: "connected", timestamp: new Date().toISOString() }),
      });
      return;
    }

    // GET /automations/variables
    if (pathname === "/automations/variables" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockVariables),
      });
      return;
    }

    // POST /automations/process-due
    if (pathname === "/automations/process-due" && method === "POST") {
      const resp: ProcessDueResponse = {
        success: true,
        processed: 1,
        sent: 1,
        failed: 0,
        retried: 0,
        cancelled: 0,
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(resp),
      });
      return;
    }

    // POST /automations/:id/toggle
    if (pathname.match(/^\/automations\/\d+\/toggle$/) && method === "POST") {
      const id = parseInt(pathname.split("/")[2], 10);
      const postData = JSON.parse(request.postData() || "{}");
      const auto = mockAutomations.find((a) => a.id === id);
      if (auto) {
        auto.enabled = Boolean(postData.enabled);
        auto.updated_at = new Date().toISOString();
      }
      const resp: AutomationSingleResponse = {
        success: true,
        data: auto || mockAutomations[0],
        message: `Automation ${auto?.enabled ? "activated" : "deactivated"}`,
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(resp),
      });
      return;
    }

    // GET /automations/executions or GET /automations/:id/executions
    if (pathname.includes("/executions") && method === "GET") {
      const resp: ExecutionListResponse = {
        success: true,
        items: mockExecutions,
        total: mockExecutions.length,
        page: 1,
        page_size: 20,
        total_pages: 1,
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(resp),
      });
      return;
    }

    // GET /automations (list)
    if (pathname === "/automations" && method === "GET") {
      const triggerType = url.searchParams.get("trigger_type");
      const enabledParam = url.searchParams.get("enabled");

      let filtered = [...mockAutomations];
      if (triggerType) {
        filtered = filtered.filter((a) => a.trigger_type === triggerType);
      }
      if (enabledParam !== null && enabledParam !== undefined) {
        const boolVal = enabledParam === "true";
        filtered = filtered.filter((a) => a.enabled === boolVal);
      }

      const resp: AutomationListResponse = {
        success: true,
        items: filtered,
        total: filtered.length,
        page: 1,
        page_size: 20,
        total_pages: 1,
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(resp),
      });
      return;
    }

    // POST /automations (create)
    if (pathname === "/automations" && method === "POST") {
      const postData = JSON.parse(request.postData() || "{}");
      const newAuto: EmailAutomation = {
        id: ++nextAutoId,
        name: postData.name || "Untitled",
        description: postData.description || null,
        trigger_type: postData.trigger_type || "lead_created",
        subject_template: postData.subject_template || "Hello",
        body_template: postData.body_template || "Body",
        enabled: postData.enabled ?? true,
        delay_minutes: postData.delay_minutes ?? 0,
        max_retries: postData.max_retries ?? 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockAutomations.push(newAuto);

      const resp: AutomationSingleResponse = {
        success: true,
        data: newAuto,
        message: "Automation created successfully",
      };
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(resp),
      });
      return;
    }

    // DELETE /automations/:id
    if (pathname.match(/^\/automations\/\d+$/) && method === "DELETE") {
      const id = parseInt(pathname.split("/")[2], 10);
      mockAutomations = mockAutomations.filter((a) => a.id !== id);
      await route.fulfill({
        status: 204,
        contentType: "application/json",
        body: "",
      });
      return;
    }

    await route.continue();
  });
}

test.describe("Phase 4: Email Automation & Campaigns E2E Suite", () => {
  test.beforeEach(async ({ page }) => {
    // Reset mock data
    mockAutomations = [
      {
        id: 1,
        name: "Welcome New Scanned Leads",
        description: "Initial introduction email for newly discovered businesses",
        trigger_type: "lead_created",
        subject_template: "Welcome {{business_name}}!",
        body_template: "Hello {{contact_name}},\n\nWe saw {{business_name}} and would love to connect.",
        enabled: true,
        delay_minutes: 0,
        max_retries: 3,
        created_at: "2026-09-07T10:00:00Z",
        updated_at: "2026-09-07T10:00:00Z",
      },
      {
        id: 2,
        name: "Follow-Up Reminder Outreach",
        description: "Remind prospect when follow-up task is due",
        trigger_type: "follow_up_due",
        subject_template: "Reminder: {{follow_up_title}} for {{business_name}}",
        body_template: "Hi,\n\nFollowing up on our scheduled item {{follow_up_title}}.",
        enabled: false,
        delay_minutes: 15,
        max_retries: 3,
        created_at: "2026-09-07T10:00:00Z",
        updated_at: "2026-09-07T10:00:00Z",
      },
    ];

    await mockAutomationRoutes(page);
    await authenticatePlaywright(page.context());
  });

  test("Navigation and page header rendering", async ({ page }) => {
    await page.goto("/automations");
    await page.waitForLoadState("networkidle");

    // Check title and description
    await expect(page.locator("h2")).toContainText("Email Automations");
    await expect(page.locator("text=Event-driven email campaigns")).toBeVisible();

    // Check action buttons
    await expect(page.locator("button:has-text('New Automation')")).toBeVisible();
    await expect(page.locator("button:has-text('Process Queue Now')")).toBeVisible();
    await expect(page.locator("button:has-text('All Dispatch Logs')")).toBeVisible();
  });

  test("KPI overview statistics cards render correctly", async ({ page }) => {
    await page.goto("/automations");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=Active Rules")).toBeVisible();
    await expect(page.locator("text=Emails Sent")).toBeVisible();
    await expect(page.locator("text=Scheduled / Due")).toBeVisible();
    await expect(page.locator("text=Failed / Retries")).toBeVisible();
  });

  test("Automations table lists configured rules with trigger badges and switches", async ({ page }) => {
    await page.goto("/automations");
    await page.waitForLoadState("networkidle");

    // Check table rows
    await expect(page.locator("text=Welcome New Scanned Leads")).toBeVisible();
    await expect(page.locator("text=Follow-Up Reminder Outreach")).toBeVisible();

    // Check trigger badges
    await expect(page.locator(".ant-tag:has-text('Lead Created')")).toBeVisible();
    await expect(page.locator(".ant-tag:has-text('Follow-Up Due')")).toBeVisible();
  });

  test("Create new email automation modal with variable injection and preview", async ({ page }) => {
    await page.goto("/automations");
    await page.waitForLoadState("networkidle");

    // Click New Automation button
    await page.getByRole("button", { name: /New Automation/i }).click({ force: true });

    // Modal opens
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("Create Email Automation")).toBeVisible();

    // Fill form
    await modal.locator("input#name").fill("VIP Pitch Campaign");

    // Click dynamic variable pill if visible
    const variablePill = modal.getByText("+business_name");
    if (await variablePill.isVisible()) {
      await variablePill.click({ force: true });
    }

    // Switch to Preview Tab
    const previewTab = modal.getByRole("tab", { name: /Live Sample Preview/i });
    await previewTab.click({ force: true });
    await expect(modal.getByText("Live Preview with Sample Lead Context")).toBeVisible();

    // Submit
    await modal.getByRole("button", { name: /Create Automation/i }).click({ force: true });

    // Check table updated
    await expect(page.getByText("VIP Pitch Campaign")).toBeVisible();
  });

  test("Toggle automation active state switch", async ({ page }) => {
    await page.goto("/automations");
    await page.waitForLoadState("networkidle");

    // Find the toggle switch for first automation
    const row = page.locator("tr:has-text('Welcome New Scanned Leads')");
    const switchEl = row.locator(".ant-switch");
    await switchEl.scrollIntoViewIfNeeded();
    await expect(switchEl).toHaveAttribute("aria-checked", "true");

    // Click to deactivate
    await switchEl.click({ force: true });
    await expect(switchEl).toHaveAttribute("aria-checked", "false");
  });

  test("Open dispatch execution logs drawer", async ({ page }) => {
    await page.goto("/automations");
    await page.waitForLoadState("networkidle");

    // Click Logs button in row
    const row = page.locator("tr:has-text('Welcome New Scanned Leads')");
    const logsBtn = row.getByRole("button", { name: /Logs/i });
    await logsBtn.scrollIntoViewIfNeeded();
    await logsBtn.click({ force: true });

    // Drawer opens
    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText("Welcome New Scanned Leads")).toBeVisible();

    // Execution card visible
    await expect(drawer.getByText("Welcome Apex Clinic!").first()).toBeVisible();
    await expect(drawer.locator(".ant-tag").filter({ hasText: /^Sent$/i }).first()).toBeVisible();
  });

  test("Process due executions queue button triggers batch execution", async ({ page }) => {
    await page.goto("/automations");
    await page.waitForLoadState("networkidle");

    // Click Process Queue Now
    const procBtn = page.getByRole("button", { name: /Process Queue Now/i });
    await procBtn.scrollIntoViewIfNeeded();
    await procBtn.click({ force: true });

    // Message popup or notification appears
    await expect(page.locator(".ant-message-notice")).toBeVisible();
  });

  test("Delete automation rule with confirmation popconfirm", async ({ page }) => {
    await page.goto("/automations");
    await page.waitForLoadState("networkidle");

    const row = page.locator("tr:has-text('Follow-Up Reminder Outreach')");
    const deleteBtn = row.locator("button.ant-btn-dangerous");
    await deleteBtn.scrollIntoViewIfNeeded();
    await deleteBtn.click({ force: true });

    // Popconfirm opens
    const popconfirm = page.locator(".ant-popover, .ant-popconfirm");
    await expect(popconfirm).toBeVisible();
    await popconfirm.getByRole("button", { name: /Delete/i }).click({ force: true });

    // Verify row removed
    await expect(page.getByText("Follow-Up Reminder Outreach")).not.toBeVisible();
  });
});
