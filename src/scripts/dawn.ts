/**
 * The night-to-dawn passage: as the visitor scrolls, the sky turns
 * from Chefchaouen night blue to Damask-rose dawn and a sun rises.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stops = [
  ['#0e1a3c', '#17285a'],
  ['#17285a', '#2f5fb3'],
  ['#2f5fb3', '#c8426e'],
  ['#f7c9d6', '#fbecf1'],
];
const hills = ['#0a1430', '#101f48', '#1b2f66', '#eef3fb'];

export function initDawn({ reduced }: { reduced: boolean }) {
  const section = document.querySelector<HTMLElement>('[data-dawn]');
  if (!section) return;
  const lines = section.querySelectorAll<HTMLElement>('[data-dawn-line]');

  if (reduced) {
    section.classList.add('is-static');
    return;
  }

  const top = gsap.utils.interpolate(stops.map((s) => s[0]));
  const bottom = gsap.utils.interpolate(stops.map((s) => s[1]));
  const ground = gsap.utils.interpolate(hills);

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: ({ progress }) => {
      section.style.setProperty('--sky-top', top(progress));
      section.style.setProperty('--sky-bottom', bottom(progress));
      section.style.setProperty('--hills', ground(progress));
      section.style.setProperty('--p', progress.toFixed(4));
      // Line changes match the scene: night, sunrise over the roses, then the argan workshop.
      const active = progress < 0.12 ? 0 : progress < 0.42 ? 1 : 2;
      lines.forEach((l, i) => l.classList.toggle('is-active', i === active));
      section.classList.toggle('is-day', progress > 0.78);
    },
  });
}
