import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import moved from './src/data/redirects.json' with { type: 'json' };

// BASE_PATH is set by the GitHub Pages workflow ("" with a custom domain, "/<repo>" otherwise).
const base = (process.env.BASE_PATH || '').replace(/\/$/, '');
const site = process.env.SITE_ORIGIN || 'https://saramaya-kin.com';

/** Page links end with "/" so GitHub Pages serves them directly instead of answering with a 301 first. */
const withSlash = (url) => {
  const cut = url.search(/[?#]/);
  const path = cut === -1 ? url : url.slice(0, cut);
  const rest = cut === -1 ? '' : url.slice(cut);
  const last = path.slice(path.lastIndexOf('/') + 1);
  // only page paths: not already ending with "/", no file extension, not a Vite asset
  if (!last || last.includes('.') || path.includes('/_astro/')) return url;
  return `${path}/${rest}`;
};

/**
 * Post-processes the built HTML:
 *  - prefixes root-relative URLs with the sub-path when the site is served from <user>.github.io/<repo>/
 *  - adds the trailing slash to internal page links
 */
const prefixLinks = {
  name: 'prefix-root-links',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const root = fileURLToPath(dir);
      const walk = async (d) => {
        for (const entry of await readdir(d, { withFileTypes: true })) {
          const p = join(d, entry.name);
          if (entry.isDirectory()) await walk(p);
          else if (p.endsWith('.html')) {
            const html = await readFile(p, 'utf8');
            const out = html.replace(/(href|src|action)="\/(?!\/)([^"]*)"/g, (m, attr, rest) => {
              let url = `/${rest}`;
              if (base && !url.startsWith(`${base}/`)) url = `${base}${url}`;
              if (attr === 'href') url = withSlash(url);
              return `${attr}="${url}"`;
            });
            if (out !== html) await writeFile(p, out);
          }
        }
      };
      await walk(root);
    },
  },
};

export default defineConfig({
  site,
  base: base || undefined,
  trailingSlash: 'ignore',
  // Old product addresses (merged formats, supplier names removed) keep working.
  redirects: Object.fromEntries(Object.entries(moved).map(([from, to]) => [`/produit/${from}`, `${base}/produit/${to}/`])),
  integrations: [sitemap(), prefixLinks],
  build: { format: 'directory' },
});
