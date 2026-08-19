import type { BrowserContext } from "@playwright/test";

export function playwrightAdminSecret(): string {
  const secret = process.env.PLAYWRIGHT_ADMIN_SECRET;
  if (!secret) {
    throw new Error("PLAYWRIGHT_ADMIN_SECRET must be set to run authenticated Playwright tests.");
  }
  return secret;
}

export async function authenticatePlaywright(context: BrowserContext): Promise<void> {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");
  const response = await context.request.post(`${apiBase}/auth/login`, {
    data: { secret: playwrightAdminSecret() },
  });
  if (!response.ok()) {
    throw new Error(`Playwright authentication failed with HTTP ${response.status()}.`);
  }
  // BrowserContext.request shares the context cookie jar. The opaque HttpOnly
  // cookie returned by the backend is therefore available to page requests;
  // the administrator secret is never installed as a cookie or browser state.
}