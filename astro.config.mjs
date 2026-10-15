import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// BASE_PATH is set by the GitHub Pages workflow ("" with a custom domain, "/<repo>" otherwise).
const base = (process.env.BASE_PATH || '').replace(/\/$/, '');
const site = process.env.SITE_ORIGIN || 'https://saramaya-kin.com';

/** Prefixes root-relative links in the built HTML when the site is served from a sub-path. */
const prefixLinks = {
  name: 'prefix-root-links',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      if (!base) return;
      const root = fileURLToPath(dir);
      const walk = async (d) => {
        for (const entry of await readdir(d, { withFileTypes: true })) {
          const p = join(d, entry.name);
          if (entry.isDirectory()) await walk(p);
          else if (p.endsWith('.html')) {
            const html = await readFile(p, 'utf8');
            const out = html.replace(/(href|src|action)="\/(?!\/)([^"]*)"/g, (m, attr, rest) =>
              `/${rest}`.startsWith(`${base}/`) ? m : `${attr}="${base}/${rest}"`,
            );
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
  integrations: [sitemap(), prefixLinks],
  build: { format: 'directory' },
});
