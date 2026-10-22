import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  try {
    const res = await page.goto('https://tracelo.com/en/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Status:', res.status());
    const title = await page.title();
    console.log('Title:', title);
  } catch (err) {
    console.error('Fetch error:', err.message);
  } finally {
    await browser.close();
  }
})();
