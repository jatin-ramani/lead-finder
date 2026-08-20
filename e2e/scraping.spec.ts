import { expect, test } from "@playwright/test";
import { authenticatePlaywright } from "./support/auth";

const mockJobResults = {
  success: true,
  data: [
    {
      id: 101,
      business_id: 1,
      business_name: "Asopalav Ethnic Wear",
      business_city: "Ahmedabad",
      business_category: "commercial",
      business_phone: "+91 79 2676 5592",
      website: "https://asopalav.com",
      status: "Completed",
      title: "Asopalav Ethnic Wear Online Store",
      meta_description: "Premier Indian ethnic wear and bridal collection store in Ahmedabad.",
      emails: ["info@asopalav.com", "sales@asopalav.com"],
      facebook: "https://facebook.com/asopalav",
      instagram: "https://instagram.com/asopalav",
      linkedin: null,
      twitter: null,
      youtube: null,
      whatsapp: "https://wa.me/917926765592",
      failure_reason: null,
      scraped_at: "2026-08-17T10:02:00Z",
    },
    {
      id: 102,
      business_id: 2,
      business_name: "Shreeji Dental Clinic",
      business_city: "Surat",
      business_category: "dental",
      business_phone: "+91 98250 12345",
      website: "https://shreejidental.test",
      status: "Failed",
      title: null,
      meta_description: null,
      emails: [],
      facebook: null,
      instagram: null,
      linkedin: null,
      twitter: null,
      youtube: null,
      whatsapp: null,
      failure_reason: "Connection timeout after 15s",
      scraped_at: "2026-08-17T10:03:00Z",
    },
  ],
  pagination: {
    page: 1,
    pageSize: 20,
    totalItems: 2,
    totalPages: 1,
  },
  summary: {
    job_id: 10,
    status: "Completed",
    total_websites: 15,
    completed: 12,
    success: 11,
    failed: 1,
    started_at: "2026-08-17T10:00:00Z",
    completed_at: "2026-08-17T10:10:00Z",
  },
  cities: [
    { city: "Ahmedabad", count: 1 },
    { city: "Surat", count: 1 },
  ],
};

test.describe("Website Scraping Experience & Results E2E Suite", () => {
  test.beforeEach(async ({ context, page }) => {
    await authenticatePlaywright(context);

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

      if (url.includes("/scrape/jobs/10/results")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockJobResults),
        });
      } else if (url.includes("/scrape/jobs/99/results")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: [],
            pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
            summary: {
              job_id: 99,
              status: "Completed",
              total_websites: 0,
              completed: 0,
              success: 0,
              failed: 0,
              started_at: "2026-08-17T10:00:00Z",
              completed_at: "2026-08-17T10:01:00Z",
            },
            cities: [],
          }),
        });
      } else if (url.endsWith("/scrape/jobs")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 10,
                status: "Completed",
                progress: 100,
                total_websites: 15,
                completed: 12,
                success: 11,
                failed: 1,
                current_business_id: 3,
                started_at: "2026-08-17T10:00:00Z",
                completed_at: "2026-08-17T10:10:00Z",
              },
              {
                id: 99,
                status: "Completed",
                progress: 100,
                total_websites: 0,
                completed: 0,
                success: 0,
                failed: 0,
                current_business_id: null,
                started_at: "2026-08-17T10:00:00Z",
                completed_at: "2026-08-17T10:01:00Z",
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
              status: "Completed",
              progress: 100,
              total_websites: 15,
              completed: 12,
              success: 11,
              failed: 1,
              current_business_id: 3,
              started_at: "2026-08-17T10:00:00Z",
              completed_at: "2026-08-17T10:10:00Z",
            },
          }),
        });
      } else if (url.includes("/businesses/cities")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: [
              {
                city: "Ahmedabad",
                totalBusinesses: 1,
                withWebsite: 1,
                withoutWebsite: 0,
                withEmail: 1,
                withoutEmail: 0,
                withPhone: 1,
                withoutPhone: 0,
                actionableLeads: 0,
              },
            ],
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
      } else if (url.includes("/businesses")) {
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

  test("clicking View button navigates to job details and displays scrape results", async ({ page }) => {
    await page.goto("/scraping");

    // Click 'View' button on Job #10
    const viewButton = page.getByRole("button", { name: "View" }).filter({ visible: true }).first();
    await expect(viewButton).toBeVisible();
    await viewButton.click();

    // Verify URL updates to /scraping?job=10
    await expect(page).toHaveURL(/job=10/);

    // Verify Scrape Job #10 details view is rendered
    await expect(page.getByRole("heading", { name: "Scrape Job #10" })).toBeVisible();
    await expect(page.getByText("Asopalav Ethnic Wear").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Shreeji Dental Clinic").filter({ visible: true }).first()).toBeVisible();

    // Verify success and failure status tags
    await expect(page.getByText("Success").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Failed").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Connection timeout after 15s").filter({ visible: true }).first()).toBeVisible();

    // Verify extracted emails
    await expect(page.getByText("info@asopalav.com").filter({ visible: true }).first()).toBeVisible();

    // Test Back button returns to Job History
    await page.getByRole("button", { name: "Back to Jobs" }).click();
    await expect(page).not.toHaveURL(/job=10/);
    await expect(page.getByText("Scrape job history").first()).toBeVisible();
  });

  test("handles zero-result scrape job cleanly without errors", async ({ page }) => {
    await page.goto("/scraping?job=99");

    await expect(page.getByRole("heading", { name: "Scrape Job #99" })).toBeVisible();
    await expect(page.getByText("No website results recorded for this job yet.")).toBeVisible();
  });

  test("views extracted website data inside Business detail drawer", async ({ page }) => {
    await page.goto("/businesses?city=Ahmedabad");

    // Click on Asopalav business row
    await page.getByText("Asopalav").filter({ visible: true }).first().click();

    // Verify Business drawer opens
    await expect(page.getByText("Business details").first()).toBeVisible();

    // Verify WebsiteDataCard details inside drawer
    await expect(page.getByText("Extracted website data").first()).toBeVisible();
    await expect(page.getByText("Asopalav Ethnic Wear").first()).toBeVisible();
    await expect(page.getByText("info@asopalav.com").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Facebook").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Instagram").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("WhatsApp").filter({ visible: true }).first()).toBeVisible();
  });
});
