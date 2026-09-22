/**
 * Render the hero section at 1200×630 with the real web fonts and save it
 * as the Open Graph image. Serves the landing-page folder straight from
 * disk through Playwright request routing, so no dev server is needed.
 *
 *   node scripts/build-og-image.cjs            → assets/og-image.jpg
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("@playwright/test");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "assets", "og-image.jpg");
const ORIGIN = "https://etch.local";
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".txt": "text/plain",
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

  await page.route(`${ORIGIN}/**`, (route) => {
    const url = new URL(route.request().url());
    const rel = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: "not found" });
    return route.fulfill({ status: 200, contentType: TYPES[path.extname(file)] || "application/octet-stream", body: fs.readFileSync(file) });
  });

  await page.goto(`${ORIGIN}/`, { waitUntil: "load", timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  // At 1200x630 the bottom-anchored copy would sit over the card; slide the visual right for the preview.
  await page.addStyleTag({ content: ".hero__scroll-indicator{display:none !important} .hero__visual{transform:translateX(12%)}" });

  const hero = page.locator("#section-1");
  await hero.screenshot({ path: OUT, type: "jpeg", quality: 82 });
  await browser.close();

  const kb = Math.round(fs.statSync(OUT).size / 1024);
  console.log(`wrote ${path.relative(ROOT, OUT)} (${kb} KB)`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
