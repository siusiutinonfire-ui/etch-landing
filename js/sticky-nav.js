/**
 * Determine if the sticky nav should be visible.
 * @param {number} scrollY — current scroll position
 * @param {number} heroHeight — height of the hero section
 * @returns {boolean}
 */
export function shouldShowNav(scrollY, heroHeight) {
  return scrollY >= heroHeight;
}

/**
 * Initialise the sticky navigation bar.
 * Shows/hides based on scroll position relative to hero.
 */
export function initStickyNav() {
  const nav = document.getElementById("site-nav");
  const hero = document.getElementById("section-1");
  if (!nav || !hero) return;

  let ticking = false;

  function update() {
    const heroHeight = hero.offsetHeight;
    const show = shouldShowNav(window.scrollY, heroHeight);
    nav.classList.toggle("is-visible", show);
  }

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    },
    { passive: true }
  );

  // Initial check
  update();
}
