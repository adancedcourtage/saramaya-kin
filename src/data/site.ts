/**
 * Brand, contact and legal settings.
 * Every value marked "À COMPLÉTER" must be filled in before going live.
 */
export const site = {
  name: 'Saramaya-kin',
  // Public address, including the sub-path when served from <user>.github.io/<repo>/
  url: `${(import.meta.env.SITE ?? 'https://saramaya-kin.com').replace(/\/$/, '')}${import.meta.env.BASE_URL.replace(/\/$/, '')}`,
  tagline: 'De la nuit bleue à l’aube rose',
  homeTitle: 'Saramaya-kin | Huile d’argan et eau de rose du Maroc',
  description:
    'Soins à l’huile d’argan et à la rose de Damas, façonnés au Maroc et livrés en France. Commande simple et conseillée sur WhatsApp.',

  // International format without "+" or spaces, e.g. 33612345678
  whatsapp: '33768223888',
  whatsappDisplay: '07 68 22 38 88',
  email: 'contact@saramaya-kin.com', // À COMPLÉTER

  // Multi-product discount applied in the WhatsApp order summary
  bundleDiscount: { minItems: 2, percent: 10 },

  // Product of the month (slug from catalog.json) and end date
  promo: { slug: 'shampooing-argan', endsAt: '2026-10-31T23:59:59+01:00' },

  // Cookieless audience measurement (https://www.goatcounter.com). Leave empty to disable.
  goatcounterCode: '',

  legal: {
    owner: 'À COMPLÉTER — Prénom NOM ou raison sociale',
    status: 'À COMPLÉTER — ex. entrepreneur individuel (micro-entreprise)',
    siret: 'À COMPLÉTER',
    address: 'À COMPLÉTER — adresse postale complète',
    vat: 'TVA non applicable, art. 293 B du CGI', // À VÉRIFIER selon votre régime
    publicationDirector: 'À COMPLÉTER — Prénom NOM',
    euResponsiblePerson: 'À COMPLÉTER — personne responsable UE au sens du règlement (CE) n° 1223/2009',
    mediator: {
      name: 'À COMPLÉTER — médiateur de la consommation',
      url: 'https://www.economie.gouv.fr/mediation-conso',
    },
    host: {
      name: 'GitHub, Inc.',
      address: '88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis',
      url: 'https://github.com',
    },
    lastUpdated: '15 octobre 2026',
  },

  delivery: {
    zone: 'France métropolitaine',
    delay: '3 à 7 jours ouvrés après confirmation du paiement', // À VÉRIFIER
    fee: 'communiqués sur WhatsApp avant la validation de la commande', // À VÉRIFIER
    paymentMethods: 'virement bancaire, Wero ou PayPal', // À VÉRIFIER
  },
} as const;

export type Site = typeof site;
