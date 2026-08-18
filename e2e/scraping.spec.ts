import { expect, test } from "@playwright/test";

test.describe("Phase 5 — Complete Website Scraping Experience E2E Suite", () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
      {
        name: "leadfinder_session",
        value: "leadfinder_admin_secret_2026_change_in_production",
        url: "http://127.0.0.1:3000",
      },
    ]);

    await page.route("**/*", async (route) => {
      const url = route.request().url();
      if (url.includes("/auth/me")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ authenticated: true }),
        });
        return;
      }

      if (!url.includes("8000")) {
        await route.continue();
        return;
      }

      if (url.endsWith("/scrape/jobs")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 10,
                status: "Running",
                progress: 80,
                total_websites: 15,
                completed: 12,
                success: 11,
                failed: 1,
                current_business_id: 3,
                started_at: "2026-08-17T10:00:00Z",
                completed_at: null,
              },
            ],
          }),
        });
      } else if (url.includes("/scrape/jobs/10")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              id: 10,
              status: "Running",
              progress: 80,
              total_websites: 15,
              completed: 12,
              success: 11,
              failed: 1,
              current_business_id: 3,
              started_at: "2026-08-17T10:00:00Z",
              completed_at: null,
            },
          }),
        });
      } else if (url.includes("/businesses/1/website")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              id: 1,
              business_id: 1,
              title: "Asopalav Ethnic Wear",
              meta_description: "Premier Indian ethnic wear and bridal collection store in Ahmedabad.",
              emails: ["info@asopalav.com", "sales@asopalav.com"],
              facebook: "https://facebook.com/asopalav",
              instagram: "https://instagram.com/asopalav",
              linkedin: null,
              twitter: null,
              youtube: null,
              whatsapp: "https://wa.me/917926765592",
              scraped_at: "2026-08-17T10:02:00Z",
              status: "Completed",
            },
          }),
        });
      } else if (url.includes("/businesses?")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 1,
                name: "Asopalav",
                phone: "+91 79 2676 5592",
                email: "info@asopalav.com",
                website: "https://asopalav.com",
                city: "Ahmedabad",
                category: "commercial",
                address: "132 Ft Ring Road",
                status: "Has Website",
              },
            ],
            pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
          }),
        });
      } else {
        await route.continue();
      }
    });
  });

  test("loads scraper workspace page with live progress, action panel and job history", async ({ page }) => {
    await page.goto("/scraping");

    await expect(page.getByRole("heading", { name: "Website Scraper" }).first()).toBeVisible();
    await expect(page.getByText("Scrape job #10").first()).toBeVisible();
    await expect(page.getByText("80% completed").first()).toBeVisible();

    // Verify metrics in card
    await expect(page.getByText("15").first()).toBeVisible();
    await expect(page.getByText("12").first()).toBeVisible();

    // Verify action launchers exist
    await expect(page.getByRole("button", { name: "Scrape missing", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Retry failed", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Scrape all", exact: true })).toBeVisible();
  });

  test("launches Scrape Missing job successfully", async ({ page }) => {
    let missingScraped = false;

    await page.route("**/*", async (route) => {
      const url = route.request().url();
      if (url.includes("/auth/me")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ authenticated: true }),
        });
        return;
      }
      if (url.endsWith("/scrape/missing")) {
        missingScraped = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            job_id: 11,
            message: "Missing website scraping started.",
          }),
        });
        return;
      }
      if (url.endsWith("/scrape/jobs")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: missingScraped
              ? [
                  {
                    id: 11,
                    status: "Running",
                    progress: 25,
                    total_websites: 20,
                    completed: 5,
                    success: 5,
                    failed: 0,
                    current_business_id: 2,
                    started_at: "2026-08-17T10:05:00Z",
                    completed_at: null,
                  },
                ]
              : [],
          }),
        });
        return;
      }
      if (url.includes("/scrape/jobs/11")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              id: 11,
              status: "Running",
              progress: 25,
              total_websites: 20,
              completed: 5,
              success: 5,
              failed: 0,
              current_business_id: 2,
              started_at: "2026-08-17T10:05:00Z",
              completed_at: null,
            },
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/scraping");

    await page.getByRole("button", { name: "Scrape missing", exact: true }).click();

    await expect(page.getByText("Job #11 queued for missing websites.").first()).toBeVisible();
    await expect(page.getByText("Scrape job #11").first()).toBeVisible();
  });

  test("launches Scrape All with confirmation modal", async ({ page }) => {
    let allScraped = false;

    await page.route("**/*", async (route) => {
      const url = route.request().url();
      if (url.includes("/auth/me")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ authenticated: true }),
        });
        return;
      }
      if (url.endsWith("/scrape/jobs")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: [] }),
        });
        return;
      }
      if (url.endsWith("/scrape/all")) {
        allScraped = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            job_id: 12,
            message: "Bulk scraping started.",
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/scraping");

    await page.getByRole("button", { name: "Scrape all", exact: true }).click();

    // Verify modal dialog opens
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Scrape all businesses?")).toBeVisible();

    // Click confirm in modal
    await dialog.getByRole("button", { name: "Yes, scrape all" }).click();

    await expect(page.getByText("Job #12 has been queued.").first()).toBeVisible();
  });

  test("handles 409 Conflict with direct link to running job", async ({ page }) => {
    await page.route("**/*", async (route) => {
      const url = route.request().url();
      if (url.includes("/auth/me")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ authenticated: true }),
        });
        return;
      }
      if (url.endsWith("/scrape/jobs")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: [] }),
        });
        return;
      }
      if (url.endsWith("/scrape/missing")) {
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            message: "A scrape job is already running.",
            error: "CONFLICT",
            timestamp: "2026-08-17T10:05:00Z",
            requestId: "req-409",
            details: { job_id: 42 },
          }),
        });
        return;
      }
      if (url.includes("/scrape/jobs/42")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              id: 42,
              status: "Running",
              progress: 60,
              total_websites: 100,
              completed: 60,
              success: 58,
              failed: 2,
              current_business_id: 8,
              started_at: "2026-08-17T10:00:00Z",
              completed_at: null,
            },
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/scraping");

    await page.getByRole("button", { name: "Scrape missing", exact: true }).click();

    // Conflict notification banner appears with link
    await expect(page.getByText("A scrape job is already running.").first()).toBeVisible();
    await expect(page.getByText("Job #42 is currently processing businesses.").first()).toBeVisible();

    const viewBtn = page.getByRole("button", { name: "View running job" });
    await expect(viewBtn).toBeVisible();
    await viewBtn.click();

    // Active job details update to #42
    await expect(page.getByText("Scrape job #42").first()).toBeVisible();
    await expect(page.getByText("60% completed").first()).toBeVisible();
  });

  test("views extracted website data inside Business detail drawer", async ({ page }) => {
    await page.goto("/businesses");

    // Click on Asopalav business row
    await page.getByText("Asopalav").first().click();

    // Verify Business drawer opens
    await expect(page.getByText("Business details").first()).toBeVisible();

    // Verify WebsiteDataCard details inside drawer
    await expect(page.getByText("Extracted website data").first()).toBeVisible();
    await expect(page.getByText("Asopalav Ethnic Wear").first()).toBeVisible();
    await expect(page.getByText("info@asopalav.com").first()).toBeVisible();
    await expect(page.getByText("Facebook").first()).toBeVisible();
    await expect(page.getByText("Instagram").first()).toBeVisible();
    await expect(page.getByText("WhatsApp").first()).toBeVisible();
  });
});
