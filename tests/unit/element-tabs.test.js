import { describe, it, expect, vi, beforeEach } from "vitest";
import { getActiveElement, initElementTabs } from "../../js/element-tabs.js";

describe("element-tabs", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <nav class="element-tabs" id="element-tabs">
        <button class="element-tabs__btn is-active" data-target="element-metal">金</button>
        <button class="element-tabs__btn" data-target="element-wood">木</button>
        <button class="element-tabs__btn" data-target="element-water">水</button>
      </nav>
      <div id="element-metal" class="element-stage"></div>
      <div id="element-wood" class="element-stage"></div>
      <div id="element-water" class="element-stage"></div>
    `;
  });

  describe("getActiveElement", () => {
    it("returns the id of the element stage closest to viewport center", () => {
      const stages = document.querySelectorAll(".element-stage");
      stages[0].getBoundingClientRect = () => ({ top: -500, bottom: 200 });
      stages[1].getBoundingClientRect = () => ({ top: 100, bottom: 800 });
      stages[2].getBoundingClientRect = () => ({ top: 1200, bottom: 1900 });

      Object.defineProperty(window, "innerHeight", { value: 900, writable: true });

      const result = getActiveElement();
      expect(result).toBe("element-wood");
    });
  });

  describe("initElementTabs", () => {
    it("scrolls to target element on button click", () => {
      initElementTabs();
      const target = document.getElementById("element-wood");
      target.scrollIntoView = vi.fn();

      const btn = document.querySelector('[data-target="element-wood"]');
      btn.click();

      expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
    });

    it("updates is-active class on click", () => {
      initElementTabs();
      const target = document.getElementById("element-wood");
      target.scrollIntoView = vi.fn();

      const btn = document.querySelector('[data-target="element-wood"]');
      btn.click();

      expect(btn.classList.contains("is-active")).toBe(true);
      const metalBtn = document.querySelector('[data-target="element-metal"]');
      expect(metalBtn.classList.contains("is-active")).toBe(false);
    });
  });
});
