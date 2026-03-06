# TrailFrames 🏃🏻‍♀️🏞️

Web application to visualize and manage your Strava activities with custom features and advanced analytics.

## 🎯 About

TrailFrames is a full-stack application that enhances your Strava experience by providing powerful visualization tools and personalized activity management. Built with modern web technologies, it offers a seamless integration with Strava's ecosystem while adding unique features for sports enthusiasts.

## ✨ Features

- 🔐 **Secure Authentication**: JWT-based auth with OAuth Strava integration
- 🔄 **Activity Synchronization**: Automatic sync with your Strava activities
- 📊 **Advanced Analytics**: Visualize your performance data
- 🎨 **Modern UI**: Responsive design with TailwindCSS and shadcn/ui
- 🛡️ **Production-Ready**: CSRF protection, rate limiting, and security best practices

## 🏗️ Architecture

This project is organized as a **monorepo** with the following structure:

### 📂 Main Directories

```
TrailFrames/
├── backend/           # REST API (Express + TypeScript + Prisma)
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Auth, CSRF, etc.
│   │   ├── lib/            # Utilities (JWT, encryption, logger)
│   │   ├── schemas/        # Zod validation schemas
│   │   └── types/          # TypeScript definitions
│   ├── tests/
│   │   ├── unit/           # Unit tests
│   │   ├── integration/    # Integration tests
│   │   ├── helpers/        # Test utilities
│   │   └── mocks/          # Mock data
│   └── prisma/             # Database schema & migrations
│
├── frontend/          # React SPA (Vite + TypeScript + TailwindCSS)
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   └── layouts/    # Page layouts
│   │   ├── pages/          # Application pages
│   │   ├── stores/         # Zustand stores
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities (API client, mutations)
│   │   └── types/          # TypeScript definitions
│   ├── tests/              # Vitest tests
│   └── public/             # Static assets (fonts, SVG)
│
├── docs/              # Documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ (with npm)
- **PostgreSQL** database (local, [Neon](https://neon.tech), [Supabase](https://supabase.com), etc.)
- **Strava API** credentials ([create an application](https://www.strava.com/settings/api))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/NicolasChambon/TrailFrames.git
cd TrailFrames
```

2. **Install all dependencies**

```bash
npm run install:all
```

3. **Configure environment variables**

**Backend** (`backend/.env`):

```bash
cd backend
cp .env.template .env
```

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/trailframes
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
STRAVA_CLIENT_ID=your-strava-client-id
STRAVA_CLIENT_SECRET=your-strava-client-secret
FRONTEND_DEV_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`):

```bash
cd ../frontend
cp .env.template .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000
VITE_STRAVA_CLIENT_ID=your-strava-client-id
```

4. **Initialize the database**

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### Run in Development

**From the project root**, launch both applications:

```bash
npm run dev
```

This starts:

- 🔵 **Backend** on http://localhost:4000 (blue logs)
- 🟣 **Frontend** on http://localhost:5173 (magenta logs)

**Or run them separately:**

```bash
# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm run dev
```

## 📜 Available Scripts

### Root Directory

| Script                   | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `npm run dev`            | Launch backend + frontend in parallel            |
| `npm run install:all`    | Install dependencies (root + backend + frontend) |
| `npm run lint`           | Run ESLint on backend and frontend               |
| `npm run ts:check`       | TypeScript check on backend and frontend         |
| `npm run ts:check:back`  | TypeScript check on backend only                 |
| `npm run ts:check:front` | TypeScript check on frontend only                |
| `npm run errors:check`   | Full check (TS + ESLint) on both                 |

### Backend (`cd backend`)

| Script                     | Description                      |
| -------------------------- | -------------------------------- |
| `npm run dev`              | Start dev server with nodemon    |
| `npm run build`            | Build for production (esbuild)   |
| `npm start`                | Run production server            |
| `npm run lint`             | Run ESLint                       |
| `npm test`                 | Run test runner (interactive)    |
| `npm run test:unit`        | Run unit tests only              |
| `npm run test:integration` | Run integration tests only       |
| `npx prisma studio`        | Open Prisma Studio (DB GUI)      |
| `npx prisma migrate dev`   | Create and apply a new migration |

### Frontend (`cd frontend`)

| Script             | Description                   |
| ------------------ | ----------------------------- |
| `npm run dev`      | Start Vite dev server         |
| `npm run build`    | Build for production          |
| `npm run preview`  | Preview production build      |
| `npm run lint`     | Run ESLint                    |
| `npm test`         | Run test runner (interactive) |
| `npm run test:all` | Run all tests once            |

## 🛠️ Tech Stack

### Frontend

| Technology   | Version | Purpose                  |
| ------------ | ------- | ------------------------ |
| React        | 19      | UI framework             |
| TypeScript   | 5.7+    | Type safety              |
| Vite         | 7       | Build tool & dev server  |
| TailwindCSS  | 4       | Utility-first CSS        |
| React Router | 7       | Client-side routing      |
| Zustand      | 5       | State management         |
| SWR          | 2       | Data fetching & caching  |
| Axios        | 1       | HTTP client              |
| shadcn/ui    | -       | UI components (Radix UI) |
| Lucide React | -       | Icon library             |
| Sonner       | -       | Toast notifications      |
| Vitest       | 2       | Testing framework        |

### Backend

| Technology         | Version | Purpose                    |
| ------------------ | ------- | -------------------------- |
| Node.js            | 18+     | Runtime environment        |
| Express            | 5       | Web framework              |
| TypeScript         | 5.7+    | Type safety                |
| Prisma             | 6       | ORM & database toolkit     |
| PostgreSQL         | -       | Relational database        |
| Zod                | 3       | Schema validation          |
| Helmet             | 8       | Security middleware        |
| Winston            | 3       | Logging                    |
| Argon2             | 0.41+   | Password hashing           |
| JWT (jsonwebtoken) | 9       | Token-based authentication |
| esbuild            | 0.24+   | Build tool                 |
| Vitest             | 2       | Testing framework          |

## 🔐 Authentication & Security

### Authentication Flow

1. **User Registration**: Email/password with Argon2 hashing
2. **OAuth Strava**: Optional Strava account linking
3. **JWT Tokens**:
   - Access token (15 min) in httpOnly cookie
   - Refresh token (7 days) in httpOnly cookie
4. **Protected Routes**: Middleware authentication on sensitive endpoints

### Security Features

- ✅ **CSRF Protection**: Token validation on all mutating requests
- ✅ **Rate Limiting**: Prevent abuse and brute-force attacks
- ✅ **Helmet.js**: Security headers (CSP, XSS protection, etc.)
- ✅ **CORS**: Configured allowed origins
- ✅ **Input Validation**: Zod schemas for all user inputs
- ✅ **SQL Injection Protection**: Prisma ORM parameterized queries
- ✅ **Password Security**: Argon2 hashing

## 🗄️ Database

### Prisma Models

- **User**: Application users (email, stravaAthleteId, timestamps)
- **StravaData**: Complete Strava athlete data
- **Activity**: Sports activities (Run, Ride, Hike, etc.)
- **RefreshToken**: JWT refresh tokens
- **StravaToken**: Strava API access tokens

### Common Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Check migration status
npx prisma migrate status

# Reset database (dev only!)
npx prisma migrate reset

# Open Prisma Studio (DB GUI)
npx prisma studio
```

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Interactive test runner
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration
```

**Test Structure:**

- `tests/unit/`: Unit tests for utilities (JWT, encryption, etc.)
- `tests/integration/`: API endpoint tests
- `tests/helpers/`: Test utilities (testDb, testServer, testRegisterUser)
- `tests/mocks/`: Mock data for Strava API

### Frontend Tests

```bash
cd frontend

# Interactive test runner
npm test

# Run all tests once
npm run test:all
```

**Testing Tools:**

- Vitest for test runner
- Testing Library for React components
- Axios Mock Adapter for API mocking

## 🌐 API Documentation

### Authentication Endpoints

```
POST /api/auth/register           → Create account
POST /api/auth/login              → Login with email/password
POST /api/auth/logout             → Logout
POST /api/auth/refresh            → Refresh access token
GET  /api/auth/me                 → Get current user
GET  /api/auth/strava/url         → Get Strava OAuth URL
POST /api/auth/strava/callback    → Strava OAuth callback
```

### Activities Endpoints

```
GET  /api/activities              → List user activities
GET  /api/activities/:id          → Get activity details
POST /api/activities/sync         → Sync with Strava
```

## 📚 Documentation

- **User Flow**: See [docs/user-introduction-sequence-diagram.mermaid](docs/user-introduction-sequence-diagram.mermaid)
- **Copilot Instructions**: [.github/copilot-instructions.md](.github/copilot-instructions.md)

## 🐛 Debugging

### Backend Debugging

- **Logs**: Winston logs in `backend/logs/` (error.log, combined.log)
- **Database**: Use `npx prisma studio` to inspect data
- **Environment**: Set `NODE_ENV=development` for detailed logs

### Frontend Debugging

- **React DevTools**: Browser extension for component inspection
- **Network Tab**: Monitor API requests in browser DevTools
- **Console**: Check for errors and warnings

## 🚧 Development Best Practices

### Code Style

- **Strict TypeScript**: All types explicitly defined
- **ESLint**: Strict linting enforced (`--max-warnings 0`)
- **Module System**: ES modules (import/export), no CommonJS
- **Naming**: camelCase for variables/functions, PascalCase for classes/components
- **Error Handling**: Try/catch with proper logging
- **Validation**: Zod schemas for all inputs

### Git Workflow

- **Branch**: Feature branches from `dev`
- **Commits**: Clear and descriptive commit messages
- **PR**: Pull requests for code review before merging

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the coding conventions
4. Run tests and linting (`npm run errors:check`)
5. Commit your changes
6. Push to your branch
7. Open a Pull Request

## 📝 License

ISC

---

**Built with ❤️ for adventure and sports data enthusiasts**
