# Vérification de conformité : saramaya-kin.com

Vente à distance, en France, de cosmétiques fabriqués au Maroc et importés par un vendeur individuel. Commande conclue sur WhatsApp, sans paiement en ligne.

> Ce document aide à préparer la mise en ligne. Ce n’est pas un avis juridique. Faites valider les points marqués « à faire » par un professionnel (avocat, expert-comptable, CCI ou consultant en réglementation cosmétique). Les règles évoluent : vérifiez-les sur les sources officielles (legifrance.gouv.fr, economie.gouv.fr/dgccrf, ansm.sante.fr, cnil.fr, douane.gouv.fr).

## Synthèse

**Lancement possible sous conditions.** Le site lui-même est prêt : pages légales, CGV, confidentialité, aucun cookie soumis à consentement, précautions d’emploi sur chaque produit, aucune allégation thérapeutique, aucun avis inventé. Le point le plus lourd est **hors du site** : en important et en vendant des cosmétiques dans l’Union européenne, vous devenez en principe responsable de leur conformité au règlement cosmétiques.

## Réglementations applicables

| Réglementation | Pourquoi elle s’applique | Ce qu’il faut faire |
|---|---|---|
| Règlement (CE) n° 1223/2009 (cosmétiques) | Vous importez des cosmétiques d’un pays tiers pour les vendre dans l’UE | Désigner une **personne responsable** établie dans l’UE (vous-même ou un prestataire). Pour chaque produit : dossier d’information produit (DIP) avec **rapport de sécurité** signé par un évaluateur qualifié, **notification sur le portail CPNP** avant la vente, fabrication selon les bonnes pratiques (ISO 22716), étiquetage conforme |
| Étiquetage (art. 19 du règlement + loi Toubon) | Produits vendus en France | Mentions **en français** : nom et adresse de la personne responsable, contenance, date de durabilité minimale ou PAO, précautions, numéro de lot, fonction du produit, liste INCI, pays d’origine |
| Règlement (UE) n° 655/2013 (allégations) | Textes des fiches produits | Allégations honnêtes et justifiables. Pas de promesse médicale (« soigne », « cicatrise », « traite l’acné »). Le site a été relu dans ce sens |
| Mention « bio » | Badge « Certifié bio » et textes | Pas de règlement européen bio pour les cosmétiques : seule une certification privée (Cosmos, Ecocert…) permet le mot « bio ». Sans certificat, c’est une pratique commerciale trompeuse |
| Code de la consommation (vente à distance) | Vente à des particuliers | Information précontractuelle, confirmation sur support durable, rétractation de 14 jours (avec exception pour les produits descellés), garanties légales, médiateur. Couvert par les CGV |
| Prix et promotions (art. L112-1-1, directive Omnibus) | « Promo -19 % », prix barrés, coffrets | Le prix barré doit être le **prix le plus bas pratiqué dans les 30 jours** avant la promotion |
| Avis en ligne (art. L111-7-2) | Section avis | Uniquement de vrais avis, avec indication de leur mode de vérification. La section reste masquée tant qu’il n’y en a pas |
| LCEN (art. 6) | Site édité par un professionnel | Mentions légales complètes : identité, SIRET, adresse, hébergeur, directeur de la publication |
| RGPD | Données clients (nom, téléphone, adresse) | Politique de confidentialité (faite), registre simple des traitements, durées de conservation, réponse aux demandes sous un mois |
| Douane | Import Maroc vers France | Déclarer les marchandises comme **commerciales** (pas comme bagage personnel). Accord d’association UE-Maroc : droits réduits ou nuls avec preuve d’origine (EUR.1 ou déclaration d’origine). TVA à l’import |
| Statut et fiscalité | Activité commerciale régulière | Immatriculation (micro-entreprise ou autre) **avant** de vendre, SIRET, régime de TVA, facturation |

## Exigences

| # | Exigence | Statut | Action |
|---|---|---|---|
| 1 | Mentions légales complètes | Partiel | Compléter `src/data/site.ts` (nom, statut, SIRET, adresse, directeur de la publication) |
| 2 | Personne responsable UE et notification CPNP pour chaque produit | Inconnu | Vérifier si le fabricant marocain a déjà une personne responsable UE. Sinon, en désigner une avant de vendre |
| 3 | Rapport de sécurité et DIP par produit | Inconnu | Demander au fabricant ou faire réaliser par un évaluateur de la sécurité |
| 4 | Étiquetage en français conforme | Inconnu | Vérifier chaque emballage. Plusieurs photos montrent des étiquettes en arabe uniquement : ajouter une contre-étiquette en français |
| 5 | Justificatif des certifications « bio » | Inconnu | Garder les certificats. Le badge n’apparaît que sur « Huile d’Argane Bio 100ml ». Les textes de « Huile d’Argan » mentionnent aussi « Bio » : retirer le mot si aucun certificat |
| 6 | Médiateur de la consommation | Non fait | Adhérer à un médiateur agréé (liste sur economie.gouv.fr) et renseigner son nom |
| 7 | Prix de référence des promotions | Inconnu | Vérifier que 9,90 € était bien le prix le plus bas des 30 derniers jours pour le shampooing |
| 8 | Autorisation écrite pour les photos de Les jardins d’Erin | Accord verbal | Garder une trace écrite (message ou e-mail) de l’autorisation |
| 9 | Marque « Saramaya-kin » | Non fait | Vérifier la disponibilité et déposer la marque à l’INPI (classes 3 et 35) |
| 10 | Numéro WhatsApp professionnel | Non fait | Utiliser WhatsApp Business avec le nom de la marque et un lien vers les CGV |

## Risques

| Risque | Gravité | Comment le réduire |
|---|---|---|
| Vente de cosmétiques sans personne responsable, sans DIP ou sans notification CPNP | Élevée | Régler les points 2 à 4 avant la première vente. Contrôles possibles de la DGCCRF, avec retrait des produits et amendes |
| Mention « bio » non justifiée | Moyenne | Point 5 |
| Litige client sans médiateur désigné | Moyenne | Point 6 (amende administrative possible) |
| Commande contestée faute de récapitulatif écrit | Faible | Toujours envoyer le récapitulatif et attendre la confirmation écrite (procédure décrite dans les CGV) |
| Réaction cutanée | Faible à moyenne | Précautions d’emploi affichées, test de tolérance recommandé. Envisager une assurance responsabilité civile professionnelle |

## Actions prioritaires

1. S’immatriculer et obtenir un SIRET, puis compléter `site.ts`.
2. Régler la conformité cosmétique : personne responsable UE, DIP, CPNP, étiquettes françaises.
3. Adhérer à un médiateur de la consommation.
4. Vérifier les certificats bio et ajuster les textes si besoin.
5. Déposer la marque et garder l’autorisation écrite pour les photos.

## Validations recommandées

| Qui | Pourquoi |
|---|---|
| Consultant ou laboratoire en réglementation cosmétique | Personne responsable, DIP, rapport de sécurité, CPNP, étiquetage |
| Expert-comptable ou CCI | Statut, TVA, import et douane |
| Avocat en droit de la consommation | Relecture finale des CGV et des mentions légales |
