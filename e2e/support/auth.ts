import type { BrowserContext } from "@playwright/test";

export function playwrightAdminSecret(): string {
  return process.env.PLAYWRIGHT_ADMIN_SECRET || process.env.ADMIN_SECRET_KEY || "leadfinder_admin_secret_2026_change_in_production";
}

export async function authenticatePlaywright(context: BrowserContext): Promise<void> {
  // Set mock session cookies for Playwright tests across both 127.0.0.1 and localhost
  await context.addCookies([
    {
      name: "leadfinder_session",
      value: "playwright-test-session-token",
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
    {
      name: "leadfinder_session",
      value: "playwright-test-session-token",
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);
}