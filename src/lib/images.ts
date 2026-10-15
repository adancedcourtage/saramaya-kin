import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/products/*', { eager: true });

/** Resolves a catalog image filename (e.g. "huile-argan.jpg") to its imported asset. */
export function productImage(file: string): ImageMetadata {
  const match = files[`../assets/products/${file}`];
  if (!match) throw new Error(`Image introuvable : ${file}`);
  return match.default;
}
