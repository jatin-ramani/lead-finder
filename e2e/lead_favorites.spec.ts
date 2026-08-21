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

let globalFailFavorite = false;

async function mockFavoriteRoutes(page: Page) {
  const businesses = JSON.parse(JSON.stringify(mockBusinesses));

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

    if (pathname.match(/^\/businesses\/\d+\/favorite$/) && method === "PATCH") {
      if (globalFailFavorite) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "INTERNAL_ERROR", message: "Failed to update favorite status" }),
        });
        return;
      }

      const match = pathname.match(/^\/businesses\/(\d+)\/favorite$/);
      const id = Number(match?.[1]);
      const body = JSON.parse(request.postData() || "{}");
      const biz = businesses.find((b: { id: number; is_favorite?: boolean }) => b.id === id);
      if (biz) {
        biz.is_favorite = Boolean(body.is_favorite);
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(biz || {}),
      });
      return;
    }

    if (pathname === "/businesses/favorite/bulk" && method === "POST") {
      const body = JSON.parse(request.postData() || "{}");
      const ids: number[] = body.business_ids || [];
      const isFav = Boolean(body.is_favorite);
      let updated = 0;
      for (const biz of businesses) {
        if (ids.includes(biz.id)) {
          biz.is_favorite = isFav;
          updated++;
        }
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Favorites updated",
          updated_count: updated,
          total_requested: ids.length,
          is_favorite: isFav,
        }),
      });
      return;
    }

    if (pathname === "/businesses" && method === "GET") {
      const search = url.searchParams.get("search") || "";
      const isFavParam = url.searchParams.get("is_favorite");

      let filtered = [...businesses];
      if (search) {
        filtered = filtered.filter((b) =>
          b.name.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (isFavParam === "true") {
        filtered = filtered.filter((b) => b.is_favorite === true);
      } else if (isFavParam === "false") {
        filtered = filtered.filter((b) => b.is_favorite === false);
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: filtered,
          pagination: {
            page: 1,
            pageSize: 20,
            totalItems: filtered.length,
            totalPages: 1,
          },
        }),
      });
      return;
    }

    await route.continue();
  });
}

async function selectAlpha(page: Page) {
  const mobileCard = page.locator(".lf-mobile-business-card").filter({ hasText: "Alpha Dental" });
  if (await mobileCard.count() > 0 && await mobileCard.first().isVisible()) {
    await mobileCard.first().locator(".ant-checkbox-wrapper").click();
  } else {
    const row = page.getByRole("row", { name: /Alpha Dental/ });
    if (await row.count() > 0 && await row.first().isVisible()) {
      await row.first().locator(".ant-checkbox-wrapper").click();
    } else {
      await page.locator(".ant-table-row").first().locator(".ant-checkbox-wrapper").click();
    }
  }
}

test.describe("Lead Favorites System", () => {
  test.beforeEach(async ({ context, page }) => {
    globalFailFavorite = false;
    await authenticatePlaywright(context);
    await mockFavoriteRoutes(page);
  });

  test("displays favorite star in table and toggles favorite status", async ({ page }) => {
    await page.goto("/businesses?view=all");
    await expect(page.locator(".lf-table-card")).toBeVisible({ timeout: 10000 });

    // Verify star buttons are rendered
    const starBtns = page.locator(".lf-star-btn").filter({ visible: true });
    await expect(starBtns.first()).toBeVisible();

    // Check second item is favorited (Beta Foods)
    await expect(page.locator("button[aria-label='Unfavorite Beta Foods']").filter({ visible: true })).toBeVisible();

    // Click to favorite Alpha Dental
    const favAlphaBtn = page.locator("button[aria-label='Favorite Alpha Dental']").filter({ visible: true });
    await expect(favAlphaBtn).toBeVisible();
    await favAlphaBtn.click();

    // Should now show message and updated icon
    await expect(page.getByText("Added to favorites")).toBeVisible();
    await expect(page.locator("button[aria-label='Unfavorite Alpha Dental']").filter({ visible: true })).toBeVisible();
  });

  test("filters businesses using the Favorites filter button", async ({ page }) => {
    await page.goto("/businesses?view=all");
    await expect(page.locator(".lf-table-card")).toBeVisible({ timeout: 10000 });

    // Initially both businesses visible
    await expect(page.getByText("Alpha Dental").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Beta Foods").filter({ visible: true }).first()).toBeVisible();

    const isMobile = await page.locator(".lf-filter-mobile").isVisible();
    if (isMobile) {
      await page.getByRole("button", { name: /Filters/i }).click();
      await page.locator(".lf-filter-drawer .ant-checkbox-wrapper").filter({ hasText: "Favorites only" }).click();
      await page.getByRole("button", { name: "Show results" }).click();
    } else {
      const favFilterBtn = page.getByRole("button", { name: "Favorites" });
      await expect(favFilterBtn).toBeVisible();
      await favFilterBtn.click();
    }

    // URL should contain is_favorite=true
    await expect(page).toHaveURL(/.*is_favorite=true.*/);

    // Only favorited business Beta Foods should be in table
    await expect(page.getByText("Beta Foods").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Alpha Dental").filter({ visible: true })).toHaveCount(0);
  });

  test("shows and toggles favorite button in Business Drawer", async ({ page }) => {
    await page.goto("/businesses?view=all");
    await expect(page.locator(".lf-table-card")).toBeVisible({ timeout: 10000 });

    // Open detail drawer for Alpha Dental
    await page.getByText("Alpha Dental").filter({ visible: true }).first().click();
    await expect(page.locator(".lf-drawer")).toBeVisible();

    // Drawer header contains Favorite button with aria-label "Add to favorites"
    const drawerFavBtn = page.locator(".lf-drawer").getByRole("button", { name: "Add to favorites" });
    await expect(drawerFavBtn).toBeVisible();

    // Click to favorite
    await drawerFavBtn.click();
    await expect(page.getByText("Added to favorites")).toBeVisible();

    // Drawer button changes to "Remove from favorites"
    await expect(page.locator(".lf-drawer").getByRole("button", { name: "Remove from favorites" })).toBeVisible();
  });

  test("supports bulk favorite and unfavorite actions", async ({ page }) => {
    await page.goto("/businesses?view=all");
    await expect(page.locator(".lf-table-card")).toBeVisible({ timeout: 10000 });

    await selectAlpha(page);

    // Bulk bar appears
    await expect(page.locator(".lf-bulk-bar")).toBeVisible();
    const bulkFavBtn = page.locator(".lf-bulk-bar button").filter({ hasText: "Favorite selected", hasNotText: "Unfavorite" });
    await expect(bulkFavBtn).toBeVisible();

    await bulkFavBtn.click();
    await expect(page.getByText("Added selected to favorites")).toBeVisible();
  });

  test("handles optimistic failure gracefully when favorite API fails", async ({ page }) => {
    globalFailFavorite = true;

    await page.goto("/businesses?view=all");
    await expect(page.locator(".lf-table-card")).toBeVisible({ timeout: 10000 });

    const favAlphaBtn = page.locator("button[aria-label='Favorite Alpha Dental']").filter({ visible: true });
    await expect(favAlphaBtn).toBeVisible();
    await favAlphaBtn.click();

    // Error notification appears
    await expect(page.getByText(/Failed to update favorite status|Could not update favorite status/i)).toBeVisible();
    // Star remains in unstarred state
    await expect(page.locator("button[aria-label='Favorite Alpha Dental']").filter({ visible: true })).toBeVisible();
  });
});
