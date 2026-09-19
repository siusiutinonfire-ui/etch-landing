import { describe, it, expect, vi, beforeEach } from "vitest";
import { initOrderButtons, orderMessage } from "../../js/order.js";
import { SITE } from "../../js/config.js";

function click(el) {
  el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
}

beforeEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = `
    <a data-order="pair" href="https://ig.me/m/etch.cards" target="_blank" rel="noopener">SELECT</a>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>
  `;
});

describe("orderMessage", () => {
  it("names the product bilingually with its price", () => {
    const msg = orderMessage("pair", SITE);
    expect(msg).toContain("Element pair");
    expect(msg).toContain("元素組合");
    expect(msg).toContain("HK$198");
  });

  it("returns a generic message for an unknown product", () => {
    expect(orderMessage("nope", SITE)).toContain("ETCH");
  });
});

describe("initOrderButtons", () => {
  it("copies the DM message, shows the toast and reports the order key on click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const onOrder = vi.fn();

    initOrderButtons({ site: SITE, onOrder });
    click(document.querySelector("[data-order]"));
    await Promise.resolve();

    expect(writeText).toHaveBeenCalledWith(orderMessage("pair", SITE));
    expect(onOrder).toHaveBeenCalledWith("pair");
    const toast = document.getElementById("toast");
    expect(toast.classList.contains("is-visible")).toBe(true);
    expect(toast.textContent).toContain("Instagram");
  });

  it("does not block the link navigation", () => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.resolve() }, configurable: true });
    initOrderButtons({ site: SITE, onOrder: () => {} });
    const ev = new MouseEvent("click", { bubbles: true, cancelable: true });
    document.querySelector("[data-order]").dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(false);
  });

  it("survives a missing or rejecting clipboard", async () => {
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    initOrderButtons({ site: SITE, onOrder: () => {} });
    expect(() => click(document.querySelector("[data-order]"))).not.toThrow();

    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denied")) },
      configurable: true,
    });
    expect(() => click(document.querySelector("[data-order]"))).not.toThrow();
    await Promise.resolve();
  });

  it("hides the toast again after the timeout", () => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.resolve() }, configurable: true });
    initOrderButtons({ site: SITE, onOrder: () => {}, toastMs: 1000 });
    click(document.querySelector("[data-order]"));
    const toast = document.getElementById("toast");
    expect(toast.classList.contains("is-visible")).toBe(true);
    vi.advanceTimersByTime(1100);
    expect(toast.classList.contains("is-visible")).toBe(false);
    vi.useRealTimers();
  });
});
