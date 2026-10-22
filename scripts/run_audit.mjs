import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const AUDIT_DIR = 'C:/Users/HRDvijinfotech/Desktop/lead-finder/audit';
const REF_DIR = path.join(AUDIT_DIR, 'reference');
const MINE_DIR = path.join(AUDIT_DIR, 'mine');

fs.mkdirSync(REF_DIR, { recursive: true });
fs.mkdirSync(MINE_DIR, { recursive: true });

const VIEWPORTS = [1440, 1280, 1024, 768, 390, 360];

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          setTimeout(resolve, 500);
        }
      }, 100);
    });
  });
}

async function extractPageMetrics(page, isReference = true) {
  return await page.evaluate((isRef) => {
    const data = {
      sections: [],
      fonts: [],
      colors: new Set(),
      radii: new Set(),
      shadows: new Set(),
      buttons: [],
      containers: [],
    };

    // Extract fonts loaded
    const fontFaces = [];
    document.fonts.forEach((f) => {
      fontFaces.push({ family: f.family, weight: f.weight, style: f.style, status: f.status });
    });
    data.fonts = fontFaces;

    // Detect sections or major blocks
    const selectors = ['header', 'nav', 'section', 'main > div', 'footer', '.modal', '[role="dialog"]'];
    const elements = Array.from(document.querySelectorAll('header, section, footer, main, nav'));

    elements.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      if (rect.height < 10) return;

      const sectionInfo = {
        index,
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        className: el.className ? String(el.className).slice(0, 150) : '',
        y: Math.round(rect.top + window.scrollY),
        height: Math.round(rect.height),
        width: Math.round(rect.width),
        computed: {
          backgroundColor: style.backgroundColor,
          backgroundImage: style.backgroundImage.slice(0, 100),
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          padding: `${style.paddingTop} ${style.paddingRight} ${style.paddingBottom} ${style.paddingLeft}`,
          margin: `${style.marginTop} ${style.marginRight} ${style.marginBottom} ${style.marginLeft}`,
          display: style.display,
          flexDirection: style.flexDirection,
          gap: style.gap,
          justifyContent: style.justifyContent,
          alignItems: style.alignItems,
        },
        headings: [],
        paragraphs: [],
        linksAndButtons: [],
        imagesAndIcons: [],
      };

      // Headings inside section
      el.querySelectorAll('h1, h2, h3, h4').forEach((h) => {
        const hStyle = window.getComputedStyle(h);
        const hRect = h.getBoundingClientRect();
        sectionInfo.headings.push({
          tag: h.tagName.toLowerCase(),
          text: h.textContent.trim().slice(0, 60),
          fontSize: hStyle.fontSize,
          fontWeight: hStyle.fontWeight,
          lineHeight: hStyle.lineHeight,
          letterSpacing: hStyle.letterSpacing,
          fontFamily: hStyle.fontFamily,
          color: hStyle.color,
          textTransform: hStyle.textTransform,
          margin: `${hStyle.marginTop} ${hStyle.marginRight} ${hStyle.marginBottom} ${hStyle.marginLeft}`,
        });
      });

      // Paragraphs
      el.querySelectorAll('p').forEach((p) => {
        const pStyle = window.getComputedStyle(p);
        sectionInfo.paragraphs.push({
          text: p.textContent.trim().slice(0, 50),
          fontSize: pStyle.fontSize,
          fontWeight: pStyle.fontWeight,
          lineHeight: pStyle.lineHeight,
          fontFamily: pStyle.fontFamily,
          color: pStyle.color,
          margin: `${pStyle.marginTop} ${pStyle.marginRight} ${pStyle.marginBottom} ${pStyle.marginLeft}`,
        });
      });

      // Buttons and clickable pills
      el.querySelectorAll('button, a[role="button"], input[type="submit"]').forEach((btn) => {
        const bStyle = window.getComputedStyle(btn);
        const bRect = btn.getBoundingClientRect();
        sectionInfo.linksAndButtons.push({
          text: btn.textContent.trim().slice(0, 40),
          width: Math.round(bRect.width),
          height: Math.round(bRect.height),
          fontSize: bStyle.fontSize,
          fontWeight: bStyle.fontWeight,
          fontFamily: bStyle.fontFamily,
          color: bStyle.color,
          backgroundColor: bStyle.backgroundColor,
          border: `${bStyle.borderWidth} ${bStyle.borderStyle} ${bStyle.borderColor}`,
          borderRadius: bStyle.borderRadius,
          padding: `${bStyle.paddingTop} ${bStyle.paddingRight} ${bStyle.paddingBottom} ${bStyle.paddingLeft}`,
          boxShadow: bStyle.boxShadow,
          transition: bStyle.transition,
        });
      });

      // SVGs and images
      el.querySelectorAll('img, svg').forEach((img) => {
        const iStyle = window.getComputedStyle(img);
        const iRect = img.getBoundingClientRect();
        sectionInfo.imagesAndIcons.push({
          tag: img.tagName.toLowerCase(),
          width: Math.round(iRect.width),
          height: Math.round(iRect.height),
          aspectRatio: iRect.height > 0 ? (iRect.width / iRect.height).toFixed(2) : 'N/A',
          objectFit: iStyle.objectFit,
          borderRadius: iStyle.borderRadius,
        });
      });

      data.sections.push(sectionInfo);
    });

    // Collect all computed containers
    document.querySelectorAll('[class*="container"], [class*="max-w"], div').forEach((d) => {
      const style = window.getComputedStyle(d);
      if (style.maxWidth && style.maxWidth !== 'none' && parseInt(style.maxWidth) > 300) {
        data.containers.push({
          maxWidth: style.maxWidth,
          paddingLeft: style.paddingLeft,
          paddingRight: style.paddingRight,
        });
      }
    });

    return data;
  }, isReference);
}

(async () => {
  console.log('🚀 Starting Reference (Tracelo) and Mine Audit across viewports:', VIEWPORTS);
  const browser = await chromium.launch({ headless: true });

  const auditReport = {
    referenceByViewport: {},
    mineByViewport: {},
  };

  // Step 1: Audit Reference (Tracelo)
  console.log('\n--- AUDITING REFERENCE: https://tracelo.com/en/ ---');
  for (const width of VIEWPORTS) {
    const height = width >= 768 ? 900 : 844;
    console.log(`Auditing Reference at ${width}x${height}...`);
    const context = await browser.newContext({
      viewport: { width, height },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    try {
      await page.goto('https://tracelo.com/en/', { waitUntil: 'networkidle', timeout: 35000 });
      await autoScroll(page);
      await page.waitForTimeout(1000);

      const screenshotPath = path.join(REF_DIR, `${width}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Saved screenshot: ${screenshotPath}`);

      const metrics = await extractPageMetrics(page, true);
      auditReport.referenceByViewport[width] = metrics;
    } catch (e) {
      console.error(`Error at ${width}px:`, e.message);
    } finally {
      await context.close();
    }
  }

  // Step 2: Audit Current Site (http://localhost:3000/login)
  console.log('\n--- AUDITING MY SITE: http://localhost:3000/login ---');
  for (const width of VIEWPORTS) {
    const height = width >= 768 ? 900 : 844;
    console.log(`Auditing Mine at ${width}x${height}...`);
    const context = await browser.newContext({
      viewport: { width, height },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    try {
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 30000 });
      await autoScroll(page);
      await page.waitForTimeout(1000);

      const screenshotPath = path.join(MINE_DIR, `${width}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Saved screenshot: ${screenshotPath}`);

      const metrics = await extractPageMetrics(page, false);
      auditReport.mineByViewport[width] = metrics;
    } catch (e) {
      console.error(`Error at ${width}px:`, e.message);
    } finally {
      await context.close();
    }
  }

  await browser.close();

  // Save Raw Audit Metrics
  fs.writeFileSync(path.join(AUDIT_DIR, 'raw_audit.json'), JSON.stringify(auditReport, null, 2));
  console.log('Saved raw metrics to audit/raw_audit.json');

  console.log('✅ Audit run complete! Generating tokens.json and spec.md...');
})();
