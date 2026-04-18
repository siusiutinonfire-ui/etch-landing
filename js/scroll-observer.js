/**
 * Factory for IntersectionObserver with fade-in support and reduced-motion awareness.
 *
 * @param {Object} options
 * @param {number} options.threshold — visibility ratio to trigger (0-1)
 * @param {Function} [options.onEnter] — called when element enters viewport
 * @param {Function} [options.onExit] — called when element exits viewport
 * @param {boolean} [options.reduceMotion] — if true, skip animations and show immediately
 * @param {string} [options.rootMargin] — IntersectionObserver rootMargin
 * @returns {{ observeAll: Function, disconnect: Function, _observer: IntersectionObserver }}
 */
export function createScrollObserver({
  threshold = 0.1,
  onEnter = null,
  onExit = null,
  reduceMotion = false,
  rootMargin = "0px",
} = {}) {
  const prefersReducedMotion =
    reduceMotion ||
    (typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          if (onEnter) onEnter(entry.target);
        } else {
          if (onExit) onExit(entry.target);
        }
      }
    },
    { threshold, rootMargin }
  );

  return {
    _observer: observer,

    observeAll(elements) {
      for (const el of elements) {
        if (prefersReducedMotion) {
          el.classList.add("is-visible");
        } else {
          observer.observe(el);
        }
      }
    },

    disconnect() {
      observer.disconnect();
    },
  };
}
