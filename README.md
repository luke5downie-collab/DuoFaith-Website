# DuoFaith website

A static site focused on App Store downloads. No install or build step is needed.

## Preview

From this folder:

```sh
python3 -m http.server 8080
```

Open http://localhost:8080. Serve the folder rather than opening `index.html` directly: the site uses root-relative URLs like `/styles.css` and `/img/current/`, which break over `file://`.

`.claude/launch.json` defines the same server for the editor's preview pane.

## Pages and files

The site is three pages: the homepage, `privacy.html` and `terms.html`.

- `index.html`: the homepage, plus search and social metadata and the JSON-LD.
- `styles.css`: the homepage's whole design.
- `main.js`: the nav shadow, scroll reveals and stripe drawing, the card deck, and the phone-only download bar.
- `refresh.css`: the coral theme for `privacy.html` and `terms.html`, which keep their own inline styles and load only this file.
- `img/current/`: app screenshots, 660×1434 JPEGs made from the simulator captures in `App Store Screenshots/In-App Photos/Oct-13`. They are full-screen captures with their own status bar and Dynamic Island, so the CSS phone frame draws neither.
- `img/duofaith-icon-256.png` (the logo in every page header), `img/duofaith-touch-icon.png`, `img/app-icon-1024.png`, `icon-*.png`, `app-icon.png`: all made from the app's own `AppIcon.png`. `img/dove.svg` is the favicon, drawn to match it.
  Images are cached for 30 days (`vercel.json`), so a changed image needs a new file name or browsers keep showing the old one. That is why the logo and touch icon got new names when the icon changed.

The guide pages were removed. `vercel.json` sends `/guides` and everything under it to the homepage with a permanent redirect, so links and search results that still point at them land somewhere.

## Design

Built from two references:

- **Paired** (paired.com) for the top half: a floating pill nav, a hero with app moments floating round a phone, a white sheet with rounded top corners rising over the hero, and a pinned deck of tinted cards that changes as you scroll, with pill tabs that light up in step.
- **Streaks** (streaksapp.com) for the bottom half: short centred statements over rows of phones, a tinted band, and a solid coral footer carrying the App Store badge and plain underlined links.

**Colour.** A white page with the app's coral as the accent. The values come from `Clean` in `DuoFaith/Theme.swift`. The rules come from measured contrast:

- `--coral` (`#FF7A6B`) is for shapes, stripes, card tints and the footer. White text on it is 2.6:1, so it never carries white words.
- `--coral-deep` (`#C73A2C`) is for buttons and coral words. White on it is 5.2:1.
- `--ink` and `--muted` are the text colours: 15:1 and 8.5:1 on white. The ink is 6.6:1 on the coral footer.

**The stripe.** `.stripe` is a coral highlighter band across the lower part of a line. It draws left to right when its block scrolls into view (`main.js` adds `.in`). The hero's stripe has `.in` from the start so it draws on load. `box-decoration-break: clone` gives a wrapped phrase a stripe on each line.

**Type.** Headings are Fraunces, the same serif the app uses for its titles, self-hosted under SIL OFL (`fonts/LICENSE-Fraunces.txt`). Body text is the system sans.

**The deck.** `#deck-track` is several screens tall and `.deck-sticky` pins inside it. How far you are through the track picks the active card; each card gets `is-active`, `is-next`, `is-later` or `is-past`, and the CSS does the moving. A tab click scrolls to the middle of its card's stretch of the track. Below 801px there is no pinning: the cards become a plain stack and the tabs are hidden.

**Motion.** The hero copy rises in, the phone and blob arrive on a spring, and the floating cards pop in staggered, then each bobs on its own period. Everything else rises in once as it reaches the viewport. `prefers-reduced-motion` turns all of it off and shows everything in its final state.

## Content rules

**Positioning.** DuoFaith is an individual Bible app blocker. Couples Mode is an optional feature on top of it, and copy should never imply a partner is required. State the solo behaviour first, then introduce Couples Mode as something you can switch on. The FAQ leads with "Do I need a partner to use DuoFaith?", and the JSON-LD `FAQPage` mirrors the visible list in the same order. The Couples band carries an "Optional feature" tag above its heading; keep it if you restyle the section.

No ratings, download counts, awards, testimonials, performance claims, or claims about how many people use a given mode are invented anywhere on the site. The facts row under the hero stands in for the awards row Paired has, and says only true things.

## Known cleanup

- `site.css` (28KB) and `img/app/` (14 files, 3.4MB) are referenced by no page and can be deleted.
- `og-card.jpg`, the social share image, is still from the old purple design.

## Deploying

`main` auto-deploys to duofaith.com via Vercel. Pushing to `main` publishes.
