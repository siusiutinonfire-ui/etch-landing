import { initSmoothScroll } from "./smooth-scroll.js";
import { createScrollObserver } from "./scroll-observer.js";

document.addEventListener("DOMContentLoaded", () => {
  initSmoothScroll();

  // Fade-in elements on scroll
  const fadeObserver = createScrollObserver({ threshold: 0.15 });
  fadeObserver.observeAll(document.querySelectorAll(".fade-in"));
});
