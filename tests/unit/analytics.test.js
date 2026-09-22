import { describe, it, expect, beforeEach, vi } from "vitest";
import { initAnalytics } from "../../js/analytics.js";

function scriptSources() {
  return [...document.querySelectorAll("script")].map((s) => s.src);
}

beforeEach(() => {
  document.head.innerHTML = "";
  document.body.innerHTML = "";
  delete window.fbq;
  delete window._fbq;
  delete window.gtag;
  delete window.dataLayer;
});

describe("initAnalytics", () => {
  it("loads nothing and tracks nothing when no IDs are configured", () => {
    const analytics = initAnalytics({ metaPixelId: "", ga4Id: "" });
    expect(scriptSources()).toEqual([]);
    expect(window.fbq).toBeUndefined();
    expect(window.gtag).toBeUndefined();
    expect(analytics.enabled).toBe(false);
    expect(() => analytics.track("ViewContent", { content_name: "landing" })).not.toThrow();
  });

  it("bootstraps the Meta Pixel when metaPixelId is set", () => {
    const analytics = initAnalytics({ metaPixelId: "123456", ga4Id: "" });
    expect(scriptSources().some((s) => s.includes("connect.facebook.net") && s.includes("fbevents.js"))).toBe(true);
    expect(typeof window.fbq).toBe("function");
    expect(window.fbq.queue[0]).toEqual(["init", "123456"]);
    expect(window.fbq.queue[1]).toEqual(["track", "PageView"]);
    expect(analytics.enabled).toBe(true);
  });

  it("bootstraps GA4 when ga4Id is set", () => {
    initAnalytics({ metaPixelId: "", ga4Id: "G-TEST123" });
    expect(scriptSources().some((s) => s.includes("googletagmanager.com/gtag/js?id=G-TEST123"))).toBe(true);
    expect(typeof window.gtag).toBe("function");
    const configCall = [...window.dataLayer].find((args) => args[0] === "config");
    expect(configCall[1]).toBe("G-TEST123");
  });

  it("track() forwards to both vendors with the GA4 event name mapped", () => {
    const analytics = initAnalytics({ metaPixelId: "123", ga4Id: "G-1" });
    window.fbq = vi.fn();
    window.gtag = vi.fn();
    const params = { content_name: "Element pair", value: 198, currency: "HKD" };
    analytics.track("InitiateCheckout", params);
    expect(window.fbq).toHaveBeenCalledWith("track", "InitiateCheckout", params);
    expect(window.gtag).toHaveBeenCalledWith("event", "begin_checkout", params);
  });

  it("maps ViewContent and Contact to GA4 event names", () => {
    const analytics = initAnalytics({ metaPixelId: "", ga4Id: "G-1" });
    window.gtag = vi.fn();
    analytics.track("ViewContent", { content_name: "landing" });
    analytics.track("Contact", {});
    expect(window.gtag).toHaveBeenNthCalledWith(1, "event", "view_item_list", { content_name: "landing" });
    expect(window.gtag).toHaveBeenNthCalledWith(2, "event", "contact", {});
  });

  it("does not call a vendor that was not enabled even if a global exists", () => {
    window.fbq = vi.fn();
    const analytics = initAnalytics({ metaPixelId: "", ga4Id: "G-1" });
    window.gtag = vi.fn();
    analytics.track("Contact", {});
    expect(window.fbq).not.toHaveBeenCalled();
    expect(window.gtag).toHaveBeenCalledTimes(1);
  });

  it("is idempotent: initialising twice injects each loader once", () => {
    initAnalytics({ metaPixelId: "123", ga4Id: "G-1" });
    initAnalytics({ metaPixelId: "123", ga4Id: "G-1" });
    expect(scriptSources().filter((s) => s.includes("fbevents.js")).length).toBe(1);
    expect(scriptSources().filter((s) => s.includes("gtag/js")).length).toBe(1);
  });
});
