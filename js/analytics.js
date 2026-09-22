/**
 * Meta Pixel and GA4, loaded only when an ID is configured in js/config.js.
 * Nothing is injected (and track() is a no-op) while the IDs are empty, so
 * the page ships with no third-party tracking until the owner adds them.
 */

const META_LOADER = "https://connect.facebook.net/en_US/fbevents.js";
const GA4_LOADER = "https://www.googletagmanager.com/gtag/js?id=";

/** Meta event name → GA4 recommended event name. */
const GA4_EVENT_NAMES = {
  PageView: "page_view",
  ViewContent: "view_item_list",
  InitiateCheckout: "begin_checkout",
  Contact: "contact",
};

/** @param {string} src */
function injectScript(src) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

/** @param {string} pixelId */
function bootMetaPixel(pixelId) {
  if (window.fbq) return; // already bootstrapped
  const fbq = function () {
    if (fbq.callMethod) {
      fbq.callMethod.apply(fbq, arguments);
    } else {
      fbq.queue.push(Array.from(arguments));
    }
  };
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.push = fbq;
  window.fbq = fbq;
  window._fbq = fbq;
  injectScript(META_LOADER);
  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
}

/** @param {string} measurementId */
function bootGa4(measurementId) {
  if (window.gtag) return; // already bootstrapped
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  injectScript(GA4_LOADER + encodeURIComponent(measurementId));
  window.gtag("config", measurementId);
}

/**
 * @param {{ metaPixelId?: string, ga4Id?: string }} site
 * @returns {{ enabled: boolean, track: (name: string, params?: Record<string, unknown>) => void }}
 */
export function initAnalytics(site) {
  const meta = Boolean(site.metaPixelId);
  const ga4 = Boolean(site.ga4Id);
  if (meta) bootMetaPixel(site.metaPixelId);
  if (ga4) bootGa4(site.ga4Id);

  return {
    enabled: meta || ga4,
    track(name, params = {}) {
      if (meta && typeof window.fbq === "function") {
        window.fbq("track", name, params);
      }
      if (ga4 && typeof window.gtag === "function") {
        window.gtag("event", GA4_EVENT_NAMES[name] || name.toLowerCase(), params);
      }
    },
  };
}
