import type { BrowserContext } from "@playwright/test";
import { randomUUID } from "node:crypto";

export function playwrightAdminSecret(): string {
  const secret = process.env.PLAYWRIGHT_ADMIN_SECRET || "development-only-admin-secret-change-me";
  return secret;
}

export async function authenticatePlaywright(context: BrowserContext): Promise<void> {
  // Mocked UI tests do not authenticate against an API, but their browser state
  // still mirrors a non-secret opaque session cookie. Generate it per test run.
  const testSessionToken = `playwright-${randomUUID()}`;
  await context.addCookies([
    {
      name: "leadfinder_session",
      value: testSessionToken,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
    {
      name: "leadfinder_session",
      value: testSessionToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);
}