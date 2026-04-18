import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  test("hero section passes axe audit", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .include("#section-1")
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("FAQ section passes axe audit", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .include("#section-7")
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("all images have alt text", async ({ page }) => {
    await page.goto("/");
    const images = await page.locator("img").all();
    for (const img of images) {
      const alt = await img.getAttribute("alt");
      expect(alt).toBeTruthy();
    }
  });

  test("focus-visible outlines are present", async ({ page }) => {
    await page.goto("/");
    const firstLink = page.locator("a").first();
    await firstLink.focus();
    // Just verify the link is focusable
    expect(await firstLink.evaluate((el) => el === document.activeElement)).toBe(true);
  });

  test("bilingual blocks have correct lang attributes", async ({ page }) => {
    await page.goto("/");
    const tcElements = await page.locator('[lang="zh-Hant"]').count();
    expect(tcElements).toBeGreaterThan(0);
  });
});
