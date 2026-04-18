import { initSmoothScroll } from "./smooth-scroll.js";
import { createScrollObserver } from "./scroll-observer.js";
import { initElementScroll } from "./element-scroll.js";
import { initElementTabs } from "./element-tabs.js";
import { initFaqAccordion } from "./faq-accordion.js";

document.addEventListener("DOMContentLoaded", () => {
  initSmoothScroll();
  initElementScroll();
  initElementTabs();
  initFaqAccordion();

  // Fade-in elements on scroll
  const fadeObserver = createScrollObserver({ threshold: 0.15 });
  fadeObserver.observeAll(document.querySelectorAll(".fade-in"));
});
