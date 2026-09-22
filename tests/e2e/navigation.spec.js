import { test, expect } from "./fixtures.js";
import { distanceToTop } from "./helpers.js";

test.describe("Navigation", () => {
  test("sticky nav appears after scrolling past hero", async ({ page }) => {
    await page.goto("./");
    const nav = page.locator("#site-nav");

    await expect(nav).not.toHaveClass(/is-visible/);

    await page.evaluate(() => window.scrollTo({ top: window.innerHeight + 100, behavior: "instant" }));
    await expect(nav).toHaveClass(/is-visible/);
  });

  test("SHOP link in nav smooth-scrolls to pricing", async ({ page }) => {
    await page.goto("./");

    await page.evaluate(() => window.scrollTo({ top: window.innerHeight + 100, behavior: "instant" }));
    await expect(page.locator("#site-nav")).toHaveClass(/is-visible/);

    await page.locator(".site-nav__shop").click();
    await expect.poll(() => distanceToTop(page, "#section-6"), { timeout: 8000 }).toBeLessThan(200);
  });

  test("element tabs navigate between elements", async ({ page }) => {
    await page.goto("./");

    await page.evaluate(() => document.getElementById("section-3").scrollIntoView({ behavior: "instant" }));
    await page.waitForTimeout(200);

    await page.locator('[data-target="element-water"]').click();
    await expect.poll(() => distanceToTop(page, "#element-water"), { timeout: 8000 }).toBeLessThan(2);
    await expect(page.locator('[data-target="element-water"]')).toHaveClass(/is-active/);
  });
});
