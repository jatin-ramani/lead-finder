import { expect, test } from "@playwright/test";

const mockBusinesses = [
  {
    id: 1,
    name: "Apex Dental Clinic",
    phone: "+91 98765 43210",
    email: "contact@apexdental.com",
    website: "",
    city: "Ahmedabad",
    category: "dental_clinic",
    address: "101 Ashram Road",
    status: "No Website",
  },
  {
    id: 2,
    name: "Bharat Motors Garage",
    phone: "+91 91234 56789",
    email: null,
    website: null,
    city: "Ahmedabad",
    category: "auto_repair",
    address: "22 SG Highway",
    status: "No Website",
  },
  {
    id: 3,
    name: "Chai Point Surat",
    phone: "",
    email: "hello@chaipointsurat.in",
    website: "",
    city: "Surat",
    category: "cafe",
    address: "5 Ring Road",
    status: "No Website",
  },
  {
    id: 4,
    name: "Desi Dhaba",
    phone: null,
    email: "",
    website: "",
    city: "Surat",
    category: "restaurant",
    address: "10 Station Road",
    status: "No Website",
  },
  {
    id: 5,
    name: "Elite Tech Solutions",
    phone: "+91 99887 76655",
    email: "info@elitetech.io",
    website: "https://elitetech.io",
    city: "Ahmedabad",
    category: "software",
    address: "404 Infocity",
    status: "Has Website",
  },
  {
    id: 6,
    name: "Fusion Retail",
    phone: "",
    email: null,
    website: "https://fusionretail.com",
    city: "Vadodara",
    category: "retail",
    address: "12 Alkapuri",
    status: "Has Website",
  },
];

function filterBusinesses(params: URLSearchParams) {
  let list = [...mockBusinesses];
  const search = params.get("search");
  const city = params.get("city");
  const category = params.get("category");
  const status = params.get("status");
  const contact = params.get("contact");

  if (search) {
    const s = search.toLowerCase();
    list = list.filter(
      (b) =>
        b.name.toLowerCase().includes(s) ||
        (b.phone && b.phone.toLowerCase().includes(s)) ||
        (b.email && b.email.toLowerCase().includes(s)),
    );
  }
  if (city) {
    list = list.filter((b) => b.city.toLowerCase() === city.toLowerCase());
  }
  if (category) {
    list = list.filter((b) => b.category.toLowerCase() === category.toLowerCase());
  }
  if (status) {
    list = list.filter((b) => b.status === status);
  }
  if (contact === "email") {
    list = list.filter((b) => Boolean(b.email && b.email.trim()));
  } else if (contact === "phone") {
    list = list.filter((b) => Boolean(b.phone && b.phone.trim()));
  } else if (contact === "email_or_phone") {
    list = list.filter(
      (b) => Boolean(b.email && b.email.trim()) || Boolean(b.phone && b.phone.trim()),
    );
  } else if (contact === "email_and_phone") {
    list = list.filter(
      (b) => Boolean(b.email && b.email.trim()) && Boolean(b.phone && b.phone.trim()),
    );
  } else if (contact === "none") {
    list = list.filter(
      (b) => (!b.email || !b.email.trim()) && (!b.phone || !b.phone.trim()),
    );
  }

  return list;
}

test.describe("Phase 7 — Lead Qualification & Smart Export E2E Suite", () => {
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

      const parsedUrl = new URL(url);

      if (parsedUrl.pathname === "/businesses/export/csv") {
        const filtered = filterBusinesses(parsedUrl.searchParams);
        const csvContent =
          "ID,Name,Phone,Email,Website,City,Category,Address,Status\n" +
          filtered
            .map(
              (b) =>
                `${b.id},"${b.name}","${b.phone || ""}","${b.email || ""}","${b.website || ""}","${b.city}","${b.category}","${b.address}","${b.status}"`,
            )
            .join("\n");

        await route.fulfill({
          status: 200,
          contentType: "text/csv; charset=utf-8",
          headers: {
            "Content-Disposition": 'attachment; filename="businesses.csv"',
          },
          body: "\uFEFF" + csvContent,
        });
        return;
      }

      if (parsedUrl.pathname === "/businesses" && route.request().method() === "GET") {
        const filtered = filterBusinesses(parsedUrl.searchParams);
        const pageNum = parseInt(parsedUrl.searchParams.get("page") || "1", 10);
        const pageSize = parseInt(parsedUrl.searchParams.get("pageSize") || "20", 10);

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: filtered.slice((pageNum - 1) * pageSize, pageNum * pageSize),
            pagination: {
              page: pageNum,
              pageSize,
              totalItems: filtered.length,
              totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
            },
          }),
        });
        return;
      }

      await route.continue();
    });
  });

  test("1. Contact filter appears and allows selecting contact modes", async ({ page }) => {
    await page.goto("/businesses");
    await expect(page.getByRole("heading", { name: "Businesses" }).first()).toBeVisible();

    // Contact select control is visible
    const contactSelect = page.getByLabel("Filter by contact availability");
    await expect(contactSelect).toBeVisible();

    // Open dropdown and verify options
    await contactSelect.click();
    await expect(page.locator(".ant-select-dropdown:visible").getByText("All Contacts")).toBeVisible();
    await expect(page.locator(".ant-select-dropdown:visible").getByText("Has Email", { exact: true })).toBeVisible();
    await expect(page.locator(".ant-select-dropdown:visible").getByText("Has Phone", { exact: true })).toBeVisible();
    await expect(page.locator(".ant-select-dropdown:visible").getByText("Has Email or Phone")).toBeVisible();
    await expect(page.locator(".ant-select-dropdown:visible").getByText("Has Email and Phone")).toBeVisible();
    await expect(page.locator(".ant-select-dropdown:visible").getByText("No Contact")).toBeVisible();
  });

  test("2. Filters by Has Email or Phone and combines with No Website for Qualified Leads", async ({ page }) => {
    await page.goto("/businesses");
    await expect(page.getByRole("heading", { name: "Businesses" }).first()).toBeVisible();

    // Select Status: No Website
    const statusSelect = page.getByLabel("Filter by website status");
    await statusSelect.click();
    await page.locator(".ant-select-dropdown:visible").getByText("No Website").click();

    // Select Contact: Has Email or Phone
    const contactSelect = page.getByLabel("Filter by contact availability");
    await contactSelect.click();
    await page.locator(".ant-select-dropdown:visible").getByText("Has Email or Phone").click();

    // Verify URL parameters
    await expect(page).toHaveURL(/.*status=No%20Website.*contact=email_or_phone/);

    // Verify filtered results (Apex, Bharat, Chai -> 3 results)
    await expect(page.getByText("Apex Dental Clinic")).toBeVisible();
    await expect(page.getByText("Bharat Motors Garage")).toBeVisible();
    await expect(page.getByText("Chai Point Surat")).toBeVisible();
    await expect(page.getByText("Desi Dhaba")).not.toBeVisible();
    await expect(page.getByText("Elite Tech Solutions")).not.toBeVisible();

    // Summary badge / text shows 3 businesses match
    await expect(page.getByText("3 businesses match these filters")).toBeVisible();
  });

  test("3. URL state persists across page reload and back/forward navigation", async ({ page }) => {
    await page.goto("/businesses?status=No%20Website&contact=email_or_phone");
    await expect(page.getByRole("heading", { name: "Businesses" }).first()).toBeVisible();

    // Verify initial load from URL
    await expect(page.getByText("Apex Dental Clinic")).toBeVisible();
    await expect(page.getByText("Bharat Motors Garage")).toBeVisible();
    await expect(page.getByText("Chai Point Surat")).toBeVisible();

    // Reload page
    await page.reload();
    await expect(page.getByText("Apex Dental Clinic")).toBeVisible();
    await expect(page.getByText("3 businesses match these filters")).toBeVisible();

    // Reset filters
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page).toHaveURL("http://127.0.0.1:3000/businesses");
    await expect(page.getByText("Desi Dhaba")).toBeVisible();

    // Browser back navigation
    await page.goBack();
    await expect(page).toHaveURL(/.*status=No%20Website.*contact=email_or_phone/);
    await expect(page.getByText("Desi Dhaba")).not.toBeVisible();
  });

  test("4. Smart Export Confirmation Modal opens and calculates preview count", async ({ page }) => {
    await page.goto("/businesses?status=No%20Website");
    await expect(page.getByText("Apex Dental Clinic")).toBeVisible();

    // Click Export CSV button
    await page.getByRole("button", { name: "Export CSV" }).click();

    // Modal appears
    const modal = page.locator(".ant-modal-content");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("Export Businesses")).toBeVisible();
    await expect(modal.getByText(/4 businesses match your current filters/i)).toBeVisible();

    // Toggle contact requirement checkbox: "Only export businesses with email or phone"
    const contactCheckbox = modal.getByLabel("Only export businesses with email or phone");
    await expect(contactCheckbox).toBeVisible();
    await contactCheckbox.check();

    // Dynamic calculation: 3 businesses will be exported
    await expect(modal.getByText("3 businesses will be exported.")).toBeVisible({ timeout: 5000 });
    const exportBtn = modal.getByRole("button", { name: /Export 3 businesses/i });
    await expect(exportBtn).toBeVisible();

    // Trigger download
    const downloadPromise = page.waitForEvent("download");
    await exportBtn.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("businesses.csv");
  });
});
