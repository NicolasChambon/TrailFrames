# TrailFrames - Instructions GitHub Copilot

## 🎯 Contexte du Projet

TrailFrames est une application web pour visualiser et gérer les activités Strava avec des fonctionnalités personnalisées. Le projet est organisé en **monorepo** avec deux applications principales :

- **Backend** : API REST Node.js avec Express, TypeScript et Prisma
- **Frontend** : Application React avec Vite, TypeScript et TailwindCSS

## 📐 Architecture et Structure

### Organisation Monorepo

```
/
├── backend/         → API REST (Express + TypeScript + Prisma)
├── frontend/        → Application React (Vite + TypeScript + TailwindCSS)
├── docs/           → Documentation
└── TODO/           → Tâches et planification
```

### Backend (`backend/`)

#### Structure

- `src/`
  - `controllers/` → Logique de contrôle des routes
  - `services/` → Logique métier
  - `routes/` → Définition des routes Express
  - `middlewares/` → Middlewares Express (auth, CSRF)
  - `lib/` → Utilitaires (encryption, JWT, logger, Prisma)
  - `schemas/` → Validation Zod
  - `types/` → Définitions TypeScript
  - `generated/prisma/` → Client Prisma généré
- `tests/`
  - `unit/` → Tests unitaires
  - `integration/` → Tests d'intégration
  - `helpers/` → Utilitaires de test
  - `mocks/` → Mocks pour les tests
- `prisma/`
  - `schema.prisma` → Schéma de base de données
  - `migrations/` → Migrations Prisma

#### Stack Technique

- **Runtime** : Node.js (v18+) avec TypeScript (ESNext modules)
- **Framework** : Express 5
- **ORM** : Prisma avec PostgreSQL
- **Sécurité** : Helmet, CORS, CSRF protection, rate limiting
- **Auth** : JWT (access + refresh tokens), Argon2 pour hashing
- **Validation** : Zod
- **Tests** : Vitest
- **Logger** : Winston
- **Build** : esbuild

#### Conventions Backend

1. **Import Paths** : Utiliser les alias `@/*` pour `./src/*` et `@tests/*` pour `./tests/*`
2. **Modules** : Utiliser ES modules (import/export), pas de CommonJS
3. **Types** : TypeScript strict mode activé
4. **Services** : Pattern service pour la logique métier (classes)
5. **Controllers** : Fonctions async avec gestion d'erreurs
6. **Routes** : Router Express avec validation Zod
7. **Middlewares** : Auth JWT, CSRF protection
8. **Errors** : Classe `AppError` personnalisée avec codes d'erreur
9. **Logger** : Winston pour tous les logs (pas de console.log)
10. **Tests** : Tests unitaires et d'intégration séparés

### Frontend (`frontend/`)

#### Structure

- `src/`
  - `components/` → Composants React
    - `ui/` → Composants UI réutilisables (shadcn/ui)
    - `layouts/` → Layouts de pages
  - `pages/` → Pages de l'application
  - `context/` → React Context (AuthContext)
  - `hooks/` → Custom React hooks
  - `lib/` → Utilitaires (API client, formatters, mutations)
  - `types/` → Définitions TypeScript
- `tests/` → Tests Vitest
- `public/` → Assets statiques (fonts, SVG)

#### Stack Technique

- **Framework** : React 19 avec TypeScript
- **Build Tool** : Vite
- **Styling** : TailwindCSS v4
- **UI Components** : shadcn/ui avec Radix UI
- **Routing** : React Router v7
- **Data Fetching** : SWR + Axios
- **Forms** : Custom mutations avec Zod validation
- **Tests** : Vitest + Testing Library
- **Icons** : Lucide React
- **Toasts** : Sonner

#### Conventions Frontend

1. **Composants** : PascalCase, un composant par fichier
2. **Hooks** : Préfixe `use` (useAuth, useCountdown)
3. **Types** : Interfaces pour les props, types pour les données
4. **Styling** : TailwindCSS avec `cn()` utility (tailwind-merge)
5. **API** : Utiliser le client API centralisé (`lib/api.ts`)
6. **State Management** : React Context pour auth, SWR pour données serveur
7. **Protected Routes** : Component `ProtectedRoute` pour routes authentifiées
8. **Error Handling** : `formatError()` pour messages d'erreur cohérents
9. **Imports** : Pas d'alias de path configuré (chemins relatifs)

## 🔐 Authentification et Sécurité

### Flow d'Authentification

1. **OAuth Strava** : Authentification via Strava OAuth 2.0
2. **JWT Tokens** :
   - Access token (15 min) dans cookie httpOnly
   - Refresh token (7 jours) dans cookie httpOnly
3. **CSRF Protection** : Token CSRF pour toutes les requêtes mutantes
4. **Rate Limiting** : Protection contre les abus

### Middleware Auth

- `authenticateToken` : Vérifie et valide le JWT
- `csrfProtection` : Protège contre les attaques CSRF
- User ajouté à `req.user` après authentification

## 🗄️ Base de Données (Prisma)

### Modèles Principaux

- **User** : Utilisateur de l'application (email, stravaAthleteId, tokens)
- **StravaData** : Données complètes de l'athlète Strava
- **Activity** : Activités sportives (Run, Ride, Hike, etc.)
- **RefreshToken** : Tokens de rafraîchissement JWT
- **StravaToken** : Tokens d'accès Strava

### Conventions Prisma

1. **IDs** : CUID pour User, BigInt pour IDs Strava, auto-increment pour autres
2. **Dates** : `createdAt` et `updatedAt` automatiques
3. **Relations** : Cascades configurées pour User (onDelete)
4. **Enums** : SportType, Sex définis dans le schema
5. **Output** : Client généré dans `backend/src/generated/prisma`

### Commandes Prisma

- `npx prisma migrate dev` : Créer une migration en dev
- `npx prisma generate` : Régénérer le client
- `npx prisma studio` : Interface graphique de la DB

## 📝 Conventions de Code Générales

### TypeScript

1. **Strict Mode** : Toujours activé
2. **Types** : Typage explicite des paramètres et retours de fonctions
3. **Interfaces vs Types** : Interfaces pour objets, Types pour unions/intersections
4. **Enums** : Préférer les const enums ou unions de types littéraux
5. **Null Safety** : Gérer explicitement null et undefined

### Naming Conventions

1. **Fichiers** :
   - Composants React : `PascalCase.tsx`
   - Services/Classes : `camelCase.ts`
   - Types : `camelCase.ts`
   - Tests : `*.test.ts` ou `*.test.tsx`
2. **Variables/Fonctions** : `camelCase`
3. **Classes/Interfaces** : `PascalCase`
4. **Constants** : `UPPER_SNAKE_CASE`
5. **Enums** : `PascalCase` pour le nom et les valeurs

### Code Style

1. **Imports** : Grouper par type (external, internal, types)
2. **Exports** : Préférer named exports sauf pour pages
3. **Arrow Functions** : Préférer pour les fonctions courtes
4. **Async/Await** : Préférer à .then()/.catch()
5. **Error Handling** : Try/catch avec logs appropriés
6. **Comments** : Commenter le "pourquoi", pas le "quoi"

### ESLint

- Configuration ESLint stricte activée (backend et frontend)
- Pas d'avertissements tolérés en production (`--max-warnings 0`)
- Utiliser `npm run lint` avant chaque commit

## 🧪 Tests

### Backend Tests

1. **Structure** : Séparer unit et integration
2. **Helpers** : Utiliser les helpers de test (`testDb`, `testServer`, `testRegisterUser`)
3. **Mocks** : Mocker les services externes (Strava API)
4. **Cleanup** : Nettoyer la DB de test après chaque test
5. **Coverage** : Viser une bonne couverture des services et contrôleurs

### Frontend Tests

1. **Testing Library** : Utiliser les bonnes pratiques (queries, user-events)
2. **Mocks** : Axios Mock Adapter pour les appels API
3. **Coverage** : Tester les hooks et composants critiques

### Commandes Tests

```bash
# Backend
npm run test              # Lancer le test runner interactif
npm run test:unit         # Tests unitaires seulement
npm run test:integration  # Tests d'intégration seulement

# Frontend
npm run test              # Lancer le test runner interactif
npm run test:all          # Tous les tests
```

## 🚀 Development Workflow

### Démarrage

```bash
# À la racine du projet
npm run dev               # Lance backend + frontend simultanément

# Backend seul
cd backend && npm run dev

# Frontend seul
cd frontend && npm run dev
```

### Scripts Utiles

```bash
# Vérification TypeScript
npm run ts:check          # Backend + Frontend
npm run ts:check:back     # Backend seulement
npm run ts:check:front    # Frontend seulement

# Vérification complète (TS + ESLint)
npm run errors:check      # Backend + Frontend
npm run errors:check:back # Backend seulement
npm run errors:check:front # Frontend seulement

# Linting
npm run lint              # Backend + Frontend
```

## 🌐 API et Intégrations

### Strava API

- **Services** : `stravaServices.ts` contient toutes les interactions Strava
- **Endpoints** :
  - Authentification OAuth
  - Récupération d'activités
  - Sync données athlète
- **Rate Limits** : Respecter les limites Strava (200 req/15min, 2000 req/jour)
- **Error Handling** : Gérer les erreurs API Strava proprement

### API Routes Backend

```
/api/auth/
  POST /register       → Créer un compte
  POST /login          → Se connecter (email/password)
  POST /logout         → Se déconnecter
  POST /refresh        → Rafraîchir access token
  GET  /me             → Infos utilisateur courant
  GET  /strava/url     → URL OAuth Strava
  POST /strava/callback → Callback OAuth Strava

/api/activities/
  GET  /               → Liste des activités
  GET  /:id            → Détails d'une activité
  POST /sync           → Synchroniser avec Strava
```

## 🎨 UI/UX Guidelines

### Design System

- **Colors** : Palette définie dans Tailwind config
- **Typography** : Polices personnalisées dans `public/fonts/`
- **Icons** : Lucide React
- **Components** : shadcn/ui avec personnalisations

### Composants UI Réutilisables

- Boutons : `Button` (variants: default, destructive, outline, ghost)
- Formulaires : `Input`, `Label`, `Form` avec validation
- Dialogs : `Dialog` de Radix UI
- Toasts : `Toast` avec Sonner
- Layout : `Header`, layouts partagés

### Responsive Design

- Mobile First approach
- Breakpoints TailwindCSS : sm, md, lg, xl, 2xl
- Tester sur différentes tailles d'écran

## 📦 Dependencies Management

### Mise à Jour

- Vérifier les dépendances régulièrement
- Tester après chaque mise à jour majeure
- Lire les changelogs avant de mettre à jour

### Installation

```bash
# Depuis la racine
npm run install:all      # Installe tout (root + backend + frontend)

# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

## 🐛 Debugging

### Backend

- **Logger** : Winston logs dans `backend/logs/`
- **Prisma Studio** : `npx prisma studio` pour inspecter la DB
- **Debug Mode** : Variables d'environnement NODE_ENV=development

### Frontend

- **React DevTools** : Extension Chrome/Firefox
- **Network Tab** : Inspecter les requêtes API
- **Console** : Éviter les console.log en production

## 🔑 Variables d'Environnement

### Backend (.env)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
FRONTEND_DEV_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
VITE_STRAVA_CLIENT_ID=...
```

## 📚 Ressources et Documentation

- **React** : https://react.dev
- **Vite** : https://vitejs.dev
- **TailwindCSS** : https://tailwindcss.com
- **shadcn/ui** : https://ui.shadcn.com
- **Prisma** : https://www.prisma.io/docs
- **Strava API** : https://developers.strava.com

## ✨ Bonnes Pratiques Spécifiques au Projet

1. **Logger** : Toujours utiliser Winston, jamais console.log en backend
2. **Auth Flow** : Suivre le flow d'authentification établi (JWT + CSRF)
3. **Prisma Client** : Utiliser `prisma` depuis `lib/prisma.ts` (singleton)
4. **API Client** : Utiliser le client centralisé dans `frontend/src/lib/api.ts`
5. **Error Messages** : Messages utilisateur clairs et en français
6. **CORS** : Vérifier les origines autorisées en production
7. **Types** : Partager les types entre backend et frontend si nécessaire
8. **Migrations** : Toujours créer une migration pour les changements de schéma
9. **Commits** : Messages de commit clairs et descriptifs
10. **Code Review** : Relire le code avant de committer

## 🚨 Points d'Attention

1. **Sécurité** :
   - Ne jamais committer les .env
   - Valider toutes les entrées utilisateur (Zod)
   - CSRF protection pour toutes les mutations
   - Rate limiting activé

2. **Performance** :
   - Pagination pour les listes longues
   - SWR cache pour données fréquentes
   - Lazy loading des composants lourds

3. **Base de Données** :
   - Toujours utiliser transactions pour opérations multiples
   - Indexer les colonnes recherchées fréquemment
   - Nettoyer les tokens expirés régulièrement

4. **API Strava** :
   - Respecter les rate limits
   - Gérer les erreurs réseau proprement
   - Rafraîchir les tokens Strava avant expiration

## 🎯 Modes de Travail

### 🎓 Mode Pédagogique (activable à la demande)

**Activation** : L'utilisateur peut activer ce mode en ajoutant `[MODE PÉDAGOGIQUE]` ou `[TEACH]` dans sa demande.

**Comportement** :
- Expliquer CHAQUE modification en détail
- Fournir des extraits de code **avant/après** pour toutes les modifications
- Justifier les choix techniques et architecturaux
- Expliquer les concepts utilisés (patterns, bonnes pratiques)
- Ajouter des commentaires pédagogiques dans le code
- Mettre en évidence les erreurs potentielles évitées
- Suggérer des ressources pour approfondir

**Format de réponse** :

```markdown
## 📝 Résumé des modifications

[Vue d'ensemble des changements]

## 🔧 Modifications détaillées

### 1. [Nom de la modification]

**Pourquoi** : [Raison de la modification]

**Avant** :
[Code avant avec ligne de contexte]

**Après** :
[Code après avec commentaires pédagogiques]

**Explications** :
- [Point 1] : Explication détaillée
- [Point 2] : Concept sous-jacent
- [Point 3] : Bonnes pratiques appliquées

**Concepts clés** :
- [Concept 1] : Définition et utilité
- [Concept 2] : Pourquoi c'est important

**Pièges évités** :
- ❌ [Anti-pattern évité] : Pourquoi c'est mauvais
- ✅ [Bonne pratique appliquée] : Pourquoi c'est mieux

**Ressources** :
- [Lien vers doc pertinente]

---

### 2. [Modification suivante]
[Même structure...]

## ✅ Checklist de vérification

- [ ] [Point à vérifier 1]
- [ ] [Point à vérifier 2]

## 🎯 Points d'apprentissage clés

1. **[Concept principal]** : [Explication en une phrase]
2. **[Pattern utilisé]** : [Quand l'utiliser]
3. **[Bonne pratique]** : [Pourquoi c'est important]

## 💡 Pour aller plus loin

- [Suggestion d'amélioration future]
- [Concept connexe à explorer]
```

**Niveau de détail** :
- Adapter le langage pour un développeur junior
- Éviter le jargon sans l'expliquer
- Décomposer les concepts complexes en étapes simples
- Donner des analogies quand pertinent
- Expliquer le "pourquoi" autant que le "comment"

---

## 🎯 Directives pour GitHub Copilot

### Mode par défaut (Standard)

#### Lors de la génération de code :

1. **Respecter l'architecture** : Backend services + controllers, Frontend components + hooks
2. **Typer strictement** : Toujours fournir des types TypeScript explicites
3. **Validation** : Utiliser Zod pour valider les entrées
4. **Error Handling** : Toujours gérer les erreurs avec try/catch et logger
5. **Tests** : Suggérer des tests unitaires pour le nouveau code
6. **Sécurité** : Appliquer les bonnes pratiques de sécurité (auth, validation, CSRF)
7. **Comments** : Commenter le code complexe en français
8. **Imports** : Utiliser les alias de path correctement
9. **Async** : Préférer async/await aux promises
10. **Consistency** : Suivre les patterns existants dans le code

#### Lors de la suggestion de modifications :

1. Analyser le contexte existant avant de suggérer
2. Maintenir la cohérence avec le code environnant
3. Suggérer des améliorations de performance si pertinent
4. Vérifier la compatibilité des dépendances
5. Proposer des tests pour valider les changements

#### Priorités :

1. **Sécurité** avant tout
2. **Typage** strict
3. **Lisibilité** du code
4. **Performance** si nécessaire
5. **Tests** pour le code critique

---

**Note** : Ce fichier est destiné à optimiser la génération de code par GitHub Copilot. Il doit être maintenu à jour lorsque l'architecture ou les conventions évoluent.
