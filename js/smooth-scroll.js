/**
 * Initialise smooth-scroll behavior on all `.js-smooth-scroll` links.
 * Each link's `href` must be an anchor like `#section-3`.
 */
export function initSmoothScroll() {
  const links = document.querySelectorAll(".js-smooth-scroll");

  for (const link of links) {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || !targetId.startsWith("#")) return;

      const target = document.getElementById(targetId.slice(1));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    });
  }
}
