/**
 * Customer reviews shown on the home page.
 * Only publish genuine reviews from Saramaya-kin customers, with their consent
 * (French consumer law forbids invented or unverifiable reviews).
 * The section stays hidden while this list is empty.
 */
export interface Review { name: string; city: string; text: string; product?: string; date: string }

export const reviews: Review[] = [];
