'use strict';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// The nav floats flat over the hero and picks up a shadow once the page moves.
const nav = document.querySelector('#nav');
const onScrollNav = () => nav.classList.toggle('is-scrolled', scrollY > 10);
addEventListener('scroll', onScrollNav, {passive: true});
onScrollNav();

// Blocks rise in, and their stripes draw, the first time they reach the viewport.
const reveals = document.querySelectorAll('.reveal, .stripe:not(.in)');
if ('IntersectionObserver' in window && !reduced) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, {rootMargin: '0px 0px -12% 0px'});
  reveals.forEach(el => io.observe(el));
} else {
  reveals.forEach(el => el.classList.add('in'));
}

// The deck. The track is several screens tall and the stage inside it is sticky,
// so how far through the track you are picks the card. Each card is told its
// place relative to the active one, and the CSS does the moving.
const track = document.querySelector('#deck-track');
const cards = [...document.querySelectorAll('.card')];
const tabs = [...document.querySelectorAll('.tab')];
const pinned = matchMedia('(min-width: 801px)');
let active = -1;

function setActive(i) {
  if (i === active) return;
  active = i;
  cards.forEach((card, n) => {
    card.classList.remove('is-active', 'is-next', 'is-later', 'is-past');
    card.classList.add(n === i ? 'is-active' : n === i + 1 ? 'is-next' : n > i ? 'is-later' : 'is-past');
    card.setAttribute('aria-hidden', String(n !== i && pinned.matches));
  });
  tabs.forEach((tab, n) => {
    tab.classList.toggle('active', n === i);
    tab.setAttribute('aria-selected', String(n === i));
  });
}

function onScrollDeck() {
  if (!pinned.matches) return;
  const rect = track.getBoundingClientRect();
  const travel = rect.height - innerHeight;
  const progress = Math.min(Math.max(-rect.top / travel, 0), 0.999);
  setActive(Math.floor(progress * cards.length));
}

if (track && cards.length) {
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScrollDeck(); ticking = false; });
  }, {passive: true});
  addEventListener('resize', onScrollDeck);
  pinned.addEventListener('change', () => { active = -1; onScrollDeck(); if (!pinned.matches) cards.forEach(c => c.removeAttribute('aria-hidden')); });
  setActive(0);
  onScrollDeck();

  // A tab scrolls to the middle of its card's stretch of the track, so the deck
  // lands on it rather than on a boundary between two.
  tabs.forEach((tab, n) => tab.addEventListener('click', () => {
    const top = track.getBoundingClientRect().top + scrollY;
    const travel = track.offsetHeight - innerHeight;
    scrollTo({top: top + travel * ((n + 0.5) / cards.length), behavior: reduced ? 'auto' : 'smooth'});
  }));
}

// Phones only: a download bar once the hero's badge has scrolled away, hidden again
// when the footer's own badge is on screen.
const bar = document.querySelector('#mobile-bar');
if (bar && 'IntersectionObserver' in window) {
  let heroSeen = true, footSeen = false;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.target.classList.contains('hero')) heroSeen = e.isIntersecting;
      else footSeen = e.isIntersecting;
    });
    bar.hidden = heroSeen || footSeen;
  });
  io.observe(document.querySelector('.hero'));
  io.observe(document.querySelector('.footer'));
}

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
