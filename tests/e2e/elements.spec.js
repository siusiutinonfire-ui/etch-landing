import { test, expect } from "./fixtures.js";

/**
 * Scroll so that the top of the stage is `fraction` of its own height above
 * the viewport top — i.e. we are `fraction` of the way through the stage.
 */
async function scrollIntoStage(page, id, fraction) {
  await page.evaluate(
    ([sel, f]) => {
      const el = document.querySelector(sel);
      const top = el.getBoundingClientRect().top + window.scrollY + el.offsetHeight * f;
      window.scrollTo({ top, behavior: "instant" });
    },
    [id, fraction]
  );
  await page.waitForTimeout(400);
}

test.describe("Five Elements stages", () => {
  for (const id of ["#element-metal", "#element-wood", "#element-water"]) {
    test(`${id} background and text stay pinned 40% into the stage`, async ({ page }) => {
      await page.goto("/");
      await scrollIntoStage(page, id, 0.4);

      const tops = await page.evaluate((sel) => {
        const st = document.querySelector(sel);
        return {
          stage: st.getBoundingClientRect().top,
          bg: st.querySelector(".element-stage__bg-wrap").getBoundingClientRect().top,
          content: st.querySelector(".element-stage__content").getBoundingClientRect().top,
        };
      }, id);

      // Sanity: we really are inside the stage, not above it.
      expect(tops.stage).toBeLessThan(-100);
      // The sticky layers must be pinned to the top of the viewport.
      expect(Math.abs(tops.bg)).toBeLessThan(2);
      expect(Math.abs(tops.content)).toBeLessThan(2);
    });
  }
});
