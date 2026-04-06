# Les Ateliers de la Source — Site web

Site web premium pour **Les Ateliers de la Source**, conçu comme un livrable d'agence complet.

**Stack :** Next.js 16 · TypeScript · Tailwind CSS v4 · Framer Motion · Sanity CMS · Supabase (auth + DB) · Resend (email) · Stripe (préparé)

---

## Sommaire

1. [Présentation du projet](#1-présentation)
2. [Architecture technique](#2-architecture)
3. [Installation locale](#3-installation-locale)
4. [Variables d'environnement](#4-variables-denvironnement)
5. [Configuration Supabase](#5-configuration-supabase)
6. [Configuration Sanity CMS](#6-configuration-sanity-cms)
7. [Configuration Resend (email)](#7-configuration-resend-email)
8. [Déploiement Vercel](#8-déploiement-vercel)
9. [Gestion du contenu](#9-gestion-du-contenu)
10. [Espace membre & Admin](#10-espace-membre--admin)
11. [Fonctionnalités futures](#11-fonctionnalités-futures)
12. [Structure des pages](#12-structure-des-pages)

---

## 1. Présentation

Le site sert trois objectifs :

| Objectif | Description |
|----------|-------------|
| **Vitrine premium** | Présenter les activités de Gabriel (A1–A5), Amélie (A6–A8), les stages/événements, le blog |
| **Outil métier** | Espace membre, suivi des stages, newsletter, paiement Stripe (préparé) |
| **Autonomie client** | Gabriel et Amélie peuvent gérer tout le contenu seuls via Sanity Studio, sans toucher au code |

---

## 2. Architecture technique

```
src/
├── app/
│   ├── (public)/          ← Pages publiques (homepage, activités, events, blog, contact…)
│   ├── (admin)/           ← Espace admin (protégé, rôle admin)
│   ├── (auth)/            ← Connexion / Inscription
│   ├── (member)/          ← Espace membre (protégé par auth Supabase)
│   ├── api/               ← Routes API (auth, contact, email, newsletter, stripe, admin, member)
│   └── studio/            ← Sanity Studio embarqué (/studio)
├── components/
│   ├── ui/                ← Design system (Button, Container, Section, Heading, Badge, Input, Modal…)
│   └── layout/            ← Header, Footer
├── features/              ← Logique métier par domaine
│   ├── home/              ← HeroHome, FounderColumns, FeaturedEvents, HomeIntro, NewsletterSection
│   ├── activites/         ← ActivitesListPage, ActivityDetailPage
│   ├── evenements/        ← EventsListPage, EventDetailPage
│   ├── blog/              ← BlogListPage, BlogDetailPage
│   ├── auth/              ← LoginPage, SignupPage, MemberDashboard, MemberProfilPage…
│   ├── admin/             ← AdminDashboard, AdminMembersPage, AdminMemberDetailPage
│   └── payments/          ← Stripe (caché, désactivé au lancement)
├── lib/
│   ├── auth/              ← AuthContext (Supabase auth via Context API)
│   ├── sanity/            ← Client Sanity, imageUrl, queries GROQ, fetch avec fallback
│   ├── email/             ← Resend helper (signup, contact, confirmation)
│   ├── supabase/          ← Client browser/server, types Supabase
│   └── utils/             ← cn(), dates helpers
└── types/                 ← Types TypeScript globaux (Activity, Event, Post, Person…)

sanity/
├── schemaTypes/
│   ├── documents/         ← person, activity, event, post, siteSettings, memberLead
│   └── objects/           ← seo, portableText, priceInfo, durationInfo, callToAction…
```

---

## 3. Installation locale

### Prérequis
- Node.js 18+
- npm

### Étapes

```bash
# 1. Cloner le projet
git clone <repo-url>
cd ateliers-source

# 2. Installer les dépendances
npm install

# 3. Copier les variables d'environnement
cp .env.local.example .env.local
# → Remplir les valeurs (voir section 4)

# 4. Lancer le serveur de développement
npm run dev

# Le site est disponible sur http://localhost:3000
# Le studio Sanity sera sur http://localhost:3000/studio (après configuration Sanity)
```

---

## 4. Variables d'environnement

Copier `.env.local.example` en `.env.local` et renseigner toutes les valeurs.

```bash
# ─── Supabase ──────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...   # Jamais exposée côté client

# ─── Sanity CMS ────────────────────────────────────────────────
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=skABC...            # Token lecture (optionnel)

# ─── Site ──────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://ateliersdelasource.fr

# ─── Email (Resend) ────────────────────────────────────────────
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=Les Ateliers de la Source <noreply@ateliersdelasource.fr>
CONTACT_EMAIL=gabrielgalmide.contact@gmail.com

# ─── Sécurité ──────────────────────────────────────────────────
SETUP_SECRET=your-very-long-random-secret   # Pour /api/admin/setup
NEXTAUTH_SECRET=your-nextauth-secret

# ─── Stripe (préparé — non activé au lancement) ────────────────
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 5. Configuration Supabase

### Créer les tables

Exécuter le fichier `supabase-schema.sql` dans l'éditeur SQL de Supabase :

1. Ouvrir [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet
3. Aller dans **SQL Editor**
4. Coller le contenu de `supabase-schema.sql` et exécuter

### Tables créées

| Table | Description |
|-------|-------------|
| `profiles` | Profils membres (email, nom, rôle, préférences newsletter) |
| `stage_logs` | Fiches de suivi par stage (intention, réflexion, note) |
| `member_notes` | Notes personnelles du membre |
| `trainer_notes` | Notes du formateur (Gabriel) sur chaque membre |
| `reservations` | Réservations (avec support Stripe futur) |

### Créer le compte admin Gabriel

Après le premier déploiement, appeler une seule fois :

```bash
curl -X POST https://ateliersdelasource.fr/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{"secret":"VOTRE_SETUP_SECRET","email":"gabrielgalmide.contact@gmail.com","password":"MotDePasseForte123"}'
```

### RLS (Row Level Security)

Les politiques RLS sont définies dans `supabase-schema.sql` :
- Membres : accès uniquement à leurs propres données
- Admins (rôle = "admin") : accès complet à toutes les tables
- Notes formateur : visibles par le membre uniquement si `is_visible_to_member = true`

---

## 6. Configuration Sanity CMS

### Créer un projet Sanity

1. Créer un compte sur [sanity.io](https://sanity.io)
2. Créer un nouveau projet dans [sanity.io/manage](https://sanity.io/manage)
3. Copier le **Project ID** et le mettre dans `.env.local`

### Démarrer le Studio

Une fois les variables Sanity renseignées :

```bash
npm run dev
# Accéder à : http://localhost:3000/studio
```

### Accorder les CORS

Dans **sanity.io/manage → votre projet → API → CORS origins** :
- Ajouter `http://localhost:3000`
- Ajouter `https://ateliersdelasource.fr`

### Contenu à créer en premier

1. **Réglages du site** (Paramètres du site) — titre, email, héros
2. **Intervenants** — créer Gabriel et Amélie
3. **Activités** — créer A1 à A8 (les textes sont en dur comme fallback si Sanity non configuré)
4. **Stages/Événements** — créer les prochaines dates

### Revalidation ISR

Configurer un webhook Sanity qui appelle :
```
POST https://ateliersdelasource.fr/api/revalidate?secret=REVALIDATE_SECRET
Body: { "type": "activity|event|post", "slug": "le-slug" }
```

> **Note :** Si Sanity n'est pas configuré (Project ID = 'your-project-id'), les pages affichent automatiquement les données statiques intégrées (activités A1–A8, événements exemples). Aucune erreur ne sera levée.

---

## 7. Configuration Resend (email)

1. Créer un compte sur [resend.com](https://resend.com)
2. Ajouter et vérifier votre domaine (ateliersdelasource.fr)
3. Créer une API Key
4. Renseigner `RESEND_API_KEY` et `EMAIL_FROM` dans `.env.local`

### Emails automatiques gérés

| Déclencheur | Email envoyé |
|-------------|-------------|
| Inscription d'un nouveau membre | Confirmation avec lien de vérification (géré par Supabase Auth) |
| Formulaire de contact | Email à `CONTACT_EMAIL` + confirmation à l'expéditeur |
| Route `/api/email/send` | Email transactionnel générique |

---

## 8. Déploiement Vercel

### Déploiement initial

```bash
npm install -g vercel
vercel        # Suivre les instructions
vercel --prod # Déployer en production
```

### Variables d'environnement sur Vercel

Dans **Vercel Dashboard → votre projet → Settings → Environment Variables**, ajouter toutes les variables de `.env.local`.

**Variables critiques pour la production :**
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL=https://ateliersdelasource.fr`
- `RESEND_API_KEY` + `EMAIL_FROM` + `CONTACT_EMAIL`
- `SETUP_SECRET` + `NEXTAUTH_SECRET`

### Domaine personnalisé

Dans **Vercel Dashboard → Domains** : ajouter `ateliersdelasource.fr`

---

## 9. Gestion du contenu

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

---

## 10. Espace membre & Admin

### Espace membre (`/espace-membre`)

Accessible après connexion via `/connexion` ou inscription via `/inscription`.

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/espace-membre` | Bienvenue, liens rapides |
| Profil | `/espace-membre/profil` | Modifier nom, phone, bio |
| Mon parcours | `/espace-membre/suivi` | Fiches de suivi des stages |
| Réservations | `/espace-membre/reservations` | Historique des inscriptions |
| Newsletter | `/espace-membre/newsletter` | Gérer ses préférences |

### Administration (`/admin`)

Accessible uniquement avec un compte rôle `admin`.

| Page | Description |
|------|-------------|
| `/admin` | Dashboard avec statistiques |
| `/admin/membres` | Liste des membres, recherche |
| `/admin/membres/[id]` | Fiche complète : suivi stages, notes formateur, réservations |

### Créer le compte admin

```bash
curl -X POST /api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{"secret":"SETUP_SECRET","email":"gabrielgalmide.contact@gmail.com","password":"..."}'
```

---

## 11. Fonctionnalités futures

### Stripe — Paiement en ligne

1. Créer un compte Stripe et des produits
2. Renseigner les clés dans `.env.local`
3. Tester en mode test avec Stripe CLI
4. Passer `registrationEnabled=true` sur les événements dans Sanity
5. Le code Stripe est déjà en place dans `src/app/api/stripe/` et `src/features/payments/`

### Newsletter automatisée

Le formulaire (`/api/newsletter/route.ts`) est en place. Brancher :
- **Brevo** (ex-Sendinblue) : ajouter `BREVO_API_KEY` et `BREVO_LIST_ID`
- Ou **Resend Audiences** (déjà installé)

### Automatisation réseaux sociaux

`/api/social-share/route.ts` est scaffoldé pour Make.com/Zapier.

---

## 12. Structure des pages

| URL | Description |
|-----|-------------|
| `/` | Homepage : hero, Gabriel & Amélie, events vedettes, newsletter |
| `/activites` | Liste toutes les activités (A1–A8), données Sanity ou statiques |
| `/activites/[slug]` | Détail activité avec contenu complet |
| `/evenements` | Liste stages/events avec filtres, données Sanity ou statiques |
| `/evenements/[slug]` | Détail événement avec flyer/inscription |
| `/blog` | Liste des articles (Sanity ou données statiques) |
| `/blog/[slug]` | Article complet |
| `/a-propos` | Présentation du lieu, Gabriel, Amélie |
| `/contact` | Formulaire de contact (email via Resend) |
| `/mentions-legales` | Mentions légales |
| `/politique-confidentialite` | Politique de confidentialité |
| `/accessibilite` | Déclaration d'accessibilité |
| `/connexion` | Connexion Supabase |
| `/inscription` | Inscription + confirmation email |
| `/espace-membre` | Dashboard membre (auth requise) |
| `/espace-membre/profil` | Édition profil |
| `/espace-membre/suivi` | Journal des stages |
| `/espace-membre/reservations` | Historique réservations |
| `/espace-membre/newsletter` | Préférences newsletter |
| `/admin` | Dashboard admin (rôle admin requis) |
| `/admin/membres` | Gestion membres |
| `/admin/membres/[id]` | Fiche membre complète |
| `/studio` | Sanity Studio (accès après configuration) |

---

## Notes pour le développeur suivant

- **Données statiques** : les textes des activités (A1–A5 complets) et les événements exemples sont intégrés comme fallback. Dès que Sanity est configuré (`NEXT_PUBLIC_SANITY_PROJECT_ID` ≠ `'your-project-id'`), les données Sanity prennent automatiquement le dessus — **sans aucun changement de code**.
- **Schémas Sanity** : complets dans `sanity/schemaTypes/`. À déployer une fois le projet Sanity créé : `npx sanity deploy`.
- **Stripe** : code scaffoldé dans `src/app/api/stripe/` et `src/features/payments/`. Décommenter et tester avant activation.
- **Auth** : 100% opérationnel via Supabase. Le middleware protège `/espace-membre` et `/admin` en vérifiant le cookie de session Supabase.

---

*Site conçu et développé comme livrable d'agence premium. Architecture évolutive, données statiques comme filet de sécurité, et autonomie client maximale via Sanity Studio.*
