import { SITE } from "./config.js";
import { initLinks } from "./links.js";
import { initOrderButtons } from "./order.js";
import { initSmoothScroll } from "./smooth-scroll.js";
import { createScrollObserver } from "./scroll-observer.js";
import { initElementScroll } from "./element-scroll.js";
import { initElementTabs } from "./element-tabs.js";
import { initFaqAccordion } from "./faq-accordion.js";
import { initStickyNav } from "./sticky-nav.js";

document.addEventListener("DOMContentLoaded", () => {
  initLinks(SITE);
  initOrderButtons({ site: SITE });
  initSmoothScroll();
  initElementScroll();
  initElementTabs();
  initFaqAccordion();
  initStickyNav();

  // Fade-in elements on scroll
  const fadeObserver = createScrollObserver({ threshold: 0.15 });
  fadeObserver.observeAll(document.querySelectorAll(".fade-in"));
});
