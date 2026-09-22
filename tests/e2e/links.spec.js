import { test, expect } from "./fixtures.js";

test.describe("Links and order path", () => {
  test("no anchor on the page is a dead '#' link", async ({ page }) => {
    await page.goto("/");
    const dead = await page.locator('a[href="#"]').count();
    expect(dead).toBe(0);
  });

  test("every SELECT button opens the Instagram DM in a new tab", async ({ page }) => {
    await page.goto("/");
    const buttons = page.locator("a[data-order]");
    expect(await buttons.count()).toBe(4);
    for (const a of await buttons.all()) {
      expect(await a.getAttribute("href")).toContain("ig.me/m/");
      expect(await a.getAttribute("target")).toBe("_blank");
      expect(await a.getAttribute("rel")).toContain("noopener");
    }
  });

  test("footer links go somewhere real", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[data-link="shipping"]')).toHaveAttribute("href", "#shipping-info");
    await expect(page.locator("#shipping-info")).toHaveCount(1);
    expect(await page.locator('a[data-link="contact"]').getAttribute("href")).toContain("ig.me/m/");
    expect(await page.locator('a[data-link="instagram"]').getAttribute("href")).toContain("instagram.com/");
  });

  test("clicking SELECT shows the copy-to-DM toast without blocking navigation", async ({ page, context }) => {
    await context.route("https://ig.me/**", (route) => route.fulfill({ status: 200, body: "stub" }));
    await page.goto("/");
    await page.evaluate(() => document.getElementById("section-6").scrollIntoView({ behavior: "instant" }));

    const popupPromise = page.waitForEvent("popup");
    await page.locator("a[data-order]").first().click();
    const popup = await popupPromise;
    expect(popup.url()).toContain("ig.me/m/");
    await popup.close();

    const toast = page.locator("#toast");
    await expect(toast).toHaveClass(/is-visible/);
    await expect(toast).toContainText("Instagram");
  });
});
