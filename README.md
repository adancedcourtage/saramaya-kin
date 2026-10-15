# Saramaya-kin

Site vitrine de Saramaya-kin : soins à l’huile d’argan et à la rose de Damas, fabriqués au Maroc et vendus en France. Les commandes se font sur WhatsApp, sans paiement en ligne.

Construit avec [Astro](https://astro.build), GSAP, Lenis et Three.js. Le site est entièrement statique et hébergé gratuitement sur GitHub Pages.

## Avant la mise en ligne

Ouvrez `src/data/site.ts` et remplacez chaque valeur marquée `À COMPLÉTER` ou `À VÉRIFIER` :

- `whatsapp` : votre numéro au format international, sans `+` ni espace (ex. `33612345678`)
- `whatsappDisplay`, `email`
- `legal` : nom ou raison sociale, statut, SIRET, adresse, directeur de la publication, personne responsable UE (règlement cosmétiques), médiateur de la consommation
- `delivery` : délais, frais et moyens de paiement réels

Tant qu’une valeur légale n’est pas remplie, elle apparaît surlignée en jaune sur les pages légales.

Lisez aussi `docs/conformite.md` : il liste les obligations réglementaires à vérifier avant de vendre.

## Modifier le catalogue

Tout le catalogue est dans `src/data/catalog.json` :

| Champ | Rôle |
|---|---|
| `slug` | Adresse de la page produit (`/produit/<slug>`) |
| `ranges` | `["argan"]`, `["rose"]` ou les deux |
| `type` | `huile`, `visage`, `corps` ou `cheveux` (filtres) |
| `price`, `compareAt` | Prix en centimes (`1200` = 12,00 €). `compareAt` = prix barré, ou `null` |
| `image` | Nom du fichier dans `src/assets/products/` |
| `soldOut` | `true` affiche « Épuisé » et remplace le bouton par « Me prévenir » |
| `organic` | `true` affiche le badge « Certifié bio » (uniquement avec une certification réelle) |
| `essentialOil` | `true` ajoute les précautions spécifiques aux huiles essentielles |

Pour ajouter une photo, déposez-la dans `src/assets/products/` : elle est compressée automatiquement au build.

Le produit du mois et la date de fin de promotion se règlent dans `site.ts` (`promo`). La remise multi-produits aussi (`bundleDiscount`).

Les avis clients se mettent dans `src/data/reviews.ts`. La section reste masquée tant que la liste est vide. N’y mettez que de vrais avis, avec l’accord des clients.

## Commandes

```bash
npm install
npm run dev          # aperçu local sur http://localhost:4321
npm run build        # génère le site dans dist/
npm run check:links  # vérifie liens internes, ancres et liens WhatsApp
```

## Mise en ligne sur GitHub Pages

1. Créez un dépôt GitHub et poussez ce dossier sur la branche `main`.
2. Dans le dépôt : Settings > Pages > Source : « GitHub Actions ».
3. Chaque push sur `main` construit, vérifie et publie le site (`.github/workflows/deploy.yml`).
4. Domaine : le fichier `public/CNAME` contient `saramaya-kin.com`. Chez votre registraire, créez les enregistrements DNS indiqués par GitHub (4 enregistrements `A` vers les IP de GitHub Pages et un `CNAME` `www` vers `<utilisateur>.github.io`), puis cochez « Enforce HTTPS ».

## Structure

```
src/
  data/        catalogue, réglages de marque, avis
  lib/         helpers (catalogue, images, liens WhatsApp)
  components/  logo, en-tête, pied de page, carte produit, sélection
  layouts/     gabarit principal et gabarit des pages légales
  pages/       une page par fichier (accueil, gammes, produits, coffrets, légal…)
  scripts/     animations (GSAP, Lenis), pétales 3D (Three.js), sélection WhatsApp
  styles/      design system (couleurs, typographies, boutons)
```
