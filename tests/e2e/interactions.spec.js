import { test, expect } from "./fixtures.js";
import { waitForScrollEnd, jumpTo } from "./helpers.js";

test.describe("Interactions", () => {
  test("FAQ accordion opens and closes", async ({ page }) => {
    await page.goto("/");
    await jumpTo(page, "#section-7");

    const firstItem = page.locator(".faq__item").first();
    const firstSummary = firstItem.locator("summary");

    await expect(firstItem).not.toHaveAttribute("open");
    await firstSummary.click();
    await expect(firstItem).toHaveAttribute("open", "");
    await firstSummary.click();
    await expect(firstItem).not.toHaveAttribute("open");
  });

  test("FAQ exclusive accordion — only one open at a time", async ({ page }) => {
    await page.goto("/");
    await jumpTo(page, "#section-7");

    const items = page.locator(".faq__item");
    const first = items.nth(0);
    const second = items.nth(1);

    await first.locator("summary").click();
    await expect(first).toHaveAttribute("open", "");

    await second.locator("summary").click();
    await expect(second).toHaveAttribute("open", "");
    await expect(first).not.toHaveAttribute("open");
  });

  test("hero primary CTA scrolls to Section 3", async ({ page }) => {
    await page.goto("/");
    await page.locator("#section-1 .cta--primary").click();
    await waitForScrollEnd(page);

    const section3Top = await page.locator("#section-3").evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.abs(section3Top)).toBeLessThan(200);
  });

  test("hero ghost CTA scrolls to pricing", async ({ page }) => {
    await page.goto("/");
    await page.locator("#section-1 .cta--ghost").click();
    await waitForScrollEnd(page);

    const section6Top = await page.locator("#section-6").evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.abs(section6Top)).toBeLessThan(200);
  });
});
