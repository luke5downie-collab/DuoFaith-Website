'use strict';
const screens = {
  scripture: {alt: "DuoFaith's Scripture reading screen with numbered verses from Psalm 139", caption: 'Scripture, with room to slow down.'},
  lesson: {alt: 'DuoFaith devotional: Fully Known, Still Wanted', caption: 'A teaching that connects the passage to everyday life.'},
  reflect: {alt: 'DuoFaith reflection question and a timed pause', caption: 'One question. A moment to be honest with yourself.'},
  pray: {alt: 'DuoFaith prayer screen with a Finish & Unlock button', caption: 'Pray. Finish your devotional. Unlock your apps.'}
};
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const readingButtons = [...document.querySelectorAll('[data-reading]')];
const readingBase = document.querySelector('#reading-image');
const readingNext = document.querySelector('#reading-next');
const readingCaption = document.querySelector('#reading-caption');
let readingToken = 0;
let readingCurrent = 'scripture';

// Cross-dissolve rather than swap. The incoming screen is decoded before it is
// shown, so the fade never starts against a half-painted image; once it is fully
// covering, the base picks up the same (now cached) source and the top layer is
// cleared. A token guards against a fast second change landing mid-fade.
async function showReading(button) {
  const key = button.dataset.reading;
  const mine = ++readingToken;
  readingButtons.forEach(item => {
    const selected = item === button;
    item.setAttribute('aria-pressed', String(selected));
    item.classList.toggle('active', selected);
  });
  const src = `/img/current/${key}.jpg`;

  if (!readingNext || prefersReduced) {
    readingBase.src = src;
    readingBase.alt = screens[key].alt;
    readingCaption.textContent = screens[key].caption;
    readingCurrent = key;
    return;
  }

  // Which way the sequence is travelling, so going back slides back.
  const order = readingButtons.map(b => b.dataset.reading);
  const from = order.indexOf(readingCurrent);
  const to = order.indexOf(key);
  const wrapping = Math.abs(to - from) === order.length - 1;
  const forward = wrapping ? to < from : to > from;
  const frame = readingBase.parentElement;

  readingCaption.classList.add('is-fading');
  readingNext.src = src;
  try { await readingNext.decode(); } catch (e) { /* decode is best-effort */ }
  if (mine !== readingToken) return;

  // park the incoming screen off the correct edge with no transition, then let it in
  readingNext.style.transition = 'none';
  readingNext.classList.toggle('from-left', !forward);
  readingNext.classList.remove('is-in');
  void readingNext.offsetWidth;
  readingNext.style.transition = '';

  frame.classList.add(forward ? 'is-sliding' : 'is-sliding-back');
  readingNext.classList.add('is-in');
  readingCaption.textContent = screens[key].caption;
  readingCaption.classList.remove('is-fading');
  readingCurrent = key;

  await new Promise(resolve => setTimeout(resolve, 560));
  if (mine !== readingToken) return;

  // hand the finished screen back to the base layer without anything moving
  readingBase.src = src;
  readingBase.alt = screens[key].alt;
  try { await readingBase.decode(); } catch (e) { /* already cached */ }
  if (mine !== readingToken) return;
  readingBase.style.transition = 'none';
  frame.classList.remove('is-sliding', 'is-sliding-back');
  readingNext.style.transition = 'none';
  readingNext.classList.remove('is-in', 'from-left');
  void readingBase.offsetWidth;
  readingBase.style.transition = '';
  readingNext.style.transition = '';
}
readingButtons.forEach(button => button.addEventListener('click', () => {
  stopReadingTour();          // a click means the reader has taken over
  showReading(button);
}));

// The four screens play themselves through, but only while the section is on
// screen — so the extra images are never fetched by someone who scrolls past, and
// nothing animates out of sight. Any click hands control over for good.
let readingTimer = null;
let readingTourStopped = false;
function stopReadingTour() {
  clearInterval(readingTimer);
  readingTimer = null;
  readingTourStopped = true;
}
const readingSection = document.querySelector('#screenshots');
if (readingSection && readingButtons.length > 1 && !prefersReduced && 'IntersectionObserver' in window) {
  const tourWatch = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (readingTourStopped) return;
      if (entry.isIntersecting && !readingTimer) {
        readingTimer = setInterval(() => {
          const at = readingButtons.findIndex(b => b.classList.contains('active'));
          showReading(readingButtons[(at + 1) % readingButtons.length]);
        }, 3400);
      } else if (!entry.isIntersecting && readingTimer) {
        clearInterval(readingTimer);
        readingTimer = null;
      }
    });
  }, {threshold: 0.4});
  tourWatch.observe(readingSection);
}
// A clearly labeled, local-only illustration of the shared-reflection reveal.
// Scroll position alone drives it while the card is pinned.
const demo = document.querySelector('.reflection-demo');
const demoTrack = document.querySelector('.demo-track');
const streakBox = document.querySelector('#demo-streak');
const streakNum = document.querySelector('#streak-num');
const explainSteps = [...document.querySelectorAll('.couples-explanation li')];

// p drives the seal; stageAt (when given) decides which point is lit; streakAt
// (when given) drives the counter independently of the seal.
//
// The counter used to be derived from p, which desynced it from its own caption:
// it finished counting to 12 at ~43% of the pin while "Build a streak together"
// did not light until 44-60%, so the explanation always arrived after the thing
// it explained had already happened. The two are separate inputs now, and the
// scroll driver below lines them up. Left derived from p when streakAt is not
// passed, which is the phone path and the reduced-motion path.
function paintReveal(p, stageAt, streakAt) {
  if (!demo) return;
  const open = p > 0.55;
  demo.style.setProperty('--reveal', p.toFixed(3));
  const yours = document.querySelector('#your-answer');
  yours.textContent = open
    ? '“My phone. Screen time said six hours yesterday. Six.”'
    : 'Your answer goes here first.';
  yours.classList.toggle('is-blank', !open);
  document.querySelector('#your-answer-status').textContent = open ? 'ANSWER SHARED' : 'NOT WRITTEN YET';
  document.querySelector('#partner-answer-status').textContent = open ? 'ANSWER REVEALED' : 'ANSWER SEALED';
  document.querySelector('#demo-note').textContent = open
    ? 'Both answered. Both reflections revealed. One more day in your shared streak.'
    : 'An example from the app. Your actual reflections are written in DuoFaith.';
  // the streak settles at 12, on its own clock when the caller supplies one
  const streakP = (streakAt === undefined)
    ? Math.min(1, Math.max(0, (p - 0.5) / 0.4))
    : Math.min(1, Math.max(0, streakAt));
  if (streakBox && streakNum) {
    const days = Math.round(12 * streakP);
    streakBox.classList.toggle('is-on', streakP > 0);
    streakNum.textContent = days;
    const label = document.querySelector('#streak-label');
    if (label) label.textContent = days === 1 ? 'day in a row' : 'days in a row';
  }
  // the copy beside the card keeps pace with it: sealed, then streak, then rhythm
  if (explainSteps.length) {
    const at = (stageAt === undefined) ? (p < 0.45 ? 0 : (p < 0.85 ? 1 : 2)) : stageAt;
    explainSteps.forEach((li, i) => li.classList.toggle('is-live', i === at));
  }
}

// Scroll drives the seal only while the card is actually pinned.
if (demo && demoTrack && !prefersReduced) {
  let queued = false;
  const readProgress = () => {
    queued = false;
    // No pinning on a phone, so the card's own travel up the viewport drives it —
    // sealed as it enters from the bottom, read by the time it is properly up.
    if (getComputedStyle(demo).position !== 'sticky') {
      const box = demo.getBoundingClientRect();
      const span = innerHeight * 0.6;
      paintReveal(Math.min(1, Math.max(0, (innerHeight - box.top - innerHeight * 0.18) / span)));
      return;
    }
    const stick = parseFloat(getComputedStyle(demo).top) || 0;
    const track = demoTrack.getBoundingClientRect();
    const travel = track.height - demo.offsetHeight;
    if (travel <= 0) return;
    const moved = Math.min(Math.max(0, stick - track.top), travel);
    const raw = moved / travel;
    // Three phases across the pin, each one carrying something the card actually
    // does. The old split spent the whole card on the first 38% and then held a
    // frozen card for the remaining 62%, which is what made the section feel like
    // it was over long before it let go of the scroll.
    //   0.00-0.06  settle, card sealed
    //   0.06-0.46  the seal breaks            — point one lit
    //   0.50-0.72  the counter runs to 12     — point two lit, in step with it
    //   0.76-1.00  nothing left to animate    — point three lit, and it is the
    //              one point that is pure copy, so it is the right one to sit on
    const rev    = Math.min(1, Math.max(0, (raw - 0.06) / 0.40));
    const streak = (raw - 0.50) / 0.22;
    const at     = raw < 0.50 ? 0 : (raw < 0.76 ? 1 : 2);
    paintReveal(rev, at, streak);
  };
  const onScrollReveal = () => { if (!queued) { queued = true; requestAnimationFrame(readProgress); } };
  addEventListener('scroll', onScrollReveal, {passive: true});
  addEventListener('resize', onScrollReveal);
  readProgress();
} else if (demo && prefersReduced) {
  // Painted open, not sealed. The scroll driver is the only thing that can break
  // the seal now that the button is gone, so leaving this at 0 would show anyone
  // on reduced motion a permanently blanked-out card — the one state that does
  // not explain the feature.
  paintReveal(1);
}
// Native <details> snaps open, and its content is hidden by the UA while closed,
// so CSS transitions cannot reach it. Drive the height ourselves instead, and let
// it fall back to the plain native toggle when motion is not wanted.
const faqItems = [...document.querySelectorAll('.faq-list details')];
const faqEase = 'cubic-bezier(.32,.72,0,1)';
const allowMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function collapseFaq(item) {
  if (!allowMotion) { item.open = false; return; }
  if (item.animation) item.animation.cancel();
  const body = item.querySelector('.faq-body');
  item.animation = body.animate(
    {height: [body.scrollHeight + 'px', '0px'], opacity: [1, 0]},
    {duration: 240, easing: faqEase}
  );
  item.animation.onfinish = () => { item.open = false; item.animation = null; };
}

function expandFaq(item) {
  item.open = true;
  if (!allowMotion) return;
  if (item.animation) item.animation.cancel();
  const body = item.querySelector('.faq-body');
  item.animation = body.animate(
    {height: ['0px', body.scrollHeight + 'px'], opacity: [0, 1]},
    {duration: 320, easing: faqEase}
  );
  item.animation.onfinish = () => { item.animation = null; };
}

faqItems.forEach(item => {
  item.querySelector('summary').addEventListener('click', event => {
    event.preventDefault();
    const wasOpen = item.open;
    faqItems.forEach(other => { if (other !== item && other.open) collapseFaq(other); });
    if (wasOpen) collapseFaq(item); else expandFaq(item);
  });
});

const mobileDownload = document.querySelector('.mobile-download');
if (mobileDownload && 'IntersectionObserver' in window) {
  // Watches .hero-content, not .hero: the hero now runs the full length of the
  // devotional walkthrough, so observing the section would keep the bar hidden
  // for most of the page. What it is really tracking is the badge — while the
  // real App Store button is on screen, the sticky one is noise.
  let openerVisible = true, closingVisible = false;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.target.matches('.hero-content')) openerVisible = entry.isIntersecting;
      else closingVisible = entry.isIntersecting;
    });
    mobileDownload.hidden = openerVisible || closingVisible;
  });
  observer.observe(document.querySelector('.hero-content'));
  observer.observe(document.querySelector('#download'));
}

// Hold the smoke still while the page scrolls past it. The veil is the masked
// band and moves with its section; the plume inside is pushed back by exactly
// the veil's viewport offset, which parks the texture at a fixed spot on screen.
// Script rather than a CSS view() timeline because the veil clips, and a clipping
// ancestor is what view() measures the plume against — see the note in home.css.
// Cheap either way: two rect reads and two property writes per frame, driving a
// transform on an already-promoted layer.
const veils = [...document.querySelectorAll('.smoke-veil')];
if (veils.length) {
  let ticking = false;
  const hold = () => {
    // Every rect read before any write, so the custom property one veil sets
    // cannot force a fresh layout for the next veil's measurement.
    const rects = veils.map(veil => veil.getBoundingClientRect());
    veils.forEach((veil, i) => {
      const rect = rects[i];
      // Offscreen bands keep their last value; nobody can see them drift.
      if (rect.bottom > 0 && rect.top < innerHeight) {
        veil.style.setProperty('--smoke-y', (-rect.top).toFixed(1) + 'px');
      }
    });
    ticking = false;
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(hold); } };
  addEventListener('scroll', onScroll, {passive: true});
  addEventListener('resize', onScroll);
  hold();
}

// Each block arrives the way the opener does, once, as it reaches the viewport.
// Unobserved on first hit — a section that has arrived is not going to un-arrive.
const reveals = [...document.querySelectorAll('.reveal')];
if (reveals.length) {
  const show = el => el.classList.add('in');
  if (prefersReduced || !('IntersectionObserver' in window)) {
    reveals.forEach(show);
  } else {
    const watch = new IntersectionObserver((entries, self) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        self.unobserve(entry.target);
      });
    }, {rootMargin: '0px 0px -10% 0px'});
    reveals.forEach(el => watch.observe(el));
    // Nothing here may depend on an observer to become readable. If the callback
    // has not run by now — a stalled observer, a page restored from bfcache, a
    // tab that was never painted — show everything regardless. The cost of being
    // wrong in this direction is a missed animation; the other direction is a
    // blank page.
    setTimeout(() => reveals.forEach(show), 2500);
  }
}

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
