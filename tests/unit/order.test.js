import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { initOrderButtons, orderMessage } from "../../js/order.js";
import { SITE } from "../../js/config.js";

function click(el) {
  el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
}

/** Let the clipboard promise chain settle (a macrotask runs after all microtasks). */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function setClipboard(value) {
  Object.defineProperty(navigator, "clipboard", { value, configurable: true });
}

beforeEach(() => {
  document.body.innerHTML = `
    <a data-order="pair" href="https://ig.me/m/etch.cards" target="_blank" rel="noopener">SELECT</a>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>
  `;
});

afterEach(() => {
  vi.useRealTimers();
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
  it("copies the DM message and confirms it in the toast when the clipboard write succeeds", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    const onOrder = vi.fn();

    initOrderButtons({ site: SITE, onOrder });
    click(document.querySelector("[data-order]"));
    await flush();

    expect(writeText).toHaveBeenCalledWith(orderMessage("pair", SITE));
    expect(onOrder).toHaveBeenCalledWith("pair");
    const toast = document.getElementById("toast");
    expect(toast.classList.contains("is-visible")).toBe(true);
    expect(toast.textContent).toContain("copied");
    expect(toast.textContent).toContain("Instagram");
  });

  it("does not claim a copy when the clipboard is unavailable", async () => {
    setClipboard(undefined);
    const onOrder = vi.fn();
    initOrderButtons({ site: SITE, onOrder });
    click(document.querySelector("[data-order]"));
    await flush();

    const toast = document.getElementById("toast");
    expect(onOrder).toHaveBeenCalledWith("pair");
    expect(toast.classList.contains("is-visible")).toBe(true);
    expect(toast.textContent).not.toContain("copied");
    expect(toast.textContent).toContain("tell us");
  });

  it("does not claim a copy when the clipboard write is rejected or throws", async () => {
    setClipboard({ writeText: () => Promise.reject(new Error("denied")) });
    initOrderButtons({ site: SITE, onOrder: () => {} });
    click(document.querySelector("[data-order]"));
    await flush();
    expect(document.getElementById("toast").textContent).not.toContain("copied");

    setClipboard({
      writeText: () => {
        throw new Error("not allowed");
      },
    });
    expect(() => click(document.querySelector("[data-order]"))).not.toThrow();
    await flush();
    expect(document.getElementById("toast").textContent).not.toContain("copied");
  });

  it("does not block the link navigation", () => {
    setClipboard({ writeText: () => Promise.resolve() });
    initOrderButtons({ site: SITE, onOrder: () => {} });
    const ev = new MouseEvent("click", { bubbles: true, cancelable: true });
    document.querySelector("[data-order]").dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(false);
  });

  it("hides the toast again after the timeout", async () => {
    vi.useFakeTimers();
    setClipboard({ writeText: () => Promise.resolve() });
    initOrderButtons({ site: SITE, onOrder: () => {}, toastMs: 1000 });
    click(document.querySelector("[data-order]"));
    await vi.advanceTimersByTimeAsync(0);
    const toast = document.getElementById("toast");
    expect(toast.classList.contains("is-visible")).toBe(true);
    await vi.advanceTimersByTimeAsync(1100);
    expect(toast.classList.contains("is-visible")).toBe(false);
  });
});
