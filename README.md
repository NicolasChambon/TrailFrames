# TrailFrames

Application to visualize and manage your Strava activities with custom features.

## 🏗️ Architecture

This project is organized as a monorepo with two main applications:

- **Frontend**: React + Vite application with TypeScript and TailwindCSS
- **Backend**: Node.js REST API with Express, TypeScript, and Prisma

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- A Strava account and Strava API application ([create an application](https://www.strava.com/settings/api))

### Installation

1. Clone the repository

```bash
git clone https://github.com/NicolasChambon/TrailFrames.git
cd TrailFrames
```

2. Install backend dependencies

```bash
cd backend
npm install
```

3. Configure backend environment variables

```bash
# Create a .env.development.local file
cp .env.development .env.development.local
# Edit the file with your values
```

4. Setup the database

```bash
npx prisma migrate dev --name init
```

you can name your first migration "init"

```bash
npx prisma generate
```

5. Install frontend dependencies

```bash
cd ../frontend
npm install
```

6. Configure frontend environment variables

```bash
# Create a .env.development.local file
cp .env.development .env.development.local
# Edit the file with your values
```

### Running the application

**Backend** (in the `backend/` folder):

```bash
npm run dev
```

**Frontend** (in the `frontend/` folder):

```bash
npm run dev
```

## 🛠️ Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- TailwindCSS 4
- React Router
- Radix UI
- Axios
- SWR

### Backend

- Node.js
- Express 5
- TypeScript
- Prisma (ORM)
- PostgreSQL
- Zod (validation)

## 📝 License

ISC
