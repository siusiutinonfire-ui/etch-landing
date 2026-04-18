import { test, expect } from "@playwright/test";

test.describe("Page Load", () => {
  test("page loads without JavaScript errors", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/");
    expect(errors).toEqual([]);
  });

  test("hero section is visible on load", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("#section-1");
    await expect(hero).toBeVisible();
  });

  test("hero title displays bilingual text", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".hero__title")).toContainText("Words worth carrying.");
    await expect(page.locator(".hero__title-tc")).toContainText("有些話，值得隨身攜帶。");
  });

  test("both CTA buttons are visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".cta--primary")).toBeVisible();
    await expect(page.locator(".cta--ghost")).toBeVisible();
  });

  test("page has correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ETCH Element Cards/);
  });
});
