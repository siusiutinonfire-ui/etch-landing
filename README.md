# ETCH Element Cards — Landing Page

Sales landing page for ETCH Element Cards. Standalone from the Shopify store, designed for Instagram ad traffic conversion.

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Testing

```bash
npm test              # Unit tests (Vitest)
npm run test:e2e      # E2E tests (Playwright)
```

## Architecture

Vanilla HTML + CSS + JS. No build step required.

- **CSS:** Modular files imported via `css/main.css`. Design tokens in `css/tokens.css`.
- **JS:** ES modules. Each file handles one concern (scroll observer, element scroll, sticky nav, etc.)
- **Images:** Use AVIF > WebP > JPEG with LQIP SVG placeholders. Placeholder dev images included; replace with production photography before launch.

## Design Spec

See `docs/superpowers/specs/2026-04-07-landing-page-design.md` for the full copy deck, visual system, and technical specifications.

## Production Checklist

- [ ] Replace placeholder images with production photography
- [ ] Update OG image URL to production domain
- [ ] Update Instagram link to actual profile
- [ ] Update SHOP/SELECT links to actual Shopify product URLs
- [ ] Run Lighthouse audit on production domain
- [ ] Test on iOS Safari, Android Chrome, desktop Chrome/Firefox/Safari
