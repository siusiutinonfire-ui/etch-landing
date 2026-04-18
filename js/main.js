import { initSmoothScroll } from "./smooth-scroll.js";
import { createScrollObserver } from "./scroll-observer.js";
import { initElementScroll } from "./element-scroll.js";
import { initElementTabs } from "./element-tabs.js";

document.addEventListener("DOMContentLoaded", () => {
  initSmoothScroll();
  initElementScroll();
  initElementTabs();

  // Fade-in elements on scroll
  const fadeObserver = createScrollObserver({ threshold: 0.15 });
  fadeObserver.observeAll(document.querySelectorAll(".fade-in"));
});
