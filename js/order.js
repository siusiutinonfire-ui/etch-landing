/**
 * Interim order flow: a SELECT button opens an Instagram DM. Because
 * ig.me links cannot carry a prefilled message, we try to copy a short
 * order message to the clipboard and tell the visitor what happened.
 */

const DEFAULT_TOAST_MS = 4000;

const TOAST_COPIED =
  "Order message copied. Paste it into your Instagram DM.\n" +
  "已複製訂購訊息，請貼上到 Instagram 私訊。";

const TOAST_MANUAL =
  "Opening Instagram. In the DM, tell us which card you'd like.\n" +
  "正在開啟 Instagram，請在私訊中告訴我們你想要的卡片。";

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
 * Try to copy text. Resolves true only when the write actually succeeded.
 * The write is issued synchronously inside the click handler so browsers
 * that require a user gesture (Safari) accept it.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
function copyText(text) {
  const clipboard = typeof navigator !== "undefined" ? navigator.clipboard : undefined;
  if (!clipboard || typeof clipboard.writeText !== "function") return Promise.resolve(false);
  try {
    return Promise.resolve(clipboard.writeText(text)).then(
      () => true,
      () => false
    );
  } catch {
    return Promise.resolve(false);
  }
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

  /** @param {string} text */
  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("is-visible");
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => toast.classList.remove("is-visible"), toastMs);
  }

  for (const anchor of document.querySelectorAll("a[data-order]")) {
    anchor.addEventListener("click", () => {
      const key = anchor.getAttribute("data-order") || "";
      onOrder(key);
      copyText(orderMessage(key, site)).then((copied) => showToast(copied ? TOAST_COPIED : TOAST_MANUAL));
      // No preventDefault: the anchor navigates to the DM as normal.
    });
  }
}
