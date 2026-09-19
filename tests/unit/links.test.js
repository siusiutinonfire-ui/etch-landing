import { describe, it, expect, beforeEach } from "vitest";
import { initLinks } from "../../js/links.js";
import { SITE, orderUrl, instagramProfileUrl, contactUrl } from "../../js/config.js";

beforeEach(() => {
  document.body.innerHTML = `
    <a data-order="single" href="#">SELECT</a>
    <a data-order="giftbox" href="#">SELECT</a>
    <a data-link="shipping" href="#">SHIPPING</a>
    <a data-link="contact" href="#">CONTACT</a>
    <a data-link="instagram" href="#">INSTAGRAM</a>
    <a href="#section-6" class="js-smooth-scroll">SHOP</a>
  `;
});

describe("initLinks", () => {
  it("replaces order placeholders with the configured order url and external attrs", () => {
    initLinks(SITE);
    const single = document.querySelector('[data-order="single"]');
    expect(single.getAttribute("href")).toBe(orderUrl("single"));
    expect(single.getAttribute("target")).toBe("_blank");
    expect(single.getAttribute("rel")).toContain("noopener");
    expect(document.querySelector('[data-order="giftbox"]').getAttribute("href")).toBe(orderUrl("giftbox"));
  });

  it("wires the footer links", () => {
    initLinks(SITE);
    expect(document.querySelector('[data-link="shipping"]').getAttribute("href")).toBe("#shipping-info");
    const contact = document.querySelector('[data-link="contact"]');
    expect(contact.getAttribute("href")).toBe(contactUrl());
    expect(contact.getAttribute("rel")).toContain("noopener");
    const ig = document.querySelector('[data-link="instagram"]');
    expect(ig.getAttribute("href")).toBe(instagramProfileUrl());
    expect(ig.getAttribute("target")).toBe("_blank");
  });

  it("leaves no dead '#' hrefs behind and does not touch in-page anchors", () => {
    initLinks(SITE);
    expect(document.querySelectorAll('a[href="#"]').length).toBe(0);
    expect(document.querySelector(".js-smooth-scroll").getAttribute("href")).toBe("#section-6");
  });

  it("is a no-op on a page without link placeholders", () => {
    document.body.innerHTML = "<p>nothing here</p>";
    expect(() => initLinks(SITE)).not.toThrow();
  });
});
