import { expect, test, type Page } from "@playwright/test";
import { authenticatePlaywright } from "./support/auth";

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
    is_favorite: false,
    tags: [{ id: 1, name: "Hot Lead", slug: "hot-lead" }],
  },
  {
    id: 2,
    name: "Beta Foods",
    phone: "+91 98765 11111",
    email: "beta@example.com",
    website: "https://beta.test",
    city: "Surat",
    category: "Food & Dining",
    address: "Ring Road",
    status: "Has Website",
    lead_score: 70,
    lead_grade: "B",
    lead_score_reasons: [],
    is_favorite: true,
    tags: [],
  },
];

let globalNotes: Array<{
  id: number;
  business_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}> = [];

async function mockNotesRoutes(page: Page) {
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
          expires_at: new Date(Date.now() + 3600000).toISOString(),
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
            {
              city: "Ahmedabad",
              totalBusinesses: 1,
              withWebsite: 0,
              withEmail: 1,
              withPhone: 1,
              activeScrapes: 0,
            },
            {
              city: "Surat",
              totalBusinesses: 1,
              withWebsite: 1,
              withEmail: 1,
              withPhone: 1,
              activeScrapes: 0,
            },
          ],
        }),
      });
      return;
    }

    if (pathname === "/tags" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
      return;
    }

    if (pathname.match(/^\/businesses\/\d+\/notes$/) && method === "GET") {
      const match = pathname.match(/^\/businesses\/(\d+)\/notes$/);
      const bId = Number(match?.[1]);
      const filtered = globalNotes
        .filter((n) => n.business_id === bId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: filtered,
          total: filtered.length,
        }),
      });
      return;
    }

    if (pathname.match(/^\/businesses\/\d+\/notes$/) && method === "POST") {
      const match = pathname.match(/^\/businesses\/(\d+)\/notes$/);
      const bId = Number(match?.[1]);
      const body = JSON.parse(request.postData() || "{}");
      const newNote = {
        id: Date.now(),
        business_id: bId,
        content: body.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      globalNotes.unshift(newNote);

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(newNote),
      });
      return;
    }

    if (pathname.match(/^\/businesses\/notes\/\d+$/) && method === "PATCH") {
      const match = pathname.match(/^\/businesses\/notes\/(\d+)$/);
      const nId = Number(match?.[1]);
      const body = JSON.parse(request.postData() || "{}");
      const note = globalNotes.find((n) => n.id === nId);
      if (note) {
        note.content = body.content;
        note.updated_at = new Date().toISOString();
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(note || {}),
      });
      return;
    }

    if (pathname.match(/^\/businesses\/notes\/\d+$/) && method === "DELETE") {
      const match = pathname.match(/^\/businesses\/notes\/(\d+)$/);
      const nId = Number(match?.[1]);
      globalNotes = globalNotes.filter((n) => n.id !== nId);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, deleted: 1 }),
      });
      return;
    }

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

    await route.continue();
  });
}

test.describe("Business Notes System E2E Suite", () => {
  test.beforeEach(async ({ context, page }) => {
    globalNotes = [
      {
        id: 101,
        business_id: 1,
        content: "First discovery call completed. Very receptive to digital presence.",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
    await authenticatePlaywright(context);
    await mockNotesRoutes(page);
    await page.goto("/businesses?view=all");
    await expect(page.locator(".lf-table-card")).toBeVisible({ timeout: 10000 });
  });

  test("displays notes in Business Drawer and adds a new note", async ({ page }) => {
    // Open detail drawer for Alpha Dental
    await page.getByText("Alpha Dental").filter({ visible: true }).first().click();
    const drawer = page.locator(".lf-drawer");
    await expect(drawer).toBeVisible();

    // Click "Add Note" button
    const addNoteBtn = drawer.locator(".lf-add-note-btn");
    await expect(addNoteBtn).toBeVisible();
    await addNoteBtn.click();

    // Textarea editor appears with character counter
    const textarea = drawer.locator("textarea[aria-label='New note content']");
    await expect(textarea).toBeVisible();
    await expect(drawer.getByText("0 / 5000")).toBeVisible();

    // Type note with multiline formatting and emoji
    const noteText = "Follow up meeting scheduled for next Monday 10:00 AM.\nQuotation prepared: ₹45,000. 🚀";
    await textarea.fill(noteText);
    await expect(drawer.getByText(`${noteText.length} / 5000`)).toBeVisible();

    // Save note
    await drawer.locator(".lf-note-editor").getByRole("button", { name: "Save" }).click();

    // Success notification and new note visible
    await expect(page.getByText("Note added")).toBeVisible();
    await expect(drawer.getByText("Quotation prepared: ₹45,000. 🚀")).toBeVisible();

    // Close drawer
    await drawer.locator(".ant-drawer-close").click();
    await expect(drawer).not.toBeVisible();
  });

  test("edits an existing note with character counter and allows canceling", async ({ page }) => {
    // Open detail drawer
    await page.getByText("Alpha Dental").filter({ visible: true }).first().click();
    const drawer = page.locator(".lf-drawer");
    await expect(drawer).toBeVisible();

    // Click Edit button on the note
    const editBtn = drawer.locator("button[aria-label='Edit note']").first();
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // Editor appears preloaded with previous content
    const editArea = drawer.locator("textarea[aria-label='Edit note content']");
    await expect(editArea).toBeVisible();

    // Test canceling edit
    await editArea.fill("Some changed text that should be cancelled");
    await drawer.locator(".lf-note-editor").getByRole("button", { name: "Cancel" }).click();

    // Now edit and save
    await editBtn.click();
    await editArea.fill("Updated: Owner requested redesign proposal with SEO add-on.");
    await drawer.locator(".lf-note-editor").getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Note updated")).toBeVisible();
    await expect(
      drawer.getByText("Updated: Owner requested redesign proposal with SEO add-on.")
    ).toBeVisible();

    // Close drawer
    await drawer.locator(".ant-drawer-close").click();
    await expect(drawer).not.toBeVisible();
  });

  test("deletes a note with confirmation Popconfirm", async ({ page }) => {
    // Open detail drawer
    await page.getByText("Alpha Dental").filter({ visible: true }).first().click();
    const drawer = page.locator(".lf-drawer");
    await expect(drawer).toBeVisible();

    // Click Delete button on the note
    const deleteBtn = drawer.locator("button[aria-label='Delete note']").first();
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.scrollIntoViewIfNeeded();
    await deleteBtn.click();

    // Popconfirm appears
    const popconfirm = page.locator(".ant-popconfirm");
    await expect(popconfirm).toBeVisible();
    await expect(page.getByText("Delete this note?")).toBeVisible();
    await expect(page.getByText("Are you sure you want to delete this internal note?")).toBeVisible();

    // Click Cancel in popconfirm
    await popconfirm.getByRole("button", { name: "Cancel" }).click();

    // Click Delete again and confirm
    await deleteBtn.click();
    await popconfirm.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText("Note deleted")).toBeVisible();

    // Close drawer
    await drawer.locator(".ant-drawer-close").click();
    await expect(drawer).not.toBeVisible();
  });

  test("safely renders potential XSS payloads as plain text", async ({ page }) => {
    await page.getByText("Alpha Dental").filter({ visible: true }).first().click();
    const drawer = page.locator(".lf-drawer");
    await expect(drawer).toBeVisible();

    const addNoteBtn = drawer.locator(".lf-add-note-btn");
    await expect(addNoteBtn).toBeVisible();
    await addNoteBtn.click();

    const xssScript = "<script>alert('xss')</script><img src=x onerror=alert(1)>";
    const textarea = drawer.locator("textarea[aria-label='New note content']");
    await textarea.fill(xssScript);
    await drawer.locator(".lf-note-editor").getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Note added")).toBeVisible();
    // Verify plain text contains the literal tags escaped in DOM
    const noteCard = drawer.locator(".lf-note-card").first();
    await expect(noteCard).toContainText("<script>alert('xss')</script>");

    // Close drawer
    await drawer.locator(".ant-drawer-close").click();
    await expect(drawer).not.toBeVisible();
  });
});
