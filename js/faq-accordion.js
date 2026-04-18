/**
 * Progressive enhancement for FAQ <details> elements.
 * Implements exclusive accordion: opening one closes others.
 */
export function initFaqAccordion() {
  const items = document.querySelectorAll(".faq__item");
  if (items.length === 0) return;

  for (const item of items) {
    item.addEventListener("toggle", () => {
      if (item.open) {
        for (const other of items) {
          if (other !== item && other.open) {
            other.removeAttribute("open");
          }
        }
      }
    });
  }
}
