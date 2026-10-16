import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initWishlist } from './wishlist';

gsap.registerPlugin(ScrollTrigger);

(window as Window & { __skMotion?: boolean }).__skMotion = true;

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- Smooth scroll ---------- */
let lenis: Lenis | undefined;
if (!reduced) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
export const scroller = { stop: () => lenis?.stop(), start: () => lenis?.start() };

let menuIsOpen = false; // full-screen menu state, shared by the header and the menu

/* ---------- Header ---------- */
const header = document.querySelector<HTMLElement>('[data-header]');
const waFloat = document.querySelector<HTMLElement>('.wa-float');
// The home hero has its own WhatsApp button: keep the floating one out of the way there.
const hero = document.querySelector<HTMLElement>('.hero');
// Pages already end with a WhatsApp call-to-action and a footer: no need for the floating button there.
let endInView = false;
const ends = document.querySelectorAll<HTMLElement>('.final, .site-footer');
if ('IntersectionObserver' in window && ends.length) {
  const seen = new Set<Element>();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
    endInView = seen.size > 0;
    if (waFloat && document.activeElement !== waFloat) waFloat.classList.toggle('is-tucked', endInView || waFloat.classList.contains('is-tucked') && window.scrollY > 400);
  }, { rootMargin: '0px 0px -20% 0px' });
  ends.forEach((el) => io.observe(el));
}
if (header) {
  let last = 0;
  const onScroll = () => {
    const y = window.scrollY;
    const goingDown = y > 400 && y > last;
    header.classList.toggle('is-scrolled', y > 40);
    header.classList.toggle('is-hidden', goingDown && !menuIsOpen && !header.contains(document.activeElement));
    const overHero = !!hero && y < hero.offsetHeight * 0.75;
    if (waFloat && document.activeElement !== waFloat) waFloat.classList.toggle('is-tucked', goingDown || overHero || endInView);
    last = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
  waFloat?.addEventListener('focus', () => waFloat.classList.remove('is-tucked'));
}

/* ---------- Full-screen menu ---------- */
const menu = document.querySelector<HTMLElement>('[data-menu]');
const menuOpen = document.querySelector<HTMLButtonElement>('[data-menu-open]');
const menuClose = document.querySelector<HTMLButtonElement>('[data-menu-close]');
function setMenu(open: boolean) {
  if (!menu || !menuOpen) return;
  menuIsOpen = open;
  menuOpen.setAttribute('aria-expanded', String(open));
  // Everything outside the menu is made inert, so keyboard and screen-reader focus stays inside it.
  document.querySelectorAll<HTMLElement>('.skip-link, [data-header], main, .site-footer, .wa-float').forEach((el) => (el.inert = open));
  document.documentElement.style.overflow = open ? 'hidden' : '';
  if (open) {
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    scroller.stop();
    menu.querySelector<HTMLElement>('a')?.focus();
    if (!reduced) gsap.from(menu.querySelectorAll('.menu-list li'), { y: 40, opacity: 0, stagger: 0.06, duration: 0.7, ease: 'power3.out', delay: 0.15 });
  } else {
    menu.classList.remove('is-open');
    scroller.start();
    setTimeout(() => (menu.hidden = true), reduced ? 0 : 600);
    menuOpen.focus();
  }
}
menuOpen?.addEventListener('click', () => setMenu(true));
menuClose?.addEventListener('click', () => setMenu(false));
document.querySelectorAll('[data-menu-close-on-click]').forEach((el) => el.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuIsOpen) setMenu(false);
});

/* ---------- Text split (words) ---------- */
function splitWords(el: HTMLElement) {
  const words = (el.textContent ?? '').trim().split(/\s+/);
  el.setAttribute('aria-label', el.textContent?.trim() ?? '');
  el.innerHTML = words
    .map((w) => `<span class="w" aria-hidden="true"><span class="wi">${w}</span></span>`)
    .join(' ');
  return el.querySelectorAll<HTMLElement>('.wi');
}

if (!reduced) {
  /* Headlines that rise word by word */
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const words = splitWords(el);
    gsap.from(words, {
      yPercent: 110, rotate: 4, duration: 1.1, ease: 'expo.out', stagger: 0.06,
      scrollTrigger: el.dataset.split === 'load' ? undefined : { trigger: el, start: 'top 85%' },
      delay: el.dataset.split === 'load' ? 0.35 : 0,
    });
  });

  /* Paragraphs whose words light up with scroll */
  document.querySelectorAll<HTMLElement>('[data-scrub-words]').forEach((el) => {
    const words = splitWords(el);
    gsap.fromTo(words, { opacity: 0.45 }, {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
    });
  });

  /* Generic reveal */
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.09 }),
  });

  /* Parallax images */
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = Number(el.dataset.parallax || 12);
    gsap.fromTo(el, { yPercent: -amount }, {
      yPercent: amount, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/* ---------- Magnetic buttons ---------- */
if (finePointer && !reduced) {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.3);
      yTo((e.clientY - r.top - r.height / 2) * 0.3);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });

  /* 3D tilt for product arches */
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.8, ease: 'power3.out' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.8, ease: 'power3.out' });
    gsap.set(el, { transformPerspective: 900 });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * 14);
      rx((0.5 - py) * 12);
      el.style.setProperty('--gx', `${px * 100}%`);
      el.style.setProperty('--gy', `${py * 100}%`);
    });
    el.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
}

/* ---------- Countdown ---------- */
document.querySelectorAll<HTMLElement>('[data-countdown]').forEach((el) => {
  const end = new Date(el.dataset.countdown!).getTime();
  const parts = ['days', 'hours', 'minutes', 'seconds'].map((k) => el.querySelector<HTMLElement>(`[data-${k}]`));
  const tick = () => {
    const left = Math.max(0, end - Date.now());
    const values = [left / 864e5, (left / 36e5) % 24, (left / 6e4) % 60, (left / 1e3) % 60].map(Math.floor);
    parts.forEach((p, i) => { if (p) p.textContent = String(values[i]).padStart(2, '0'); });
    if (left === 0) el.closest('[data-promo]')?.setAttribute('hidden', '');
  };
  tick();
  setInterval(tick, 1000);
});

/* ---------- Page modules ---------- */
initWishlist();
if (document.querySelector('[data-petals]') && !reduced) import('./petals').then((m) => m.initPetals());
if (document.querySelector('[data-dawn]')) import('./dawn').then((m) => m.initDawn({ reduced }));
if (document.querySelector('[data-scene]') && !reduced) import('./scene').then((m) => m.initScene({ reduced }));
