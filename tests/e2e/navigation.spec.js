import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("sticky nav appears after scrolling past hero", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("#site-nav");

    // Nav hidden initially
    await expect(nav).not.toHaveClass(/is-visible/);

    // Scroll past hero
    await page.evaluate(() => window.scrollTo(0, window.innerHeight + 100));
    await page.waitForTimeout(300);

    await expect(nav).toHaveClass(/is-visible/);
  });

  test("SHOP link in nav smooth-scrolls to pricing", async ({ page }) => {
    await page.goto("/");

    // Scroll to make nav visible
    await page.evaluate(() => window.scrollTo(0, window.innerHeight + 100));
    await page.waitForTimeout(300);

    // Click SHOP
    await page.locator(".site-nav__shop").click();
    await page.waitForTimeout(1000);

    // Verify scrolled near Section 6
    const section6Top = await page.locator("#section-6").evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.abs(section6Top)).toBeLessThan(200);
  });

  test("element tabs navigate between elements", async ({ page }) => {
    await page.goto("/");

    // Scroll to Section 3
    await page.evaluate(() => {
      document.getElementById("section-3").scrollIntoView();
    });
    await page.waitForTimeout(500);

    // Click 水 tab
    await page.locator('[data-target="element-water"]').click();
    await page.waitForTimeout(1000);

    // Verify 水 tab is active
    await expect(page.locator('[data-target="element-water"]')).toHaveClass(/is-active/);
  });
});
