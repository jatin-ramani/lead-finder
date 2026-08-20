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
    await page.getByRole("button", { name: /sign in/i }).click();

    // 4. Error shown
    await expect(page.getByText(/Invalid authentication credentials|Authentication required|Could not sign in/i).first()).toBeVisible({ timeout: 15000 });

    // 5. Login with valid credentials
    const secretInput = page.getByPlaceholder("Enter secret key...");
    await secretInput.fill("");
    await secretInput.fill(ADMIN_SECRET);
    await page.getByRole("button", { name: /sign in/i }).click();

    // 6. Redirect to dashboard
    await expect(page).toHaveURL(/\/$/, { timeout: 15000 });
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
      await expect(page.getByRole("heading", { name: new RegExp(expectedHeading, "i") }).first()).toBeVisible({ timeout: 15000 });
    };

    // 7. Navigate Businesses
    await navigateTo("/businesses", "Discovered Cities|Businesses");

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

  test("mobile viewports (375x812, 390x844, 414x896) login cleanly without session loop", async ({ page }) => {
    const viewports = [
      { width: 375, height: 812 },
      { width: 390, height: 844 },
      { width: 414, height: 896 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto("/login");

      await expect(page.getByRole("heading", { name: "Lead Finder Admin" })).toBeVisible({ timeout: 15000 });
      const secretInput = page.getByPlaceholder("Enter secret key...");
      await secretInput.fill(ADMIN_SECRET);
      await page.getByRole("button", { name: /sign in/i }).click();

      // Successfully lands on Dashboard without redirecting back to /login
      await expect(page).toHaveURL(/\/$/, { timeout: 15000 });
      await expect(page.getByRole("heading", { name: "Dashboard" }).first()).toBeVisible({ timeout: 15000 });

      // Refreshing dashboard preserves session
      await page.reload();
      await expect(page).toHaveURL(/\/$/, { timeout: 15000 });
      await expect(page.getByRole("heading", { name: "Dashboard" }).first()).toBeVisible({ timeout: 15000 });

      // Clean logout for next iteration
      const logoutBtn = page.getByRole("button", { name: "Sign out" });
      await expect(logoutBtn).toBeVisible({ timeout: 15000 });
      await logoutBtn.click();
      await expect(page).toHaveURL(/.*\/login/, { timeout: 15000 });
    }
  });

  test("when /auth/me fails after login, displays error on login screen and does not loop", async ({ page }) => {
    await page.goto("/login");

    // Intercept /auth/me to simulate a dropped cross-site cookie
    await page.route("**/auth/me", (route) => {
      return route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: "UNAUTHORIZED",
          message: "Authentication required",
        }),
      });
    });

    const secretInput = page.getByPlaceholder("Enter secret key...");
    await secretInput.fill(ADMIN_SECRET);
    await page.getByRole("button", { name: /sign in/i }).click();

    // Must remain on /login and show clear error message rather than looping to dashboard
    await expect(page).toHaveURL(/.*\/login/, { timeout: 15000 });
    await expect(page.getByText(/Session could not be verified|Authentication required|Could not sign in/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("direct unauthenticated navigation to all routes redirects cleanly to /login", async ({ page }) => {
    const routes = ["/scanner", "/businesses", "/scraping", "/system"];

    for (const r of routes) {
      await page.goto(r);
      await expect(page).toHaveURL(/.*\/login/, { timeout: 15000 });
      await expect(page.getByRole("heading", { name: "Lead Finder Admin" })).toBeVisible({ timeout: 15000 });
    }
  });
});
