import { test, expect } from "./fixtures.js";

async function meta(page, selector) {
  return page.locator(selector).first().getAttribute("content");
}

test.describe("Meta and social tags", () => {
  test("canonical and Open Graph URLs are absolute and point at the real site", async ({ page }) => {
    await page.goto("./");
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toMatch(/^https:\/\/.+\/$/);
    expect(canonical).not.toContain("example.com");

    expect(await meta(page, 'meta[property="og:url"]')).toBe(canonical);
    const ogImage = await meta(page, 'meta[property="og:image"]');
    expect(ogImage).toMatch(/^https:\/\//);
    expect(ogImage.startsWith(canonical)).toBe(true);
    expect(await meta(page, 'meta[property="og:image:width"]')).toBe("1200");
    expect(await meta(page, 'meta[property="og:image:height"]')).toBe("630");
    expect(await meta(page, 'meta[property="og:locale"]')).toBeTruthy();
    expect(await meta(page, 'meta[name="twitter:card"]')).toBe("summary_large_image");
    expect(await meta(page, 'meta[name="theme-color"]')).toBeTruthy();
  });

  test("OG image, favicon and robots.txt are served", async ({ page }) => {
    await page.goto("./");
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    const ogImage = await meta(page, 'meta[property="og:image"]');
    // Base-relative so the same test works under the GitHub Pages sub-path.
    const ogLocal = ogImage.slice(canonical.length);

    const og = await page.request.get(ogLocal);
    expect(og.status(), `GET ${ogLocal}`).toBe(200);
    expect(og.headers()["content-type"]).toContain("image/");

    const icon = await page.locator('link[rel="icon"]').getAttribute("href");
    expect(icon).toBeTruthy();
    expect(icon.startsWith("data:")).toBe(false);
    const iconRes = await page.request.get(icon);
    expect(iconRes.status(), `GET ${icon}`).toBe(200);

    const robots = await page.request.get("robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("User-agent");
  });
});
