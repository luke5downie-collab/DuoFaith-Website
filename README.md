# DuoFaith website

A static site focused on App Store downloads. No install or build step is needed.

## Preview

From this folder:

```sh
python3 -m http.server 8080
```

Open http://localhost:8080. Serve the folder rather than opening `index.html` directly — the site uses root-relative URLs like `/home.css` and `/img/current/`, which break over `file://`.

`.claude/launch.json` defines the same server for the editor's preview pane.

## Main files

- `index.html` — homepage, plus search and social metadata.
- `home.css` — the whole design system: surfaces, device frame, layout, responsive rules.
- `home.js` — mobile nav, the devotional screenshot switcher, the Couples Mode reveal demo, and the mobile download bar.
- `refresh.css` — theme overlay for `privacy.html` and `terms.html`, which keep their own inline styles.
- `img/current/` — the app screenshots used across the site.

Guides under `guides/` share `home.css` with the homepage.

## Design system

Defined as custom properties at the top of `home.css`.

**Elevation.** Five surfaces (`--surface-0` … `--surface-4`), each roughly 35% lighter than the last. Sections alternate recessed → base → raised so the page reads as distinct planes. On a dark page this, not shadow, is what carries depth — black shadow on a near-black background does nothing. Raised elements get `--lift-1` / `--lift-2`, which pair a 1px warm top highlight with a real shadow beneath.

**Borders** come in three tiers: `--line-faint` inside a card, `--line` for section edges, `--line-strong` for lit card edges.

**Device frame.** `.device` renders an iPhone from a single `--w` variable — bezel, corner radius, Dynamic Island, home indicator, status bar and side buttons are all ratios of it, taken from iPhone 15/16 Pro dimensions. Set `--w` and the whole device scales.

**App Store badge.** `.store-badge` is a vector recreation at Apple's 120×40 proportions, in the white variant Apple specifies for dark backgrounds. Apple's guidelines ask you to use their supplied artwork; swap it in before any wide launch.

## Page structure

Hero → the daily habit (01) → inside the devotional (02) → Couples Mode (03) → where this fits → FAQ → download.

"Where this fits" links into three guides, which is the homepage's only in-content path to the guide cluster.

`data-download` attributes mark CTA placements for future measurement; no analytics service is wired up.

## Content rules

Copy avoids promising a particular trial length or price, since introductory access and paid locking are configurable in the app — current terms are shown in the app before purchase. No ratings, download counts, testimonials, or performance claims are invented anywhere on the site.

## Known cleanup

- `site.css` (28KB) and `img/app/` (14 files, 3.4MB) are referenced by zero pages and can be deleted.
- `vercel.json` still sets cache headers for `/site.css`.
- Guide articles are ~450 words each and carry only `Article` JSON-LD; earlier versions were ~2,250 words with `FAQPage` and `BreadcrumbList`, and cross-linked to sibling guides.

## Deploying

`main` auto-deploys to duofaith.com via Vercel. Pushing to `main` publishes.
