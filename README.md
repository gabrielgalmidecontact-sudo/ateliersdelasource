# Les Ateliers de la Source — Site web

Site web premium pour **Les Ateliers de la Source**, conçu comme un livrable d'agence complet.

**Stack :** Next.js 16 · TypeScript · Tailwind CSS v4 · Framer Motion · Sanity CMS · Stripe (préparé) · NextAuth (préparé)

---

## Sommaire

1. [Présentation du projet](#1-présentation)
2. [Architecture technique](#2-architecture)
3. [Installation locale](#3-installation-locale)
4. [Variables d'environnement](#4-variables-denvironnement)
5. [Configuration Sanity CMS](#5-configuration-sanity-cms)
6. [Déploiement Vercel](#6-déploiement-vercel)
7. [Gestion du contenu](#7-gestion-du-contenu)
8. [Fonctionnalités futures](#8-fonctionnalités-futures)
9. [Structure du projet](#9-structure-du-projet)

---

## 1. Présentation

Le site sert trois objectifs :

| Objectif | Description |
|----------|-------------|
| **Vitrine premium** | Présenter les activités de Gabriel (A1–A5), Amélie (A6–A8), les stages/événements, le blog |
| **Outil métier** | Prépare le paiement Stripe, l'espace membre, la newsletter, l'automatisation réseaux sociaux |
| **Autonomie client** | Gabriel et Amélie peuvent gérer tout le contenu seuls via Sanity Studio, sans toucher au code |

---

## 2. Architecture technique

```
src/
├── app/
│   ├── (public)/          ← Pages publiques (homepage, activités, events, blog, contact…)
│   ├── (member)/          ← Espace membre (protégé par auth)
│   ├── api/               ← Routes API (contact, newsletter, stripe, social, revalidate)
│   └── studio/            ← Sanity Studio embarqué (accès /studio)
├── components/
│   ├── ui/                ← Design system (Button, Container, Section, Heading, Badge, Input…)
│   ├── layout/            ← Header, Footer
│   └── shared/            ← Composants partagés
├── features/              ← Logique métier par domaine
│   ├── home/              ← HeroHome, FounderColumns, FeaturedEvents, HomeIntro
│   ├── activites/         ← ActivitesListPage, ActivityDetailPage
│   ├── evenements/        ← EventsListPage, EventDetailPage
│   ├── blog/              ← BlogListPage, BlogDetailPage
│   ├── contact/           ← ContactPage
│   ├── auth/              ← MemberDashboard, Profil, Réservations, Newsletter
│   ├── payments/          ← ReserveButton (Stripe, caché)
│   └── newsletter/        ← NewsletterSection
├── lib/
│   ├── sanity/            ← Client Sanity, imageUrl, queries GROQ
│   ├── utils/             ← cn(), dates helpers
│   └── stripe/            ← (à compléter)
└── types/                 ← Types TypeScript globaux

sanity/
├── schemaTypes/
│   ├── documents/         ← person, activity, event, post, siteSettings, memberLead
│   └── objects/           ← seo, portableText, priceInfo, durationInfo
└── structure/             ← Structure personnalisée du Studio
```

---

## 3. Installation locale

### Prérequis
- Node.js 18+
- npm ou pnpm

### Étapes

```bash
# 1. Cloner le projet
git clone <repo-url>
cd ateliers-source

# 2. Installer les dépendances
npm install

# 3. Copier les variables d'environnement
cp .env.example .env.local
# → Remplir les valeurs (voir section 4)

# 4. Lancer le serveur de développement
npm run dev

# Le site est disponible sur http://localhost:3000
# Le studio Sanity sera sur http://localhost:3000/studio (après configuration)
```

---

## 4. Variables d'environnement

Copier `.env.example` en `.env.local` et renseigner :

```bash
# Site
NEXT_PUBLIC_SITE_URL=https://ateliersdelasource.fr

# Sanity CMS (OBLIGATOIRE pour le contenu live)
NEXT_PUBLIC_SANITY_PROJECT_ID=xxxxxxxx       # Récupérer sur sanity.io/manage
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=sk...                        # Token avec droits "Editor"
REVALIDATE_SECRET=une-chaine-aleatoire-longue

# Auth (à activer pour l'espace membre)
NEXTAUTH_URL=https://ateliersdelasource.fr
NEXTAUTH_SECRET=une-autre-chaine-aleatoire

# Stripe (NE PAS activer avant test complet)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PUBLIC_PAYMENTS_ENABLED=false                 # Mettre true UNIQUEMENT après test Stripe

# Email (Resend recommandé)
RESEND_API_KEY=re_...
CONTACT_EMAIL=gabriel@ateliersdelasource.fr

# Newsletter (Brevo recommandé)
BREVO_API_KEY=xkeysib-...
BREVO_LIST_ID=1
```

---

## 5. Configuration Sanity CMS

### Créer un projet Sanity

```bash
# 1. Créer un compte sur sanity.io
# 2. Créer un nouveau projet : https://sanity.io/manage

# 3. Installer la CLI Sanity (une seule fois)
npm install -g @sanity/cli

# 4. Se connecter
sanity login

# 5. Initialiser dans le dossier du projet
# (utiliser l'ID du projet créé sur sanity.io)
```

### Démarrer le Studio

Une fois les variables Sanity renseignées dans `.env.local` :

```bash
npm run dev
# Accéder à : http://localhost:3000/studio
```

### Accorder les CORS

Dans **sanity.io/manage → votre projet → API → CORS origins** :
- Ajouter `http://localhost:3000`
- Ajouter `https://ateliersdelasource.fr`

### Configurer la revalidation (ISR)

Dans Sanity Studio, configurer un webhook qui appelle :
```
POST https://ateliersdelasource.fr/api/revalidate?secret=REVALIDATE_SECRET
Body: { "type": "activity|event|post|siteSettings", "slug": "le-slug" }
```

### Contenu à créer en premier dans le Studio

1. **Réglages du site** (`/studio` → Paramètres du site)
   - Titre, description, email, téléphone
   - Héros de la homepage
   - Activer/désactiver newsletter, espace membre

2. **Intervenants** → Créer Gabriel et Amélie

3. **Activités** → Créer A1 à A8 avec les textes fournis

4. **Stages/Événements** → Créer les prochaines dates

---

## 6. Déploiement Vercel

### Déploiement initial

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Suivre les instructions, puis :
vercel --prod
```

### Variables d'environnement sur Vercel

Dans **Vercel Dashboard → votre projet → Settings → Environment Variables**, ajouter toutes les variables de `.env.local`.

### Domaine personnalisé

Dans **Vercel Dashboard → Domains** : ajouter `ateliersdelasource.fr`

---

## 7. Gestion du contenu

### Ce que Gabriel et Amélie peuvent faire sans coder

Accéder à **`https://ateliersdelasource.fr/studio`**

| Action | Où dans le Studio |
|--------|-------------------|
| Modifier un texte d'activité | Activités → choisir l'activité |
| Ajouter une date de stage | Stages/Événements → Nouveau |
| Uploader un flyer PDF | Stage/Événement → onglet Flyer |
| Afficher un stage sur la homepage | Stage → Afficher sur homepage ✓ |
| Publier un article de blog | Articles → Nouveau → Statut = Publié |
| Changer l'image du héros | Paramètres du site → Bandeau |
| Modifier les coordonnées | Paramètres du site → Général |
| Activer/désactiver la newsletter | Paramètres du site → Fonctionnalités |

### Rôles recommandés dans Sanity

- **Gabriel** : rôle "Editor" (peut tout modifier)
- **Amélie** : rôle "Editor"
- **Développeur** : rôle "Administrator"

---

## 8. Fonctionnalités futures

### Stripe — Paiement en ligne

1. Créer un compte Stripe
2. Créer les produits/prix dans le dashboard Stripe
3. Renseigner les clés dans `.env.local`
4. **Tester en mode test** avec Stripe CLI
5. Activer `PUBLIC_PAYMENTS_ENABLED=true` et `registrationEnabled=true` sur les events
6. Configurer le webhook Stripe vers `/api/stripe/webhook`

### Newsletter — Brevo (recommandé)

1. Créer un compte sur [brevo.com](https://brevo.com)
2. Créer une liste "Ateliers de la Source"
3. Renseigner `BREVO_API_KEY` et `BREVO_LIST_ID`
4. Décommenter le code dans `src/app/api/newsletter/route.ts`

### Automatisation réseaux sociaux — Make.com

1. Créer un compte [make.com](https://make.com)
2. Créer un scénario : Webhook → Facebook/Instagram
3. Renseigner `MAKE_WEBHOOK_URL` dans `.env`
4. Décommenter le code dans `src/app/api/social-share/route.ts`
5. Dans Sanity, cocher "Partager sur les réseaux" lors de la publication

### Espace membre complet

1. Configurer un provider dans `src/app/api/auth/[...nextauth]/route.ts`
2. Activer `MEMBER_AREA_ENABLED=true` dans les réglages Sanity
3. Décommenter les guards d'auth dans `middleware.ts` et `src/app/(member)/layout.tsx`

---

## 9. Structure des pages

| URL | Description |
|-----|-------------|
| `/` | Homepage : hero, Gabriel & Amélie, events vedettes, newsletter |
| `/activites` | Liste toutes les activités (A1–A8) |
| `/activites/[slug]` | Détail activité avec contenu complet des PDFs |
| `/evenements` | Liste stages/events avec filtres |
| `/evenements/[slug]` | Détail événement avec flyer/inscription |
| `/blog` | Liste des articles |
| `/blog/[slug]` | Article complet |
| `/a-propos` | Présentation du lieu, Gabriel, Amélie |
| `/contact` | Formulaire de contact |
| `/espace-membre` | Dashboard membre (à activer) |
| `/studio` | Sanity Studio (accès privé) |

---

## Notes pour le développeur suivant

- **Tout le contenu statique** (textes A1–A5 des PDFs) est en dur dans les fichiers de pages pour le lancement. Il devra être migré dans Sanity en branchant les queries GROQ qui sont déjà écrites dans `src/lib/sanity/queries.ts`.
- **Les schémas Sanity** sont complets et prêts dans `sanity/schemaTypes/`. Il suffit de les déployer une fois le projet Sanity créé.
- **Stripe** : tout le code est en place, il suffit de décommenter les sections indiquées.
- **Auth** : NextAuth est installé, il suffit d'ajouter un provider (Google recommandé pour la simplicité client).

---

*Site conçu et développé comme livrable d'agence premium. Architecture évolutive et autonomie client maximale.*
