import { test, expect } from "@playwright/test";
import { authenticatePlaywright } from "./support/auth";

function apiPathForMockRequest(urlString: string): string | null {
  const url = new URL(urlString);
  const isLocalHost = url.hostname === "127.0.0.1" || url.hostname === "localhost";
  const isDirectLocalApi = isLocalHost && url.port === "8000";
  const isSameOriginProxy =
    isLocalHost &&
    !isDirectLocalApi &&
    (url.pathname === "/api" || url.pathname.startsWith("/api/"));

  if (!isDirectLocalApi && !isSameOriginProxy) return null;

  return isSameOriginProxy ? url.pathname.slice("/api".length) || "/" : url.pathname;
}

test.describe("Frontend Scanner Experience (Mocked Deterministic Suite)", () => {
  test.beforeEach(async ({ context }) => {
    await authenticatePlaywright(context);
  });

  test("full state transition: Running 0% -> 50% -> 80% -> Completed 100%", async ({ page }) => {
    let scanStarted = false;
    let pollCount = 0;

    await page.route("**/*", async (route) => {
      const apiPath = apiPathForMockRequest(route.request().url());

      if (!apiPath) {
        await route.continue();
        return;
      }

      if (apiPath === "/auth/me") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ authenticated: true }),
        });
        return;
      }

      if (apiPath === "/scan/jobs/latest") {
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
      } else if (apiPath === "/scan/jobs") {
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
      } else if (apiPath === "/scan") {
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
    await page.keyboard.press("Escape");

    const submitBtn = page.getByRole("button", { name: /launch continuous|start scan/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Verify initial loading text / state
    await expect(page.getByText(/discovering businesses|scanning/i).first()).toBeVisible();

    // Wait for polling progression to 1,020 and 1,019
    // Four 2.5s polling intervals can land just beyond 10s on the Tablet
    // dev-server path; keep the full 0 -> 50 -> 80 -> 100 contract intact.
    await expect(page.getByText("1,020").first()).toBeVisible({ timeout: 15000 });
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
      const apiPath = apiPathForMockRequest(route.request().url());

      if (!apiPath) {
        await route.continue();
        return;
      }

      if (apiPath === "/auth/me") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ authenticated: true }),
        });
        return;
      }

      if (apiPath === "/scan/jobs/latest") {
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
      } else if (apiPath === "/scan/jobs") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
      } else if (apiPath === "/scan") {
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
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: /launch continuous|start scan/i }).click();

    // Verify safe user error message in alert or notification
    await expect(page.getByText("The scan could not be completed because Geoapify is unavailable.").first()).toBeVisible();
  });

  test("handles timeout transition into watching mode", async ({ page }) => {
    let scanStarted = false;

    await page.route("**/*", async (route) => {
      const apiPath = apiPathForMockRequest(route.request().url());

      if (!apiPath) {
        await route.continue();
        return;
      }

      if (apiPath === "/auth/me") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ authenticated: true }),
        });
        return;
      }

      if (apiPath === "/scan/jobs/latest") {
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
      } else if (apiPath === "/scan/jobs") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
      } else if (apiPath === "/scan") {
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
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: /launch continuous|start scan/i }).click();

    // Verify timeout status notification banner (NOT "Scan failed")
    await expect(page.getByText(/still scanning|taking longer than usual/i).first()).toBeVisible();
  });

  test("category family selection displays subcategory tags preview", async ({ page }) => {
    await page.route("**/*", async (route) => {
      const apiPath = apiPathForMockRequest(route.request().url());
      if (!apiPath) {
        await route.continue();
        return;
      }
      if (apiPath === "/auth/me") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ authenticated: true }) });
        return;
      }
      if (apiPath === "/scan/jobs/latest") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(null) });
        return;
      }
      if (apiPath === "/scan/jobs") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
        return;
      }
      await route.continue();
    });

    await page.goto("/scanner");

    // By default healthcare is selected
    await expect(page.getByText("Subcategories included in this continuous scan:")).toBeVisible();
    await expect(page.getByText("Dentists").first()).toBeVisible();
    await expect(page.getByText("Clinics & Doctors").first()).toBeVisible();
    await expect(page.getByText("Pharmacies").first()).toBeVisible();
    await expect(page.getByText("Hospitals").first()).toBeVisible();

    // Verify Geographic Scan Radius dropdown exists
    await expect(page.getByText("Geographic Scan Radius")).toBeVisible();
  });

  test("safe clear scanned leads modal opens and requires typing DELETE", async ({ page }) => {
    let clearCalled = false;

    await page.route("**/*", async (route) => {
      const apiPath = apiPathForMockRequest(route.request().url());
      if (!apiPath) {
        await route.continue();
        return;
      }
      if (apiPath === "/auth/me") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ authenticated: true }) });
        return;
      }
      if (apiPath === "/scan/jobs/latest") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(null) });
        return;
      }
      if (apiPath === "/scan/jobs") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
        return;
      }
      if (apiPath === "/scan/clear-data") {
        clearCalled = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            deleted_count: 42,
            deleted_jobs_count: 5,
            message: "Successfully deleted 42 scanned businesses.",
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/scanner");

    // Click "Clear Scanned Leads"
    await page.getByRole("button", { name: /clear scanned leads/i }).click();

    // Modal appears
    await expect(page.getByText(/clear all scanned business/i)).toBeVisible();
    await expect(page.getByText("Admin user accounts and login sessions")).toBeVisible();
    await expect(page.getByText("Cold email templates & automation configurations")).toBeVisible();

    const deleteBtn = page.getByRole("button", { name: /confirm & delete/i });
    await expect(deleteBtn).toBeDisabled();

    // Type clear
    const confirmInput = page.getByPlaceholder("Type 'clear' to confirm");
    await confirmInput.fill("clear");
    await expect(deleteBtn).toBeEnabled();

    await deleteBtn.click();
    expect(clearCalled).toBe(true);
  });
});

