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
- `home.js` — the devotional screenshot switcher (and its self-playing tour), the FAQ open/close animation, the Couples Mode reveal demo, and the mobile download bar.
- `refresh.css` — theme overlay for `privacy.html` and `terms.html`, which keep their own inline styles.
- `img/current/` — the app screenshots used across the site: 660×1434 JPEGs made from the simulator captures in `App Store Screenshots/In-App Photos/` (the Oct 13 set). They are full-screen captures, so they already carry the status bar and Dynamic Island, and the device frame no longer draws its own.

Guides under `guides/` share `home.css` with the homepage.

## Design system

Defined as custom properties at the top of `home.css`.

**Type.** Display is **Fraunces**, self-hosted, SIL OFL (`fonts/LICENSE-Fraunces.txt`). It replaced `ui-serif`, which resolves to New York on Apple platforms — Apple's *UI* serif, engineered to be neutral and invisible at interface sizes. Showing it at `clamp(78px,9.1vw,127px)` meant displaying a face designed to have no opinion.

Two files: the roman carries all four axes (121KB), the italic is the `wght`+`WONK` subset (46KB) because italic here is only emphasis and the demo answers, where `opsz` buys little. Unknown axes are ignored, so one set of settings is safe on both.

Two cuts, and the split is the whole point of using a variable face:

| | `opsz` | `SOFT` | `WONK` |
|---|---|---|---|
| Display (`h1`, `h2`) | 144 | 24 | 1 |
| Every other serif element | 26 | 44 | 0 |

`opsz` is the axis a static font cannot fake: as it drops, x-height rises, spacing opens and letterforms widen, so the 127px headline and the 19px reflection answer get different cuts rather than one cut scaled. `WONK` swaps in leaning, hand-cut forms — on for display, off below it, where it reads as a wobble rather than as character.

Two things to know before editing it:

- **`wght` is never named in `font-variation-settings`.** Naming an axis there takes it away from `font-weight`, and `.logo` (700) and `.couples-explanation h3` (600) still need `font-weight` to work. Only the other three axes are ever set.
- **The small-cut selector list is explicit, not inherited.** Add a new serif element and it will take the 144 display cut at text size until you add it to that list.

Tracking history, since it needs retuning per face: Georgia wanted -.055em, New York went muddy under that and dropped to -.022em, and Fraunces at `opsz 144` holds at -.022em because the optical-size axis is doing the closing-up that negative tracking used to do by hand.

`refresh.css` redeclares both `@font-face` rules and `--serif`, because `privacy.html` and `terms.html` load it *instead of* `home.css`. Every page preloads the roman — the homepage hides the swap behind the hero's 500ms fade, but the guides and legal pages have no fade, so they need the preload more, not less.

**Colour.** The app's coral look, value for value: `Clean` and `Depth` in `DuoFaith/Theme.swift`. A coral page (`--page`, `#FF7A6B`), deep red-brown words (`--ink`, `--muted`), and white for anything you act on or anything that is "done" (buttons, the Couples badge, the active tour step, the open FAQ chevron). Three rules come from measured contrast, and they decide where things can go:

- `--ink` is 6.6:1 on the coral and `--muted` 5.2:1, but both drop under 4.5:1 once the page deepens past `#EE5444`. So every band with words stays at `--page` or lighter.
- White is 2.4:1 on the coral, so white is only ever a fill, never words on the coral. That is why the hero's "Distraction." is italic ink rather than coloured.
- `--on-accent` (`#C73A2C`) is the red for words sitting on white or `--paper`. It is 2:1 on the coral itself, so never put it there.

Long reading (the Couples demo card, guide side cards, the legal pages) goes on `--paper`, the cream inside the app's book, where the ink is 15:1.

The page ends the way the app's week does: the closing band is the full-week sunset (`--sunset-*`) and the footer is a step deeper (`--night`), both with cream words.

**Depth.** Depth's rule from the app: anything raised gets a thin light line along its top edge, a tight shadow where it touches the page and a wide soft one, all in the ink colour (`--lift-1` / `--lift-2`). Black or grey shadows turn coral muddy.

**Borders** come in three tiers, also in the ink: `--line-faint` inside a card, `--line` for section edges, `--line-strong` for card edges.

**Hero.** `.hero-light` is the app's page background: light coral at the top running into the page coral, with a soft white light in the top-left corner. `.hero:after` adds a second, coarser grain field on top of the global one on `body:after`, so the 160px grain tile doesn't visibly repeat across the open gradient.

The dark site's atmosphere (candlelight layers, the off-axis light shaft, and the drifting smoke veils pinned by `home.js`) was removed in the coral reskin. A white haze over coral washes it out to salmon, and the app's look is a single bold colour.

**Device frame.** `.device` renders an iPhone from a single `--w` variable — bezel, corner radius and side buttons are all ratios of it, taken from iPhone 15/16 Pro dimensions. Set `--w` and the whole device scales. The screenshots supply their own status bar and Dynamic Island.

**App Store badge.** `.store-badge` is a vector recreation at Apple's 120×40 proportions: the black variant on the coral, which is a light ground, and the white one in the dark closing band. Apple's guidelines ask you to use their supplied artwork; swap it in before any wide launch.

## Page structure

Opener (`.hero`) → Couples Mode (`#couples`) → FAQ → download.

The opener is one section (`.hero`, `#screenshots`) doing two jobs:

```
  ── THE BIBLE APP BLOCKER FOR IPHONE AND IPAD ──
             Faith over Distraction.          .hero-content
        You choose which apps go quiet, and when.
                   [App Store]
        Three minutes a morning · 3 days free…

  ╭─────╮   READ · LEARN · REFLECT · PRAY    .reading-layout
  │  ▢  │   The one thing on your phone…
  │     │   01 Read     ↗
  ╰─────╯   02 Learn    ↗
  caption   03 Reflect  ↗
            04 Pray     ↗
```

It used to be a centred hero with three angled phones and then a separate raised band holding the walkthrough, which put the app's actual purpose second on the page. Now the promise and its proof are one section, with the phone pushed left out of its track so it breaks the page's gutter rather than sitting inside it.

Deleted with the old hero and not referenced anywhere now: the three-phone showcase, its arc, the scroll parallax that drove it, and all three hand-drawn ring paths (`r-a`/`r-b`/`r-c`). The remaining `.reading-aura` is a true circle by deliberate choice — the note above that rule explains why, and it predates the showcase being removed.

Two layouts were tried on top of this and reverted: a split opener (headline left, phone right, steps in a row) and a raised `.walk-panel`. Neither is in the CSS any more.

Two consequences worth knowing:

- `.hero` now runs the full height of the walkthrough, so the sticky mobile download bar watches `.hero-content`, not `.hero` — otherwise it would stay hidden for most of the page. What it is really tracking is the App Store badge.
- The bands run lit coral opener → page coral (Couples, FAQ) → sunset closing → night footer, with a hairline between the opener and Couples.

The four tour steps use the app's own names for them (Read, Learn, Reflect, Pray), and the keys in `home.js` match the image names in `img/current/`.

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
