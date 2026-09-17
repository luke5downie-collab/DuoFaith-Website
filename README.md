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
- `home.js` — the devotional screenshot switcher (and its self-playing tour), the FAQ open/close animation, the Couples Mode reveal demo, the held smoke, and the mobile download bar.
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

Opener (`.hero`) → Couples Mode (`#couples`) → FAQ → download.

The opener is one section (`.hero`, `#screenshots`) doing two jobs:

```
      ── THE BIBLE APP BLOCKER FOR IPHONE ──
             Faith over Distraction.          .hero-content
        You choose which apps go quiet, and when.
                   [App Store]
        Three minutes a morning · 3 days free…

  ╭─────╮   A FEW MINUTES, FULLY PRESENT     .reading-layout
  │  ▢  │   The one thing on your phone…
  │     │   01 Scripture          ↗
  ╰─────╯   02 The devotional     ↗
  caption   03 A real question    ↗
            04 A moment of prayer ↗
```

It used to be a centred hero with three angled phones and then a separate raised band holding the walkthrough, which put the app's actual purpose second on the page. Now the promise and its proof are one section, with the phone pushed left out of its track so it breaks the page's gutter rather than sitting inside it.

Deleted with the old hero and not referenced anywhere now: the three-phone showcase, its arc, the scroll parallax that drove it, and all three hand-drawn ring paths (`r-a`/`r-b`/`r-c`). The remaining `.reading-aura` is a true circle by deliberate choice — the note above that rule explains why, and it predates the showcase being removed.

Two layouts were tried on top of this and reverted: a split opener (headline left, phone right, steps in a row) and a raised `.walk-panel`. Neither is in the CSS any more.

Two consequences worth knowing:

- `.hero` now runs the full height of the walkthrough, so the sticky mobile download bar watches `.hero-content`, not `.hero` — otherwise it would stay hidden for most of the page. What it is really tracking is the App Store badge.
- The homepage no longer uses the raised `--surface-2` band. Elevation now runs recessed opener → base (Couples, FAQ) → recessed closing, with a hairline between the opener and Couples in place of the old band edges.

The guide cluster is reachable from the footer only; the homepage has no in-content path to it.

`data-download` attributes mark CTA placements for future measurement; no analytics service is wired up.

## Content rules

**Positioning.** DuoFaith is an individual Bible app blocker. Couples Mode is an optional feature on top of it, and copy should never imply a partner is required — no "until you've both read", no "together" as the default closing note. The pattern throughout: state the solo behaviour first, then introduce Couples Mode as something you can switch on. The homepage FAQ leads with "Do I need a partner to use DuoFaith?" for the same reason, and the JSON-LD `FAQPage` mirrors the visible list in the same order. The `#couples` section does that work in its own heading rather than in a separate band: a gold pill badge reading "AN OPTIONAL FEATURE", then an `h2` that names Couples Mode outright, then a line saying everything else works on your own. Keep the badge visible if you restyle the section — the eyebrow treatment used elsewhere is too quiet for the one section describing something the reader may not need.

No ratings, download counts, testimonials, performance claims, or claims about how many people use a given mode are invented anywhere on the site.

## Known cleanup

- `site.css` (28KB) and `img/app/` (14 files, 3.4MB) are referenced by zero pages and can be deleted.
- `vercel.json` still sets cache headers for `/site.css`.
- Guide articles are ~450 words each and carry only `Article` JSON-LD; earlier versions were ~2,250 words with `FAQPage` and `BreadcrumbList`, and cross-linked to sibling guides.

## Deploying

`main` auto-deploys to duofaith.com via Vercel. Pushing to `main` publishes.
