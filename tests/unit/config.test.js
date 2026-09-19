import { describe, it, expect } from "vitest";
import {
  SITE,
  orderUrl,
  instagramDmUrl,
  instagramProfileUrl,
  contactUrl,
} from "../../js/config.js";

describe("site config", () => {
  it("exposes the four products with the prices shown on the page", () => {
    expect(Object.keys(SITE.products)).toEqual(["single", "pair", "set", "giftbox"]);
    expect(SITE.products.single.price).toBe(138);
    expect(SITE.products.pair.price).toBe(198);
    expect(SITE.products.set.price).toBe(298);
    expect(SITE.products.giftbox.price).toBe(168);
  });

  it("builds the Instagram DM and profile urls from the handle", () => {
    expect(instagramDmUrl()).toBe(`https://ig.me/m/${SITE.instagramHandle}`);
    expect(instagramProfileUrl()).toBe(`https://www.instagram.com/${SITE.instagramHandle}/`);
  });

  it("orderUrl points at the Instagram DM while orderPath is instagram", () => {
    expect(SITE.orderPath).toBe("instagram");
    expect(orderUrl("single")).toBe(instagramDmUrl());
    expect(orderUrl("giftbox")).toBe(instagramDmUrl());
  });

  it("orderUrl uses the Shopify url when orderPath is shopify and a url exists", () => {
    const site = {
      ...SITE,
      orderPath: "shopify",
      products: {
        ...SITE.products,
        single: { ...SITE.products.single, shopifyUrl: "https://shop.example/products/single" },
      },
    };
    expect(orderUrl("single", site)).toBe("https://shop.example/products/single");
    // A product without a Shopify url still falls back to the DM path.
    expect(orderUrl("pair", site)).toBe(instagramDmUrl(site));
  });

  it("orderUrl falls back to the DM for an unknown product key", () => {
    expect(orderUrl("does-not-exist")).toBe(instagramDmUrl());
  });

  it("contactUrl is the Instagram DM url", () => {
    expect(contactUrl()).toBe(instagramDmUrl());
  });

  it("has an absolute https canonical url", () => {
    expect(SITE.canonicalUrl).toMatch(/^https:\/\/.+\/$/);
    expect(SITE.canonicalUrl).not.toContain("example.com");
  });
});
