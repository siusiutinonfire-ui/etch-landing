/**
 * Resolve once window.scrollY has been stable for `settleMs`. Needed because
 * the page uses CSS smooth scrolling and a fixed wait is flaky on long pages.
 */
export async function waitForScrollEnd(page, { settleMs = 150, timeout = 8000 } = {}) {
  await page.waitForFunction(
    (settle) =>
      new Promise((resolve) => {
        let last = window.scrollY;
        let stableSince = performance.now();
        const tick = () => {
          if (window.scrollY !== last) {
            last = window.scrollY;
            stableSince = performance.now();
          }
          if (performance.now() - stableSince >= settle) return resolve(true);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    settleMs,
    { timeout }
  );
}

/** Instant scroll to an element, then let any observers settle. */
export async function jumpTo(page, selector) {
  await page.evaluate((sel) => {
    document.querySelector(sel).scrollIntoView({ behavior: "instant", block: "start" });
  }, selector);
  await page.waitForTimeout(200);
}
