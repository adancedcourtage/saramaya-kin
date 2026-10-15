import catalog from '../data/catalog.json';
import { site } from '../data/site';

export type Range = 'argan' | 'rose';
export type ProductType = 'huile' | 'visage' | 'corps' | 'cheveux';

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
