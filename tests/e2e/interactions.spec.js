import { test, expect } from "@playwright/test";

test.describe("Interactions", () => {
  test("FAQ accordion opens and closes", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.getElementById("section-7").scrollIntoView());
    await page.waitForTimeout(500);

    const firstItem = page.locator(".faq__item").first();
    const firstSummary = firstItem.locator("summary");

    // Initially closed
    await expect(firstItem).not.toHaveAttribute("open");

    // Click to open
    await firstSummary.click();
    await expect(firstItem).toHaveAttribute("open", "");

    // Click to close
    await firstSummary.click();
    await expect(firstItem).not.toHaveAttribute("open");
  });

  test("FAQ exclusive accordion — only one open at a time", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.getElementById("section-7").scrollIntoView());
    await page.waitForTimeout(500);

    const items = page.locator(".faq__item");
    const first = items.nth(0);
    const second = items.nth(1);

    // Open first
    await first.locator("summary").click();
    await expect(first).toHaveAttribute("open", "");

    // Open second — first should close
    await second.locator("summary").click();
    await page.waitForTimeout(100);
    await expect(second).toHaveAttribute("open", "");
    await expect(first).not.toHaveAttribute("open");
  });

  test("hero CTA scrolls to Section 3", async ({ page }) => {
    await page.goto("/");
    await page.locator(".cta--primary").click();
    await page.waitForTimeout(1500);

    const section3Top = await page.locator("#section-3").evaluate(
      (el) => el.getBoundingClientRect().top
    );
    expect(Math.abs(section3Top)).toBeLessThan(200);
  });
});
