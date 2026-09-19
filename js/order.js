/**
 * Interim order flow: a SELECT button opens an Instagram DM. Because
 * ig.me links cannot carry a prefilled message, we copy a short order
 * message to the clipboard and tell the visitor to paste it.
 */

const DEFAULT_TOAST_MS = 4000;

const TOAST_TEXT =
  "Order message copied. Paste it into your Instagram DM.\n" +
  "已複製訂購訊息，請貼上到 Instagram 私訊。";

/**
 * @param {string} key — product key from SITE.products
 * @param {import("./config.js").SITE} site
 * @returns {string}
 */
export function orderMessage(key, site) {
  const product = site.products[key];
  if (!product) return "Hi ETCH, I'd like to place an order.";
  return `Hi ETCH, I'd like to order: ${product.name} (${product.nameTc}) — HK$${product.price}`;
}

/**
 * @param {Object} options
 * @param {import("./config.js").SITE} options.site
 * @param {(key: string) => void} [options.onOrder] — called with the product key
 * @param {number} [options.toastMs]
 */
export function initOrderButtons({ site, onOrder = () => {}, toastMs = DEFAULT_TOAST_MS }) {
  const toast = document.getElementById("toast");
  let hideTimer = 0;

  function showToast() {
    if (!toast) return;
    toast.textContent = TOAST_TEXT;
    toast.classList.add("is-visible");
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => toast.classList.remove("is-visible"), toastMs);
  }

  for (const anchor of document.querySelectorAll("a[data-order]")) {
    anchor.addEventListener("click", () => {
      const key = anchor.getAttribute("data-order") || "";
      const clipboard = typeof navigator !== "undefined" ? navigator.clipboard : undefined;
      if (clipboard && typeof clipboard.writeText === "function") {
        Promise.resolve()
          .then(() => clipboard.writeText(orderMessage(key, site)))
          .catch(() => {
            /* clipboard denied — the DM still opens, the visitor can type */
          });
      }
      showToast();
      onOrder(key);
      // No preventDefault: the anchor navigates to the DM as normal.
    });
  }
}
