/**
 * Single source of truth for everything that changes between environments
 * or business stages: the public URL, social handles, the order path, and
 * analytics IDs. Edit this file — not index.html — when any of these change.
 */
export const SITE = {
  // Public URL of the deployed page (must end with "/"). Switch to the custom
  // domain (e.g. https://etch.cards/) once DNS is live.
  canonicalUrl: "https://siusiutinonfire-ui.github.io/etch-landing/",

  // TODO confirm the handle once the Instagram account is created.
  instagramHandle: "etch.cards",

  // "instagram" — SELECT opens an Instagram DM (interim launch path).
  // "shopify"   — SELECT opens the product's shopifyUrl (falls back to DM
  //               for any product without a url).
  orderPath: "instagram",

  // Analytics. Empty string disables the loader entirely.
  metaPixelId: "", // e.g. "1234567890123456"
  ga4Id: "", // e.g. "G-XXXXXXXXXX"

  products: {
    single: { name: "Single metal card", nameTc: "單張金屬卡", price: 138, shopifyUrl: "" },
    pair: { name: "Element pair", nameTc: "元素組合", price: 198, shopifyUrl: "" },
    set: { name: "Cross-element set", nameTc: "跨元素套裝", price: 298, shopifyUrl: "" },
    giftbox: { name: "Gift box", nameTc: "禮盒裝", price: 168, shopifyUrl: "" },
  },
};

/** @param {typeof SITE} [site] */
export const instagramDmUrl = (site = SITE) => `https://ig.me/m/${site.instagramHandle}`;

/** @param {typeof SITE} [site] */
export const instagramProfileUrl = (site = SITE) => `https://www.instagram.com/${site.instagramHandle}/`;

/** Where "CONTACT" goes. Same channel as ordering while we are DM-only. */
export const contactUrl = (site = SITE) => instagramDmUrl(site);

/**
 * URL a SELECT button should open for a product key.
 * @param {string} key — one of SITE.products keys
 * @param {typeof SITE} [site]
 */
export function orderUrl(key, site = SITE) {
  const product = site.products[key];
  if (site.orderPath === "shopify" && product && product.shopifyUrl) {
    return product.shopifyUrl;
  }
  return instagramDmUrl(site);
}
