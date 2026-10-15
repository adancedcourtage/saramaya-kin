import { site } from '../data/site';

export const greeting = `Bonjour ${site.name},`;

export const waLink = (text = '') =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(`${greeting} ${text}`)}` : ''}`;
