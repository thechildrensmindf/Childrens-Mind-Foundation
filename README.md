# The Children's Mind Foundation — Website

Marketing site and design system for **The Children's Mind Foundation**, a charity supporting neurodivergent children across the United Kingdom. The site introduces the foundation's mission and programmes and invites visitors to sponsor a printed copy of the Lumi colouring book (£5 gifts a book to a child).

## Live pages

| File | Purpose |
| --- | --- |
| [`index.html`](index.html) | Main landing page (hero, mission, programmes, Story of Lumi, donate, contact). |
| [`Lumi Colouring book.html`](Lumi%20Colouring%20book.html) | The interactive Lumi colouring book. |
| [`Lumi Preview.html`](Lumi%20Preview.html) | Standalone book preview. |
| [`lumi-preview/`](lumi-preview/) | Full flipbook viewer of the colouring book. |
| [`lumi-preview-banner/`](lumi-preview-banner/) | Compact flipbook preview embedded on the landing page. |

## Getting started

The site is static HTML/CSS/JS and needs no build dependencies. A small Node.js script stages the Cloudflare deployment output.

- **Quick look:** open `index.html` directly in a browser.
- **Build and deploy to Cloudflare Workers:** `npm run build` stages the site in `dist/`; Wrangler automatically reads [`wrangler.json`](wrangler.json) from the repository root and uploads only that folder. Set its `name` to the existing Worker name in Cloudflare. Cloudflare Workers Builds can run `npm run build` as the build command and `npx wrangler deploy` as the deploy command. Run `npm run deploy` to build and deploy from a local terminal, or `npm run preview` to build and create a Cloudflare Worker Preview deployment using `npx wrangler preview` (currently open beta).
- **Recommended (for the embedded book preview to load reliably):** serve the folder over a local web server, e.g.

  ```bash
  python3 -m http.server 8000
  ```

  then visit <http://localhost:8000>.

> The embedded flipbook is an `<iframe>`; some browsers restrict iframes loaded from the `file://` protocol, so a local server avoids a blank preview.

## Project structure

```
index.html              Landing page (self-contained bundle)
Lumi Colouring book.html
Lumi Preview.html
lumi-preview/            Colouring-book flipbook viewer
lumi-preview-banner/     Landing-page flipbook preview
assets/                 Logo, favicon, badge images, and photo sets
  carousel/              Programs photo carousel images
  story-of-lumi/         Story of Lumi collage images
  image-sets.js          Image paths and matching alt text for both sections
uploads/                Photography and illustration assets
_ds/                    Design-system source
screenshots/            Reference screenshots
checkpoints/            Saved versions
```

## Design system

The site is built on a small set of CSS custom properties (design tokens) defined in `index.html`:

- **Colours** — brand blue (`--sky`), green (`--lime`), sunset/CTA orange (`--sunset`), ink navy (`--ink`), and neutrals.
- **Type** — Baloo 2 for display, Inter for body.
- **Radii & shadows** — `--r-sm/md/lg`, `--shadow-soft/card`.

The layout is fully responsive (mobile, tablet, desktop) and includes on-scroll reveal animations and a single branded loading screen.

## Photo galleries

The Programs carousel uses images from `assets/carousel/`; the Story of Lumi collage uses `assets/story-of-lumi/`. To add, replace, or remove a photo, update the matching list in [`assets/image-sets.js`](assets/image-sets.js): keep each `src` and descriptive `alt` together in the same entry. The carousel displays each registered photo once and continuously moves to the left, cycling each tile from the end back to the beginning. Files placed in a folder are not included until they are listed in the registry.

## Notes

- Some spacing/type/weight tokens (`--space-*`, `--text-*`, `--weight-*`) are referenced but not yet defined; this is being addressed on the `define-css-tokens` branch.
- Colouring-book links currently point to local file paths and should be updated to relative or hosted URLs before public deployment.