// Verifies every internal link and anchor in dist/ resolves, and every WhatsApp link is well formed.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const files = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) files.push(p);
  }
})(root);

const ids = new Map(files.map((f) => [f, new Set([...readFileSync(f, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));
const pageFor = (path) => {
  const clean = path.replace(/\/$/, '');
  return [join(root, clean, 'index.html'), join(root, `${clean}.html`)].find(existsSync);
};

const base = (process.env.BASE_PATH || '').replace(/\/$/, '');
const errors = [];
let checked = 0;
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    checked++;
    if (href.startsWith('https://wa.me/')) {
      if (!/^https:\/\/wa\.me\/\d{8,15}(\?text=[^"\s]+)?$/.test(href)) errors.push(`${relative(root, file)}: lien WhatsApp invalide ${href}`);
      continue;
    }
    if (/^(https?:|mailto:|tel:|\/\/)/.test(href)) continue;
    const [rawPath, hash] = href.split('#');
    const path = base && rawPath.startsWith(`${base}/`) ? rawPath.slice(base.length) : rawPath;
    const target = path ? (path.startsWith('/_astro/') || /\.(svg|xml|txt|png|jpg|webp|ico)$/.test(path) ? join(root, path) : pageFor(path)) : file;
    if (!target || !existsSync(target)) { errors.push(`${relative(root, file)}: lien cassé ${href}`); continue; }
    if (hash && target.endsWith('.html') && !ids.get(target)?.has(hash)) errors.push(`${relative(root, file)}: ancre manquante ${href}`);
  }
}
console.log(`${files.length} pages, ${checked} liens vérifiés`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Aucun lien cassé.');
