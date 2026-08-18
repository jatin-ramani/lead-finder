import { expect, test } from "@playwright/test";
import { playwrightAdminSecret } from "./support/auth";

const ADMIN_SECRET = playwrightAdminSecret();

test.describe("Phase 6A — Authentication & API Protection Real E2E Suite", () => {
  test("complete unauthenticated redirect, invalid login, valid login, navigation, logout flow", async ({ page, isMobile }) => {
    // 1. Open protected dashboard while logged out
    await page.goto("/");

    // 2. Redirect to /login
    await expect(page).toHaveURL(/.*\/login/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "Lead Finder Admin" })).toBeVisible({ timeout: 15000 });

    // 3. Login with invalid credentials
    await page.getByPlaceholder("Enter secret key...").fill("wrong_secret_key_12345");
    await page.getByRole("button", { name: "Sign In" }).click();

    // 4. Error shown
    await expect(page.getByText(/Invalid authentication credentials|Authentication required/i)).toBeVisible({ timeout: 15000 });

    // 5. Login with valid credentials
    const secretInput = page.getByPlaceholder("Enter secret key...");
    await secretInput.fill("");
    await secretInput.fill(ADMIN_SECRET);
    await page.getByRole("button", { name: "Sign In" }).click();

    // 6. Redirect to dashboard
    await expect(page).toHaveURL("http://127.0.0.1:3000/", { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "Dashboard" }).first()).toBeVisible({ timeout: 15000 });

    // Helper for navigation across viewports
    const navigateTo = async (href: string, expectedHeading: string) => {
      if (isMobile) {
        const openNavBtn = page.getByRole("button", { name: "Open navigation" });
        if (await openNavBtn.isVisible()) {
          await openNavBtn.click();
        }
      }
      const navLink = page.locator(`a[href="${href}"]`).first();
      if (await navLink.isVisible()) {
        await navLink.click();
      } else {
        await page.goto(href);
      }
      await expect(page).toHaveURL(new RegExp(`.*${href}`), { timeout: 15000 });
      await expect(page.getByRole("heading", { name: expectedHeading }).first()).toBeVisible({ timeout: 15000 });
    };

    // 7. Navigate Businesses
    await navigateTo("/businesses", "Businesses");

    // 8. Navigate Scanner
    await navigateTo("/scanner", "Scanner");

    // 9. Navigate Scraper
    await navigateTo("/scraping", "Website Scraper");

    // 10. Logout
    const logoutBtn = page.getByRole("button", { name: "Sign out" });
    await expect(logoutBtn).toBeVisible({ timeout: 15000 });
    await logoutBtn.click();

    // Verify redirect to /login
    await expect(page).toHaveURL(/.*\/login/, { timeout: 15000 });

    // 11. Attempt protected page again
    await page.goto("/businesses");

    // 12. Return to login
    await expect(page).toHaveURL(/.*\/login/, { timeout: 15000 });
  });
});
