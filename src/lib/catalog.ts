import catalog from '../data/catalog.json';
import { site } from '../data/site';

export type Range = 'argan' | 'rose';
export type ProductType = 'huile' | 'visage' | 'corps' | 'cheveux';

/** A purchasable format of a product (size or texture), with its own price and photo. */
export interface Variant {
  slug: string;
  label: string;
  price: number;
  compareAt: number | null;
  image: string;
  tagline: string;
  composition: string;
  organic: boolean;
}

export interface Product {
  slug: string;
  name: string;
  ranges: Range[];
  type: ProductType;
  price: number;
  compareAt: number | null;
  image: string;
  tagline: string;
  description: string;
  composition: string;
  benefits: string[];
  usage: string;
  organic: boolean;
  essentialOil: boolean;
  soldOut: boolean;
  variants?: Variant[];
}

export interface Coffret {
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  compareAt: number | null;
  image: string;
  contents: string;
  contentsDetail: string;
  description: string;
  benefits: string[];
  usage: string;
  soldOut: boolean;
}

export const products = catalog.products as Product[];
export const coffrets = catalog.coffrets as Coffret[];

export const typeLabels: Record<ProductType, string> = {
  huile: 'Huiles',
  visage: 'Visage',
  corps: 'Corps',
  cheveux: 'Cheveux',
};

/** Every product has at least one variant; single-format products get an implicit one. */
export function variantsOf(p: Product): Variant[] {
  if (p.variants?.length) return p.variants;
  const { slug, price, compareAt, image, tagline, composition, organic } = p;
  return [{ slug, label: '', price, compareAt, image, tagline, composition, organic }];
}

export const hasFormats = (p: Product) => variantsOf(p).length > 1;
export const minPrice = (p: Product) => Math.min(...variantsOf(p).map((v) => v.price));

/** Line label used in the basket and WhatsApp messages, e.g. "Huile d'Argan, Grand format 250 ml". */
export const lineName = (p: Product, v: Variant) => (v.label ? `${p.name}, ${v.label}` : p.name);

/** Flat list of everything that can go in the basket: each product format, then each coffret. */
export function basketItems() {
  return [
    ...products.flatMap((p) => variantsOf(p).map((v) => ({ slug: v.slug, name: lineName(p, v), price: v.price, image: v.image, soldOut: p.soldOut }))),
    ...coffrets.map((c) => ({ slug: c.slug, name: c.name, price: c.price, image: c.image, soldOut: c.soldOut })),
  ];
}

export const byRange = (range: Range) => products.filter((p) => p.ranges.includes(range));
export const findProduct = (slug: string) => products.find((p) => p.slug === slug);

/** Products currently on promotion, ignoring promos whose end date has passed at build time. */
export function promoProduct(now = new Date()) {
  const p = findProduct(site.promo.slug);
  if (!p || !p.compareAt || new Date(site.promo.endsAt) < now) return undefined;
  return p;
}

export function related(p: Product, count = 4) {
  return products
    .filter((o) => o.slug !== p.slug && !o.soldOut && o.ranges.some((r) => p.ranges.includes(r)))
    .sort((a, b) => Number(b.type === p.type) - Number(a.type === p.type))
    .slice(0, count);
}

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);

export const discountPercent = (price: number, compareAt: number | null) =>
  compareAt ? Math.round((1 - price / compareAt) * 100) : 0;
