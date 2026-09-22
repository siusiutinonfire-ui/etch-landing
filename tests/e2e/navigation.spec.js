import { test, expect } from "./fixtures.js";
import { waitForScrollEnd } from "./helpers.js";

test.describe("Navigation", () => {
  test("sticky nav appears after scrolling past hero", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("#site-nav");

    await expect(nav).not.toHaveClass(/is-visible/);

    await page.evaluate(() => window.scrollTo({ top: window.innerHeight + 100, behavior: "instant" }));
    await expect(nav).toHaveClass(/is-visible/);
  });

  test("SHOP link in nav smooth-scrolls to pricing", async ({ page }) => {
    await page.goto("/");

    await page.evaluate(() => window.scrollTo({ top: window.innerHeight + 100, behavior: "instant" }));
    await expect(page.locator("#site-nav")).toHaveClass(/is-visible/);

    await page.locator(".site-nav__shop").click();
    await waitForScrollEnd(page);

    const section6Top = await page.locator("#section-6").evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.abs(section6Top)).toBeLessThan(200);
  });

  test("element tabs navigate between elements", async ({ page }) => {
    await page.goto("/");

    await page.evaluate(() => document.getElementById("section-3").scrollIntoView({ behavior: "instant" }));
    await page.waitForTimeout(200);

    await page.locator('[data-target="element-water"]').click();
    await waitForScrollEnd(page);

    await expect(page.locator('[data-target="element-water"]')).toHaveClass(/is-active/);
    const waterTop = await page.locator("#element-water").evaluate((el) => el.getBoundingClientRect().top);
    expect(waterTop).toBeLessThanOrEqual(1);
  });
});
