import { test, expect } from "./fixtures.js";
import { jumpTo } from "./helpers.js";

const MB = 1024 * 1024;

test.describe("Assets", () => {
  test("element stage backgrounds are real photographs with WebP sources", async ({ page }) => {
    await page.goto("./");
    for (const id of ["element-metal", "element-wood", "element-water"]) {
      await jumpTo(page, `#${id}`);
      const picture = page.locator(`#${id} picture`);
      await expect(picture.locator('source[type="image/webp"]')).toHaveCount(1);
      const img = picture.locator("img");
      expect(await img.getAttribute("width")).toBeTruthy();
      expect(await img.getAttribute("height")).toBeTruthy();
      const naturalWidth = await img.evaluate(async (el) => {
        await el.decode();
        return el.naturalWidth;
      });
      expect(naturalWidth, `${id} background should be a real image`).toBeGreaterThan(600);
    }
  });

  test("hero and craft visuals have accessible names", async ({ page }) => {
    await page.goto("./");
    for (const section of ["#section-1", "#section-2"]) {
      const visual = page.locator(`${section} [role="img"]`);
      await expect(visual).toHaveCount(1);
      expect(await visual.getAttribute("aria-label")).toBeTruthy();
    }
  });

  test("no image on the page is a 1x1 placeholder", async ({ page }) => {
    await page.goto("./");
    for (const img of await page.locator("img").all()) {
      await img.scrollIntoViewIfNeeded();
      const naturalWidth = await img.evaluate(async (el) => {
        try {
          await el.decode();
        } catch {
          /* decode rejects for broken images; naturalWidth will be 0 */
        }
        return el.naturalWidth;
      });
      expect(naturalWidth).toBeGreaterThan(1);
    }
  });

  test("image and script weight stays under the mobile budget", async ({ page }) => {
    const bytes = { images: 0, other: 0 };
    page.on("response", async (res) => {
      const url = res.url();
      if (url.includes("fonts.g")) return; // Google Fonts are outside our budget
      const len = Number(res.headers()["content-length"] || 0);
      if (/\.(jpe?g|webp|avif|png|svg)(\?|$)/i.test(url)) bytes.images += len;
      else bytes.other += len;
    });
    await page.goto("./", { waitUntil: "networkidle" });
    for (const id of ["element-metal", "element-wood", "element-water"]) await jumpTo(page, `#${id}`);
    await page.waitForLoadState("networkidle");
    expect(bytes.images, "images").toBeLessThan(1.2 * MB);
    expect(bytes.images + bytes.other, "total excluding fonts").toBeLessThan(2 * MB);
  });
});
