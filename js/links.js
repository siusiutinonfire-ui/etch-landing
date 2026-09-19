import { orderUrl, contactUrl, instagramProfileUrl } from "./config.js";

const EXTERNAL_REL = "noopener noreferrer";

/** @param {Element} anchor @param {string} href */
function setExternal(anchor, href) {
  anchor.setAttribute("href", href);
  anchor.setAttribute("target", "_blank");
  anchor.setAttribute("rel", EXTERNAL_REL);
}

/**
 * Point every placeholder link at its configured destination.
 *
 *   <a data-order="single">      → orderUrl("single")   (external)
 *   <a data-link="shipping">     → #shipping-info       (in-page)
 *   <a data-link="contact">      → contactUrl()         (external)
 *   <a data-link="instagram">    → instagramProfileUrl() (external)
 *
 * The HTML keeps a real fallback href on each of these so the page still
 * works without JavaScript; this only overrides them from config.
 *
 * @param {import("./config.js").SITE} site
 */
export function initLinks(site) {
  for (const anchor of document.querySelectorAll("a[data-order]")) {
    setExternal(anchor, orderUrl(anchor.getAttribute("data-order") || "", site));
  }

  const shipping = document.querySelector('a[data-link="shipping"]');
  if (shipping) shipping.setAttribute("href", "#shipping-info");

  const contact = document.querySelector('a[data-link="contact"]');
  if (contact) setExternal(contact, contactUrl(site));

  const instagram = document.querySelector('a[data-link="instagram"]');
  if (instagram) setExternal(instagram, instagramProfileUrl(site));
}
