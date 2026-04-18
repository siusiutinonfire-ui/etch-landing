import { describe, it, expect, vi, beforeEach } from "vitest";
import { createScrollObserver } from "../../js/scroll-observer.js";

describe("scroll-observer", () => {
  let mockIntersectionObserver;

  beforeEach(() => {
    mockIntersectionObserver = vi.fn((callback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      _callback: callback,
    }));
    vi.stubGlobal("IntersectionObserver", mockIntersectionObserver);
  });

  it("creates an IntersectionObserver with given threshold", () => {
    createScrollObserver({ threshold: 0.2 });
    expect(mockIntersectionObserver).toHaveBeenCalledOnce();
    expect(mockIntersectionObserver.mock.calls[0][1]).toEqual(
      expect.objectContaining({ threshold: 0.2 })
    );
  });

  it("observes all provided elements", () => {
    document.body.innerHTML = `<div class="target">A</div><div class="target">B</div>`;
    const elements = document.querySelectorAll(".target");
    const observer = createScrollObserver({ threshold: 0.1 });
    observer.observeAll(elements);
    expect(observer._observer.observe).toHaveBeenCalledTimes(2);
  });

  it("calls onEnter callback when element enters viewport", () => {
    const onEnter = vi.fn();
    createScrollObserver({ threshold: 0.1, onEnter });
    const callback = mockIntersectionObserver.mock.calls[0][0];
    const mockEntry = { isIntersecting: true, target: document.createElement("div") };
    callback([mockEntry]);
    expect(onEnter).toHaveBeenCalledWith(mockEntry.target);
  });

  it("does not call onEnter when element exits viewport", () => {
    const onEnter = vi.fn();
    createScrollObserver({ threshold: 0.1, onEnter });
    const callback = mockIntersectionObserver.mock.calls[0][0];
    const mockEntry = { isIntersecting: false, target: document.createElement("div") };
    callback([mockEntry]);
    expect(onEnter).not.toHaveBeenCalled();
  });

  it("respects prefers-reduced-motion and sets elements visible immediately", () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    document.body.innerHTML = `<div class="target fade-in">A</div>`;
    const elements = document.querySelectorAll(".target");
    const observer = createScrollObserver({ threshold: 0.1, reduceMotion: true });
    observer.observeAll(elements);
    expect(elements[0].classList.contains("is-visible")).toBe(true);
  });
});
