'use strict';
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-nav');
function closeMenu() {
  if (!menu || !menuToggle) return;
  menu.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
}
if (menuToggle && menu) {
  menuToggle.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { closeMenu(); menuToggle.focus(); }
  });
  window.matchMedia('(min-width: 581px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });
}
const screens = {
  scripture: {alt: "DuoFaith's Scripture reading screen with numbered verses from Psalm 139", caption: 'Scripture, with room to slow down.'},
  lesson: {alt: 'DuoFaith devotional: Fully Known, Still Wanted', caption: 'A teaching that connects the passage to everyday life.'},
  reflect: {alt: 'DuoFaith reflection question and a timed pause', caption: 'One question. A moment to be honest with yourself.'},
  pray: {alt: 'DuoFaith prayer screen with a Finish & Unlock button', caption: 'Pray. Finish your devotional. Unlock your apps.'}
};
const readingButtons = [...document.querySelectorAll('[data-reading]')];
readingButtons.forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.reading;
  readingButtons.forEach(item => {
    const selected = item === button;
    item.setAttribute('aria-pressed', String(selected));
    item.classList.toggle('active', selected);
  });
  const image = document.querySelector('#reading-image');
  image.src = `/img/current/${key}.png`;
  image.alt = screens[key].alt;
  document.querySelector('#reading-caption').textContent = screens[key].caption;
}));
// A clearly labeled, local-only illustration of the shared-reflection reveal.
const reveal = document.querySelector('#reveal-button');
if (reveal) reveal.addEventListener('click', () => {
  const open = reveal.getAttribute('aria-expanded') !== 'true';
  reveal.setAttribute('aria-expanded', String(open));
  document.querySelector('#your-answer').textContent = open
    ? '“My phone. Before my feet even hit the floor.”'
    : 'A small question. An honest place to start.';
  document.querySelector('#your-answer-status').textContent = open ? 'ANSWER SHARED' : 'NOT WRITTEN YET';
  document.querySelector('#partner-answer-status').textContent = open ? 'ANSWER REVEALED' : 'ANSWER SEALED';
  document.querySelector('#sealed-answer').hidden = open;
  document.querySelector('#revealed-answer').hidden = !open;
  reveal.firstChild.textContent = open ? 'Replay the reflection reveal ' : 'See what happens when you both answer ';
  document.querySelector('#demo-note').textContent = open
    ? 'Both answered. Both reflections revealed. One more day in your shared streak.'
    : 'An example from the app. Your actual reflections are written in DuoFaith.';
});
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
  let heroVisible = true, closingVisible = false;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.target.matches('.hero')) heroVisible = entry.isIntersecting;
      else closingVisible = entry.isIntersecting;
    });
    mobileDownload.hidden = heroVisible || closingVisible;
  });
  observer.observe(document.querySelector('.hero'));
  observer.observe(document.querySelector('#download'));
}
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
