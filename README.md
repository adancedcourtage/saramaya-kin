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
| `variants` | Facultatif. Liste de formats (`slug`, `label`, `price`, `compareAt`, `image`, `tagline`, `composition`, `organic`) : la fiche affiche un sélecteur de format |
| `organic` | `true` affiche le badge « Certifié bio » (uniquement avec une certification réelle) |
| `essentialOil` | `true` ajoute les précautions spécifiques aux huiles essentielles |

Pour ajouter une photo, déposez-la dans `src/assets/products/` : elle est compressée automatiquement au build.

Le produit du mois et la date de fin de promotion se règlent dans `site.ts` (`promo`). La remise multi-produits aussi (`bundleDiscount`).

Si vous renommez ou fusionnez un produit, ajoutez l’ancienne adresse dans `src/data/redirects.json` pour que les anciens liens continuent de fonctionner.

Les avis clients se mettent dans `src/data/reviews.ts`. La section reste masquée tant que la liste est vide. N’y mettez que de vrais avis, avec l’accord des clients.

## Commandes

```bash
npm install
npm run dev          # aperçu local sur http://localhost:4321
npm run build        # génère le site dans dist/
npm run check:links  # vérifie liens internes, ancres et liens WhatsApp
npm run deploy       # publie sur GitHub Pages
```

## Mise en ligne sur GitHub Pages

Dépôt : https://github.com/adancedcourtage/saramaya-kin

Le site est publié sur la branche `gh-pages` (Settings > Pages > « Deploy from a branch », branche `gh-pages`, dossier `/`).

```bash
npm run deploy
```

La commande construit le site, vérifie les liens et publie sur https://adancedcourtage.github.io/saramaya-kin/.

### Brancher le domaine saramaya-kin.com

1. Achetez le domaine (il n'était pas enregistré au 15 octobre 2026).
2. Chez le registraire, créez 4 enregistrements `A` vers `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, et un `CNAME` `www` vers `adancedcourtage.github.io`.
3. Publiez avec le domaine :

```bash
CUSTOM_DOMAIN=saramaya-kin.com npm run deploy
```

4. Dans Settings > Pages, cochez « Enforce HTTPS » dès que GitHub le propose.

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
