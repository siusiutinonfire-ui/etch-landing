import { test, expect } from "./fixtures.js";
import { jumpTo, distanceToTop } from "./helpers.js";

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
    // Smooth scroll: retry until the section has arrived at the top.
    await expect.poll(() => distanceToTop(page, "#section-3"), { timeout: 8000 }).toBeLessThan(200);
  });

  test("hero ghost CTA scrolls to pricing", async ({ page }) => {
    await page.goto("/");
    await page.locator("#section-1 .cta--ghost").click();
    await expect.poll(() => distanceToTop(page, "#section-6"), { timeout: 8000 }).toBeLessThan(200);
  });
});
