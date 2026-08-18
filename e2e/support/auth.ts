import type { BrowserContext } from "@playwright/test";

export function playwrightAdminSecret(): string {
  const secret = process.env.PLAYWRIGHT_ADMIN_SECRET;
  if (!secret) {
    throw new Error("PLAYWRIGHT_ADMIN_SECRET must be set to run authenticated Playwright tests.");
  }
  return secret;
}

export async function authenticatePlaywright(context: BrowserContext): Promise<void> {
  await context.addCookies([{
    name: "leadfinder_session",
    value: playwrightAdminSecret(),
    url: "http://127.0.0.1:3000",
  }]);
}
