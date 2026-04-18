import { describe, it, expect, vi, beforeEach } from "vitest";
import { initSmoothScroll } from "../../js/smooth-scroll.js";

describe("smooth-scroll", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <a href="#section-3" class="js-smooth-scroll">Explore</a>
      <a href="#section-6" class="js-smooth-scroll">Shop</a>
      <div id="section-3" style="margin-top:2000px">Target</div>
      <div id="section-6" style="margin-top:4000px">Shop</div>
    `;

    // jsdom does not implement scrollIntoView — stub it on all target elements
    for (const el of document.querySelectorAll("[id]")) {
      el.scrollIntoView = vi.fn();
    }
  });

  it("prevents default click behavior on smooth-scroll links", () => {
    initSmoothScroll();
    const link = document.querySelector('a[href="#section-3"]');
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    const prevented = !link.dispatchEvent(event);
    expect(prevented).toBe(true);
  });

  it("calls scrollIntoView on the target element", () => {
    initSmoothScroll();
    const target = document.getElementById("section-3");
    target.scrollIntoView = vi.fn();
    const link = document.querySelector('a[href="#section-3"]');
    link.click();
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("does nothing if target element does not exist", () => {
    document.body.innerHTML = `<a href="#nonexistent" class="js-smooth-scroll">Bad link</a>`;
    initSmoothScroll();
    const link = document.querySelector("a");
    expect(() => link.click()).not.toThrow();
  });
});
