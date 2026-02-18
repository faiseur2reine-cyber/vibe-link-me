

# MyTaptap — Plan d'implémentation

## Vue d'ensemble
MyTaptap est une plateforme de type Linktree permettant aux créateurs de contenu de centraliser leurs liens sur une page publique personnalisable. L'app inclut authentification, dashboard, pages publiques, analytics, thèmes, abonnements Stripe et support multilingue.

---

## Phase 1 — Fondations & Style
- Mise en place du design system coloré et fun : dégradés violet/rose/orange, boutons arrondis, animations douces, typographie moderne
- Configuration i18n avec détection automatique de la langue du navigateur (FR, EN, ES, DE, IT, PT) et sélecteur manuel
- Structure de routing : pages d'accueil, auth, dashboard, page publique `/:username`

## Phase 2 — Authentification & Profils
- Connexion à Lovable Cloud (Supabase) pour la base de données et l'authentification
- Inscription email/mot de passe + Google Sign-In
- Choix d'un nom d'utilisateur unique à l'inscription (validation en temps réel)
- Table `profiles` : username, display_name, bio, avatar_url, theme, plan
- Réinitialisation de mot de passe

## Phase 3 — Dashboard utilisateur
- Modification du profil : photo de profil (upload via Storage), nom affiché, bio
- Gestion des liens : ajout, modification, suppression
- Réorganisation des liens par drag & drop
- Chaque lien : titre, URL, icône (sélection parmi une bibliothèque d'icônes)
- Limitation à 5 liens pour le plan gratuit

## Phase 4 — Page publique `/:username`
- Page responsive et rapide affichant photo, nom, bio et liens sous forme de boutons
- Application du thème choisi par l'utilisateur
- Badge "Créé avec MyTaptap" (masqué pour les utilisateurs Pro)
- Optimisée pour le partage (meta tags)

## Phase 5 — Thèmes visuels
- 6 thèmes prédéfinis avec couleurs de fond, styles de boutons et typographies variées
- 3 thèmes accessibles en plan gratuit, 6 en plan Pro
- Prévisualisation en temps réel dans le dashboard

## Phase 6 — Analytics & Compteur de clics
- Enregistrement de chaque clic sur un lien (table `link_clicks`)
- Dashboard : nombre de clics par lien + total global
- Analytics détaillés pour le plan Pro (clics par jour, graphiques)

## Phase 7 — Abonnements Stripe
- Intégration Stripe Checkout pour le plan Pro à 9,99€/mois
- Gestion de l'état d'abonnement (actif/inactif)
- Webhook Stripe pour synchroniser le statut
- Restriction des fonctionnalités selon le plan (liens, thèmes, analytics, badge)

## Phase 8 — Finitions
- Traduction complète de toutes les pages et messages d'erreur dans les 6 langues
- Page d'accueil marketing attractive
- Tests et ajustements responsive mobile/desktop

