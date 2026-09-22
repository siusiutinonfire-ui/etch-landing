import { test as base, expect } from "@playwright/test";

/**
 * Shared E2E fixture: block Google Fonts. Every test opens a fresh context,
 * so each one would re-download five font families before `load` fires;
 * on a slow connection that alone blows the 30 s test timeout. Nothing we
 * assert depends on the font files themselves (layout, links, a11y rules
 * and contrast all come from the CSS). Visual scripts that need the real
 * typefaces (e.g. scripts/build-og-image.cjs) do not use this fixture.
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
    await use(context);
  },
});

export { expect };
