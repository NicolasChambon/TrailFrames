# TrailFrames 🏃🏻‍♀️🏞️

Web application to visualize and manage your Strava activities with custom features.

## 🏗️ Architecture

This project is organized as a **monorepo** with two main applications:

- **`frontend/`**: React + Vite application with TypeScript and TailwindCSS
- **`backend/`**: Node.js REST API with Express, TypeScript and Prisma

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+)
- **PostgreSQL database** (local PostgreSQL, [Neon](https://neon.tech), [Supabase](https://supabase.com), or any PostgreSQL-compatible service)
- A Strava account and Strava API application ([create an application](https://www.strava.com/settings/api))

### Complete Installation

1. **Clone the repository**

```bash
git clone https://github.com/NicolasChambon/TrailFrames.git
cd TrailFrames
```

2. **Install all dependencies** (root, backend and frontend)

```bash
npm run install:all
```

3. **Configure the backend**

```bash
cd backend
cp .env.template .env
# Edit .env with your values (DATABASE_URL, STRAVA_CLIENT_ID, etc.)
```

4. **Initialize the database**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. **Configure the frontend**

```bash
cd ../frontend
cp .env.template .env
# Edit .env with your values (VITE_API_URL, etc.)
```

### Run the application

**From the project root**, you can launch both frontend and backend simultaneously:

```bash
npm run dev
```

This command starts:

- 🔵 **Backend** on `http://localhost:3000` (blue logs)
- 🟣 **Frontend** on `http://localhost:5173` (magenta logs)

## 📜 Available Scripts

At the **root** of the project:

| Script                | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `npm run dev`         | Launches backend and frontend in parallel            |
| `npm run install:all` | Installs dependencies for root, backend and frontend |
| `npm run lint`        | Runs linting on backend and frontend                 |

In the **backend** (`cd backend`):

| Script          | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Launches development server with nodemon |
| `npm run build` | Builds backend for production            |
| `npm start`     | Runs production server                   |
| `npm run lint`  | Runs ESLint                              |

In the **frontend** (`cd frontend`):

| Script            | Description                      |
| ----------------- | -------------------------------- |
| `npm run dev`     | Launches Vite development server |
| `npm run build`   | Builds frontend for production   |
| `npm run preview` | Previews production build        |
| `npm run lint`    | Runs ESLint                      |

## 🛠️ Tech Stack

### Frontend

- **React** 19
- **TypeScript**
- **Vite** 7
- **TailwindCSS** 4
- **React Router** 7
- **Radix UI** (accessible components)
- **Axios** (HTTP requests)
- **SWR** (data fetching)

### Backend

- **Node.js**
- **Express** 5
- **TypeScript**
- **Prisma** (ORM)
- **PostgreSQL**
- **Zod** (schema validation)

## 📁 Project Structure

```
TrailFrames/
├── backend/             # Node.js + Express API
│   ├── src/             # Source code
│   ├── prisma/          # Prisma schema and migrations
│   └── package.json
├── frontend/            # React application
│   ├── src/             # Source code
│   ├── public/          # Static files
│   └── package.json
├── docs/                # Documentation
├── package.json         # Monorepo configuration
└── README.md
```

## 📝 License

ISC

---

**Built with ❤️ for adventure and sports data enthusiasts**
