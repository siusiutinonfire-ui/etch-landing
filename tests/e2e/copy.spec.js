import { test, expect } from "@playwright/test";

test.describe("Pricing copy", () => {
  test("free HK shipping threshold is HK$198 so the element pair qualifies", async ({ page }) => {
    await page.goto("/");
    const banner = page.locator("#shipping-info");
    await expect(banner).toContainText("HK$198");
    await expect(banner).not.toContainText("HK$200");
    // The pair must be priced at or above the threshold shown.
    await expect(page.locator(".pricing-card").nth(1)).toContainText("HK$198");
  });

  test("gift box shows a starting price rather than a bare range", async ({ page }) => {
    await page.goto("/");
    const giftBox = page.locator(".pricing-card").nth(3);
    await expect(giftBox).toContainText("Gift box");
    await expect(giftBox.locator(".pricing-card__price")).toContainText("From HK$168");
    await expect(giftBox.locator(".pricing-card__price")).not.toContainText("–");
  });
});
