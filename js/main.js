import { SITE } from "./config.js";
import { initAnalytics } from "./analytics.js";
import { initLinks } from "./links.js";
import { initOrderButtons } from "./order.js";
import { initSmoothScroll } from "./smooth-scroll.js";
import { createScrollObserver } from "./scroll-observer.js";
import { initElementScroll } from "./element-scroll.js";
import { initElementTabs } from "./element-tabs.js";
import { initFaqAccordion } from "./faq-accordion.js";
import { initStickyNav } from "./sticky-nav.js";

document.addEventListener("DOMContentLoaded", () => {
  const analytics = initAnalytics(SITE);
  initLinks(SITE);
  initOrderButtons({
    site: SITE,
    onOrder: (key) => {
      const product = SITE.products[key];
      analytics.track("InitiateCheckout", {
        content_name: product ? product.name : key,
        ...(product ? { value: product.price, currency: "HKD" } : {}),
      });
    },
  });
  for (const link of document.querySelectorAll('a[data-link="contact"]')) {
    link.addEventListener("click", () => analytics.track("Contact", { content_name: "instagram-dm" }));
  }
  analytics.track("ViewContent", { content_name: "ETCH landing page" });
  initSmoothScroll();
  initElementScroll();
  initElementTabs();
  initFaqAccordion();
  initStickyNav();

  // Fade-in elements on scroll
  const fadeObserver = createScrollObserver({ threshold: 0.15 });
  fadeObserver.observeAll(document.querySelectorAll(".fade-in"));
});
