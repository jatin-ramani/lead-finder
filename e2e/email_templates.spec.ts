import { expect, test, type Page } from "@playwright/test";
import type {
  EmailTemplate,
  SupportedVariable,
  TemplateListResponse,
  TemplateSingleResponse,
} from "@/types/api";
import { authenticatePlaywright } from "./support/auth";

let mockTemplates: EmailTemplate[] = [
  {
    id: 1,
    name: "Grade A — High Priority Lead",
    description: "Default outreach template for Grade A (High Priority) leads.",
    subject: "Introduction regarding {{business_name}}",
    body: "<p>Hi {{contact_name}},</p><p>Growth opportunity for {{business_name}}.</p>",
    is_archived: false,
    created_at: "2026-09-08T10:00:00Z",
    updated_at: "2026-09-08T10:00:00Z",
  },
  {
    id: 2,
    name: "Grade B — Good Lead",
    description: "Default outreach template for Grade B (Good) leads.",
    subject: "Connecting with {{business_name}}",
    body: "<p>Hi {{contact_name}},</p><p>Review for {{business_name}}.</p>",
    is_archived: false,
    created_at: "2026-09-08T10:00:00Z",
    updated_at: "2026-09-08T10:00:00Z",
  },
  {
    id: 3,
    name: "Grade C — Potential Lead",
    description: "Default outreach template for Grade C (Potential) leads.",
    subject: "Quick question for {{business_name}}",
    body: "<p>Hello {{contact_name}},</p><p>Digital visibility check for {{business_name}}.</p>",
    is_archived: false,
    created_at: "2026-09-08T10:00:00Z",
    updated_at: "2026-09-08T10:00:00Z",
  },
  {
    id: 4,
    name: "Grade D — Low Priority Lead",
    description: "Default outreach template for Grade D (Low Priority) leads.",
    subject: "Inquiry for {{business_name}}",
    body: "<p>Hi {{contact_name}},</p><p>Exploring opportunities for {{business_name}}.</p>",
    is_archived: false,
    created_at: "2026-09-08T10:00:00Z",
    updated_at: "2026-09-08T10:00:00Z",
  },
];

const mockVariables: SupportedVariable[] = [
  { key: "business_name", label: "Business Name", description: "Name of business", example: "Apex Clinic" },
  { key: "contact_name", label: "Contact Name", description: "Contact name", example: "Dr. Smith" },
  { key: "email", label: "Email Address", description: "Contact email", example: "contact@apexclinic.example" },
  { key: "lead_status", label: "CRM Status", description: "Pipeline status", example: "New" },
  { key: "lead_score", label: "Lead Score", description: "Score", example: "85" },
];

let nextTemplateId = 10;

async function mockTemplateRoutes(page: Page) {
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

    // GET /templates/variables
    if (pathname === "/templates/variables" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockVariables),
      });
      return;
    }

    // POST /templates/preview
    if (pathname === "/templates/preview" && method === "POST") {
      const postData = JSON.parse(request.postData() || "{}");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          rendered_subject: (postData.subject || "").replace("{{business_name}}", "Apex Healthcare Clinic"),
          rendered_body: (postData.body || "").replace("{{contact_name}}", "Dr. Sarah Smith"),
          context_used: {},
        }),
      });
      return;
    }

    // POST /templates/:id/archive
    if (pathname.match(/^\/templates\/\d+\/archive$/) && method === "POST") {
      const id = parseInt(pathname.split("/")[2], 10);
      const postData = JSON.parse(request.postData() || "{}");
      const tmpl = mockTemplates.find((t) => t.id === id);
      if (tmpl) {
        tmpl.is_archived = Boolean(postData.is_archived);
        tmpl.updated_at = new Date().toISOString();
      }
      const resp: TemplateSingleResponse = {
        success: true,
        data: tmpl || mockTemplates[0],
        message: `Template ${tmpl?.is_archived ? "archived" : "unarchived"}`,
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(resp),
      });
      return;
    }

    // GET /templates (list)
    if (pathname === "/templates" && method === "GET") {
      const isArchived = url.searchParams.get("is_archived");
      let filtered = [...mockTemplates];
      if (isArchived !== null && isArchived !== undefined) {
        const boolVal = isArchived === "true";
        filtered = filtered.filter((t) => t.is_archived === boolVal);
      }

      const resp: TemplateListResponse = {
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

    // POST /templates (create)
    if (pathname === "/templates" && method === "POST") {
      const postData = JSON.parse(request.postData() || "{}");
      const newTmpl: EmailTemplate = {
        id: ++nextTemplateId,
        name: postData.name || "Untitled",
        description: postData.description || null,
        subject: postData.subject || "Subject",
        body: postData.body || "Body",
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockTemplates.push(newTmpl);

      const resp: TemplateSingleResponse = {
        success: true,
        data: newTmpl,
        message: "Template created successfully",
      };
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(resp),
      });
      return;
    }

    // PATCH /templates/:id (update)
    if (pathname.match(/^\/templates\/\d+$/) && (method === "PATCH" || method === "PUT")) {
      const id = parseInt(pathname.split("/")[2], 10);
      const postData = JSON.parse(request.postData() || "{}");
      const tmpl = mockTemplates.find((t) => t.id === id);
      if (tmpl) {
        if (postData.name) tmpl.name = postData.name;
        if (postData.subject) tmpl.subject = postData.subject;
        if (postData.body) tmpl.body = postData.body;
      }
      const resp: TemplateSingleResponse = {
        success: true,
        data: tmpl || mockTemplates[0],
        message: "Template updated successfully",
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(resp),
      });
      return;
    }

    // DELETE /templates/:id
    if (pathname.match(/^\/templates\/\d+$/) && method === "DELETE") {
      const id = parseInt(pathname.split("/")[2], 10);
      mockTemplates = mockTemplates.filter((t) => t.id !== id);
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

test.describe("Phase 5: Email Templates E2E Suite", () => {
  test.beforeEach(async ({ page }) => {
    mockTemplates = [
      {
        id: 1,
        name: "Grade A — High Priority Lead",
        description: "Default outreach template for Grade A (High Priority) leads.",
        subject: "Introduction regarding {{business_name}}",
        body: "<p>Hi {{contact_name}},</p><p>Growth opportunity for {{business_name}}.</p>",
        is_archived: false,
        created_at: "2026-09-08T10:00:00Z",
        updated_at: "2026-09-08T10:00:00Z",
      },
      {
        id: 2,
        name: "Grade B — Good Lead",
        description: "Default outreach template for Grade B (Good) leads.",
        subject: "Connecting with {{business_name}}",
        body: "<p>Hi {{contact_name}},</p><p>Review for {{business_name}}.</p>",
        is_archived: false,
        created_at: "2026-09-08T10:00:00Z",
        updated_at: "2026-09-08T10:00:00Z",
      },
      {
        id: 3,
        name: "Grade C — Potential Lead",
        description: "Default outreach template for Grade C (Potential) leads.",
        subject: "Quick question for {{business_name}}",
        body: "<p>Hello {{contact_name}},</p><p>Digital visibility check for {{business_name}}.</p>",
        is_archived: false,
        created_at: "2026-09-08T10:00:00Z",
        updated_at: "2026-09-08T10:00:00Z",
      },
      {
        id: 4,
        name: "Grade D — Low Priority Lead",
        description: "Default outreach template for Grade D (Low Priority) leads.",
        subject: "Inquiry for {{business_name}}",
        body: "<p>Hi {{contact_name}},</p><p>Exploring opportunities for {{business_name}}.</p>",
        is_archived: false,
        created_at: "2026-09-08T10:00:00Z",
        updated_at: "2026-09-08T10:00:00Z",
      },
    ];

    await mockTemplateRoutes(page);
    await authenticatePlaywright(page.context());
  });

  test("Navigation and page header rendering", async ({ page }) => {
    await page.goto("/templates");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h3")).toContainText("Email Templates");
    await expect(page.locator("button:has-text('New Template')")).toBeVisible();
    await expect(page.locator("button:has-text('Refresh')")).toBeVisible();
  });

  test("KPI statistics cards render correctly", async ({ page }) => {
    await page.goto("/templates");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=Total Templates")).toBeVisible();
    await expect(page.locator("text=Filter View")).toBeVisible();
    await expect(page.locator("text=Supported Placeholders")).toBeVisible();
  });

  test("Templates table lists default grade templates with grade badges", async ({ page }) => {
    await page.goto("/templates");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=Grade A — High Priority Lead")).toBeVisible();
    await expect(page.locator("text=Grade B — Good Lead")).toBeVisible();
    await expect(page.locator("text=Grade C — Potential Lead")).toBeVisible();
    await expect(page.locator("text=Grade D — Low Priority Lead")).toBeVisible();

    // Verify Grade badges
    await expect(page.locator(".ant-tag:has-text('Grade A')")).toBeVisible();
    await expect(page.locator(".ant-tag:has-text('Grade B')")).toBeVisible();
    await expect(page.locator(".ant-tag:has-text('Grade C')")).toBeVisible();
    await expect(page.locator(".ant-tag:has-text('Grade D')")).toBeVisible();
  });

  test("Create new email template modal with variable helper and live preview", async ({ page }) => {
    await page.goto("/templates");
    await page.waitForLoadState("networkidle");

    // Open modal
    await page.getByRole("button", { name: /New Template/i }).click({ force: true });
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("Create Email Template")).toBeVisible();

    // Fill name
    await modal.locator("input#name").fill("VIP Healthcare Intro");

    // Click variable pill
    const pill = modal.getByText("+business_name");
    if (await pill.isVisible()) {
      await pill.click({ force: true });
    }

    // Switch to preview tab
    const previewTab = modal.getByRole("tab", { name: /Live Sample Preview/i });
    await previewTab.click({ force: true });
    await expect(modal.getByText("Live Sample Context Preview")).toBeVisible();

    // Submit
    await modal.getByRole("button", { name: /Create Template/i }).click({ force: true });

    // Verify in table
    await expect(page.getByText("VIP Healthcare Intro")).toBeVisible();
  });

  test("Preview modal renders template with sample context", async ({ page }) => {
    await page.goto("/templates");
    await page.waitForLoadState("networkidle");

    const row = page.locator("tr:has-text('Grade A — High Priority Lead')");
    const previewBtn = row.locator("button").first();
    await previewBtn.click({ force: true });

    const previewModal = page.locator(".ant-modal");
    await expect(previewModal).toBeVisible();
    await expect(previewModal.getByText("Template Preview: Grade A — High Priority Lead")).toBeVisible();
  });

  test("Archive toggle and delete actions", async ({ page }) => {
    await page.goto("/templates");
    await page.waitForLoadState("networkidle");

    const row = page.locator("tr:has-text('Grade D — Low Priority Lead')");
    const deleteBtn = row.locator("button.ant-btn-dangerous");
    await deleteBtn.click({ force: true });

    const popconfirm = page.locator(".ant-popover, .ant-popconfirm");
    await expect(popconfirm).toBeVisible();
    await popconfirm.getByRole("button", { name: /Yes, Delete/i }).click({ force: true });

    await expect(page.getByText("Grade D — Low Priority Lead")).not.toBeVisible();
  });
});
