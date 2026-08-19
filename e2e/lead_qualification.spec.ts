import { expect, test, type Page } from "@playwright/test";
import { authenticatePlaywright } from "./support/auth";

const businesses = [
  { id: 1, name: "Apex Dental Clinic", phone: "+91 98765 43210", email: "contact@apexdental.com", website: null, city: "Ahmedabad", category: "dental_clinic", address: "101 Ashram Road", status: "No Website" },
  { id: 2, name: "Bharat Motors Garage", phone: "+91 91234 56789", email: null, website: null, city: "Ahmedabad", category: "auto_repair", address: "22 SG Highway", status: "No Website" },
  { id: 3, name: "Chai Point Surat", phone: null, email: "hello@chaipointsurat.in", website: null, city: "Surat", category: "cafe", address: "5 Ring Road", status: "No Website" },
  { id: 4, name: "Elite Tech Solutions", phone: "+91 99887 76655", email: "info@elitetech.io", website: "https://elitetech.io", city: "Ahmedabad", category: "software", address: "404 Infocity", status: "Has Website" },
];

function matches(url: URL) {
  return businesses.filter((business) => {
    const website = url.searchParams.get("has_website");
    if (website === "true" && !business.website) return false;
    if (website === "false" && business.website) return false;
    if (url.searchParams.get("has_email") === "true" && !business.email) return false;
    if (url.searchParams.get("has_phone") === "true" && !business.phone) return false;
    return true;
  });
}

async function openMobileFilters(page: Page) {
  const trigger = page.getByRole("button", { name: /^Filters/ });
  if (await trigger.isVisible()) await trigger.click();
}

async function mockApi(page: Page) {
  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === "/auth/me") return route.fulfill({ json: { authenticated: true } });
    if (url.origin === "http://127.0.0.1:8000" && url.pathname === "/businesses" && request.method() === "GET") {
      const data = matches(url);
      return route.fulfill({ json: { success: true, data, pagination: { page: Number(url.searchParams.get("page") ?? 1), pageSize: 20, totalItems: data.length, totalPages: 1 } } });
    }
    return route.continue();
  });
}

test.describe("Lead qualification boolean filter contract", () => {
  test.beforeEach(async ({ context, page }) => {
    await authenticatePlaywright(context);
    await mockApi(page);
    await page.goto("/businesses");
    await expect(page.getByText("Apex Dental Clinic").filter({ visible: true })).toBeVisible({ timeout: 15000 });
  });

  test("shows the four approved boolean controls", async ({ page }) => {
    await openMobileFilters(page);
    await expect(page.getByRole("checkbox", { name: "Has website", exact: true })).toBeVisible();
    await expect(page.getByRole("checkbox", { name: "No website" })).toBeVisible();
    await expect(page.getByRole("checkbox", { name: "Has email" })).toBeVisible();
    await expect(page.getByRole("checkbox", { name: "Has phone" })).toBeVisible();
  });

  for (const scenario of [
    { name: "No website + email", controls: ["No website", "Has email"], query: ["has_website=false", "has_email=true"], visible: ["Apex Dental Clinic", "Chai Point Surat"] },
    { name: "No website + phone", controls: ["No website", "Has phone"], query: ["has_website=false", "has_phone=true"], visible: ["Apex Dental Clinic", "Bharat Motors Garage"] },
    { name: "No website + email + phone", controls: ["No website", "Has email", "Has phone"], query: ["has_website=false", "has_email=true", "has_phone=true"], visible: ["Apex Dental Clinic"] },
  ]) {
    test(`requests the backend for ${scenario.name}`, async ({ page }) => {
      const requests: URL[] = [];
      await openMobileFilters(page);
      page.on("request", (request) => { if (request.url().startsWith("http://127.0.0.1:8000/businesses?")) requests.push(new URL(request.url())); });
      for (const control of scenario.controls) await page.getByRole("checkbox", { name: control, exact: true }).click();
      for (const part of scenario.query) await expect(page).toHaveURL(new RegExp(part));
      await expect.poll(() => requests.some((url) => scenario.query.every((part) => url.search.includes(part)))).toBe(true);
      for (const name of scenario.visible) await expect(page.getByText(name).filter({ visible: true })).toBeVisible({ timeout: 15000 });
      await page.reload();
      await openMobileFilters(page);
      for (const control of scenario.controls) await expect(page.getByRole("checkbox", { name: control, exact: true })).toBeChecked();
    });
  }
});
