import { test, expect } from "./fixtures.js";
import AxeBuilder from "@axe-core/playwright";

/**
 * Make every scroll-revealed element visible so axe can evaluate the whole
 * page in one pass (fade-ins, element stages, sticky nav).
 */
async function revealEverything(page) {
  await page.addStyleTag({ content: "*{transition:none !important;animation:none !important}" });
  await page.evaluate(() => {
    document.querySelectorAll(".fade-in").forEach((e) => e.classList.add("is-visible"));
    document.querySelectorAll(".element-stage").forEach((e) => e.classList.add("element-stage--visible"));
    document.getElementById("site-nav")?.classList.add("is-visible");
    document.querySelectorAll(".element-stage__overlay").forEach((o) => {
      o.style.opacity = "0.5";
    });
  });
  await page.waitForTimeout(300);
}

test.describe("Accessibility", () => {
  test("whole page passes the axe audit", async ({ page }) => {
    await page.goto("/");
    await revealEverything(page);
    const results = await new AxeBuilder({ page })
      // The oversized 01/02/03 numerals are aria-hidden decoration and are
      // exempt from contrast requirements (WCAG 1.4.3 "pure decoration").
      .exclude('[aria-hidden="true"]')
      .analyze();
    const summary = results.violations.map(
      (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`
    );
    expect(summary).toEqual([]);
  });

  test("all images have alt text", async ({ page }) => {
    await page.goto("/");
    for (const img of await page.locator("img").all()) {
      expect(await img.getAttribute("alt")).toBeTruthy();
    }
  });

  test("first link is focusable and receives focus", async ({ page }) => {
    await page.goto("/");
    const firstLink = page.locator("a").first();
    await firstLink.focus();
    expect(await firstLink.evaluate((el) => el === document.activeElement)).toBe(true);
  });

  test("Traditional Chinese text is marked with lang=zh-Hant", async ({ page }) => {
    await page.goto("/");
    const tcSelectors = [".display-tc", ".sub-tc", ".body-tc", ".cta-text-tc", ".element-tabs__btn", ".hero__title-tc"];
    for (const sel of tcSelectors) {
      const total = await page.locator(sel).count();
      expect(total, `${sel} should exist`).toBeGreaterThan(0);
      const missing = await page.locator(`${sel}:not([lang="zh-Hant"])`).count();
      expect(missing, `${sel} elements without lang="zh-Hant"`).toBe(0);
    }
  });

  test("each element stage is a section labelled by its heading", async ({ page }) => {
    await page.goto("/");
    const stages = page.locator(".element-stage");
    expect(await stages.count()).toBe(3);
    for (const stage of await stages.all()) {
      expect(await stage.evaluate((el) => el.tagName)).toBe("SECTION");
      const labelledBy = await stage.getAttribute("aria-labelledby");
      expect(labelledBy).toBeTruthy();
      await expect(page.locator(`h2#${labelledBy}`)).toHaveCount(1);
    }
  });

  test("the scenes carousel is a keyboard-reachable list", async ({ page }) => {
    await page.goto("/");
    const scroller = page.locator(".scenes__scroll");
    expect(await scroller.evaluate((el) => el.tagName)).toBe("UL");
    await expect(scroller).toHaveAttribute("tabindex", "0");
    expect(await scroller.getAttribute("aria-label")).toBeTruthy();
    expect(await scroller.locator("> li.scene-card").count()).toBe(5);
  });
});
