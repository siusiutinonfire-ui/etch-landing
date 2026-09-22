// @vitest-environment node
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { SITE, instagramDmUrl, instagramProfileUrl } from "../../js/config.js";

// Social crawlers do not run js/links.js, so the <head> tags and the no-JS
// fallback hrefs are static copies of values in js/config.js. This guards
// against the two drifting apart.
const html = fs.readFileSync(path.resolve(__dirname, "../../index.html"), "utf8");
const attr = (re) => {
  const m = html.match(re);
  return m ? m[1] : null;
};

describe("index.html stays in sync with js/config.js", () => {
  it("canonical and og:url equal SITE.canonicalUrl", () => {
    expect(attr(/<link rel="canonical" href="([^"]+)">/)).toBe(SITE.canonicalUrl);
    expect(attr(/<meta property="og:url" content="([^"]+)">/)).toBe(SITE.canonicalUrl);
  });

  it("og:image and twitter:image live under SITE.canonicalUrl", () => {
    const og = attr(/<meta property="og:image" content="([^"]+)">/);
    expect(og).toBe(`${SITE.canonicalUrl}assets/og-image.jpg`);
    expect(attr(/<meta name="twitter:image" content="([^"]+)">/)).toBe(og);
  });

  it("no-JS fallback hrefs use the configured Instagram handle", () => {
    const orderHrefs = [...html.matchAll(/<a href="([^"]+)" data-order="/g)].map((m) => m[1]);
    expect(orderHrefs).toHaveLength(4);
    for (const href of orderHrefs) expect(href).toBe(instagramDmUrl());
    expect(attr(/<a href="([^"]+)" data-link="contact"/)).toBe(instagramDmUrl());
    expect(attr(/<a href="([^"]+)" data-link="instagram"/)).toBe(instagramProfileUrl());
  });
});
