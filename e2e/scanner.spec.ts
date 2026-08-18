import { test, expect } from "@playwright/test";

test.describe("Frontend Scanner Experience (Mocked Deterministic Suite)", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "leadfinder_session",
        value: "leadfinder_admin_secret_2026_change_in_production",
        url: "http://127.0.0.1:3000",
      },
    ]);
  });

  test("full state transition: Running 0% -> 50% -> 80% -> Completed 100%", async ({ page }) => {
    let scanStarted = false;
    let pollCount = 0;

    await page.route("**/*", async (route) => {
      const urlString = route.request().url();

      if (!urlString.includes("8000")) {
        await route.continue();
        return;
      }

      if (urlString.includes("/auth/me")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ authenticated: true }),
        });
        return;
      }

      if (urlString.endsWith("/scan/jobs/latest")) {
        if (!scanStarted) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              id: 99,
              city: "PreviousCity",
              category: "catering",
              status: "Completed",
              progress: 100,
              totalBusinesses: 50,
              newBusinesses: 50,
            }),
          });
          return;
        }

        pollCount++;
        if (pollCount === 1) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              id: 101,
              city: "Ahmedabad",
              category: "catering",
              status: "Running",
              progress: 0,
              totalBusinesses: 0,
              newBusinesses: 0,
            }),
          });
        } else if (pollCount === 2) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              id: 101,
              city: "Ahmedabad",
              category: "catering",
              status: "Running",
              progress: 50,
              totalBusinesses: 500,
              newBusinesses: 480,
            }),
          });
        } else if (pollCount === 3) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              id: 101,
              city: "Ahmedabad",
              category: "catering",
              status: "Running",
              progress: 80,
              totalBusinesses: 1000,
              newBusinesses: 970,
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              id: 101,
              city: "Ahmedabad",
              category: "catering",
              status: "Completed",
              progress: 100,
              totalBusinesses: 1020,
              newBusinesses: 1019,
            }),
          });
        }
      } else if (urlString.endsWith("/scan/jobs")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(
            scanStarted
              ? [
                  {
                    id: 101,
                    city: "Ahmedabad",
                    category: "catering",
                    status: pollCount >= 4 ? "Completed" : "Running",
                    progress: pollCount >= 4 ? 100 : 50,
                    total_businesses: pollCount >= 4 ? 1020 : 500,
                    new_businesses: pollCount >= 4 ? 1019 : 480,
                  },
                ]
              : []
          ),
        });
      } else if (urlString.endsWith("/scan")) {
        // POST /scan
        scanStarted = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, message: "Scan completed." }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/scanner");

    const cityInput = page.locator("#city");
    const categoryInput = page.locator("#category");

    await cityInput.fill("Ahmedabad");
    await categoryInput.fill("catering");

    const submitBtn = page.getByRole("button", { name: /start scan/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Verify initial loading text / state
    await expect(page.getByText(/discovering businesses|scanning/i).first()).toBeVisible();

    // Wait for polling progression to 1,020 and 1,019
    await expect(page.getByText("1,020").first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("1,019").first()).toBeVisible();
    await expect(page.getByText("Completed").first()).toBeVisible();

    // Verify "View businesses" action appears
    await expect(page.getByRole("button", { name: /view businesses/i })).toBeVisible();

    // Verify scan button re-enables
    await expect(submitBtn).toBeEnabled();
  });

  test("handles 502 Upstream failure gracefully with safe message", async ({ page }) => {
    let scanStarted = false;

    await page.route("**/*", async (route) => {
      const urlString = route.request().url();

      if (!urlString.includes("8000")) {
        await route.continue();
        return;
      }

      if (urlString.includes("/auth/me")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ authenticated: true }),
        });
        return;
      }

      if (urlString.endsWith("/scan/jobs/latest")) {
        if (!scanStarted) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              id: 99,
              city: "PreviousCity",
              category: "catering",
              status: "Completed",
              progress: 100,
              totalBusinesses: 50,
              newBusinesses: 50,
            }),
          });
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: 102,
            city: "Mumbai",
            category: "commercial",
            status: "Failed",
            progress: 0,
            totalBusinesses: 0,
            newBusinesses: 0,
          }),
        });
      } else if (urlString.endsWith("/scan/jobs")) {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
      } else if (urlString.endsWith("/scan")) {
        // POST /scan -> 502 Error
        scanStarted = true;
        await route.fulfill({
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            message: "The scan could not be completed because Geoapify is unavailable.",
            error: "UPSTREAM_ERROR",
            requestId: "req-502",
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/scanner");

    await page.locator("#city").fill("Mumbai");
    await page.locator("#category").fill("commercial");

    await page.getByRole("button", { name: /start scan/i }).click();

    // Verify safe user error message in alert or notification
    await expect(page.getByText("The scan could not be completed because Geoapify is unavailable.").first()).toBeVisible();
  });

  test("handles timeout transition into watching mode", async ({ page }) => {
    let scanStarted = false;

    await page.route("**/*", async (route) => {
      const urlString = route.request().url();

      if (!urlString.includes("8000")) {
        await route.continue();
        return;
      }

      if (urlString.includes("/auth/me")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ authenticated: true }),
        });
        return;
      }

      if (urlString.endsWith("/scan/jobs/latest")) {
        if (!scanStarted) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              id: 99,
              city: "PreviousCity",
              category: "catering",
              status: "Completed",
              progress: 100,
              totalBusinesses: 50,
              newBusinesses: 50,
            }),
          });
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: 103,
            city: "Delhi",
            category: "healthcare",
            status: "Running",
            progress: 20,
            totalBusinesses: 50,
            newBusinesses: 50,
          }),
        });
      } else if (urlString.endsWith("/scan/jobs")) {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
      } else if (urlString.endsWith("/scan")) {
        // POST /scan -> TIMEOUT
        scanStarted = true;
        await route.fulfill({
          status: 408,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            message: "Request timed out",
            error: "TIMEOUT",
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/scanner");

    await page.locator("#city").fill("Delhi");
    await page.locator("#category").fill("healthcare");

    await page.getByRole("button", { name: /start scan/i }).click();

    // Verify timeout status notification banner (NOT "Scan failed")
    await expect(page.getByText(/still scanning|taking longer than usual/i).first()).toBeVisible();
  });
});
