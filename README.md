# EthioFund

EthioFund is a modern full-stack crowdfunding platform built to empower individuals, communities, startups, charities, and organizations across Ethiopia to raise funds, support impactful causes, and connect with donors through a secure and transparent digital ecosystem. Developed using React, TypeScript, Express.js, and PostgreSQL, the platform provides a scalable and responsive user experience with robust backend services, role-based authentication, campaign management, donation tracking, real-time updates, and administrative controls. EthioFund aims to bridge the gap between project creators and supporters by offering an accessible, reliable, and technology-driven solution that promotes financial inclusion, social impact, innovation, and community-driven fundraising throughout Ethiopia.

This repository is set up as a zero-setup, one-command full stack workflow with Docker, while still keeping a local non-Docker path for developers who want it.

## Quick Start

### Option 1: Zero-setup Docker workflow

This is the recommended path for teams and new contributors. It is the default zero-setup, one-command full stack setup.

```bash
git clone https://github.com/Ashenafi-Bancha/EthioFund
cd ethiofund
docker compose up
```

That starts:

- PostgreSQL with persistent storage
- Backend API with automatic database wait, migration, and seed bootstrap
- Frontend dev server with hot reload
- pgAdmin for visual database access

Open these URLs after startup:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Backend health check: http://localhost:5000/health
- pgAdmin: http://localhost:8080
- PostgreSQL: localhost:5432

If you want to rebuild images after code changes, use:

```bash
docker compose up --build
```

### Option 2: Run locally without Docker

Use this if you want to work directly on your machine.

Prerequisites:

- Node.js 20+
- pnpm
- PostgreSQL 18 or compatible
- Git

Clone the repository and install dependencies:

```bash
git clone https://github.com/Ashenafi-Bancha/EthioFund
cd ethiofund/backend
pnpm install
cd ../frontend
pnpm install
```

Set up environment files:

```bash
copy ..\.env.example ..\.env
copy .env.example .env
```

If you are using PowerShell, you can also run:

```powershell
Copy-Item ..\.env.example ..\.env
Copy-Item .env.example .env
```

Create the database if it does not already exist:

```bash
createdb -U postgres ethiofund_db
```

If you prefer `psql`, you can use:

```bash
psql -U postgres
CREATE DATABASE ethiofund_db;
\q
```

Then run the backend bootstrap steps manually:

```bash
cd backend
pnpm db:migrate
pnpm db:seed
pnpm dev
```

In a second terminal:

```bash
cd frontend
pnpm dev
```

Local URLs:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Backend health check: http://localhost:5000/health

## What starts automatically in Docker

- Frontend dev server with hot reload
- Backend API with hot reload
- PostgreSQL with persistent Docker volume
- Database readiness check before backend start
- Schema creation
- Demo data seeding
- pgAdmin with default login
- Backend health endpoint

## Health Endpoint

The backend exposes `GET /health` and returns:

```json
{
  "status": "OK",
  "database": "Connected"
}
```

`GET /api/health` is also kept for compatibility.

## Demo Data

The bootstrap seed creates sample users, campaigns, donations, comments, milestones, and admin data so the UI is usable immediately after startup.

Demo accounts:

- Admin: `admin@ethiofund.com` / `Admin@123`
- Organizer: `organizer@ethiofund.com` / `Organizer@123`
- Donor 1: `donor1@ethiofund.com` / `Donor@123`
- Donor 2: `donor2@ethiofund.com` / `Donor@123`

## pgAdmin

Default login:

- Email: `admin@ethiofund.local`
- Password: `pgadmin123`

The pgAdmin connection is preconfigured to point at the Docker PostgreSQL service named `db`.

## Environment Files

- `.env.example` at the repo root contains Docker-friendly defaults.
- `backend/.env.example` contains host-development defaults for the API.
- `frontend/.env.example` contains the frontend API URL example.

For Docker, the defaults are intentionally safe and beginner-friendly. The stack runs in mock payment mode by default so it does not require real Chapa credentials just to boot.

## Project Structure

```text
ethiofund/
├── backend/
│   ├── Dockerfile
│   ├── Dockerfile.dockerignore
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── tsconfig.json
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── config/
│       │   ├── db.ts
│       │   └── env.ts
│       ├── middleware/
│       │   ├── activityLogger.ts
│       │   ├── auth.ts
│       │   ├── authorize.ts
│       │   └── errorHandler.ts
│       ├── modules/
│       │   ├── admin/
│       │   ├── auth/
│       │   ├── campaigns/
│       │   ├── comments/
│       │   ├── contact/
│       │   ├── donations/
│       │   ├── payments/
│       │   ├── reports/
│       │   ├── users/
│       │   └── withdrawals/
│       ├── scripts/
│       │   ├── bootstrap.ts
│       │   ├── migrate.ts
│       │   ├── seed.ts
│       │   └── start.ts
│       ├── types/
│       │   └── express.d.ts
│       └── uploads/
├── frontend/
│   ├── Dockerfile
│   ├── Dockerfile.dockerignore
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── pnpm-workspace.yaml
│   ├── postcss.config.mjs
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── app/
│       │   ├── App.tsx
│       │   ├── components/
│       │   ├── context/
│       │   ├── data/
│       │   ├── hooks/
│       │   ├── lib/
│       │   ├── types/
│       │   └── styles/
│       └── assets/
├── docker/
│   └── pgadmin-servers.json
├── docker-compose.yml
├── api-tests.http
├── README.md
└── .env.example
```

## Key Features

- JWT authentication with role-based access control
- Donor, organizer, and admin flows
- Campaign creation, moderation, and verification
- Donation tracking and payment integration
- Activity logging and reporting
- Comment moderation
- Campaign updates and withdrawal management
- PostgreSQL-backed persistence

## Docker Notes

- The backend waits for PostgreSQL before bootstrapping.
- Schema and seed data are applied automatically.
- PostgreSQL data is stored in a named Docker volume.
- Frontend and backend both run with hot reload in the Docker setup.
- The frontend binds to `0.0.0.0` so it is reachable from the host browser.

## Troubleshooting

- If a port is already in use, stop the conflicting process or change the published port in `docker-compose.yml`.
- If you want a completely fresh database, run `docker compose down -v` and then `docker compose up` again.
- If the backend is still starting, check `docker compose logs -f backend` and `docker compose logs -f db`.
- If pgAdmin opens but cannot reach PostgreSQL, confirm the server host is `db`, not `localhost`.
- On Windows, Docker Desktop file sharing must allow the repository folder so bind mounts work correctly.
- If hot reload feels slow on Docker Desktop, restart the stack once after the first successful install so the mounted `node_modules` volume is populated.

## Notes

- The backend keeps `/api/health` for compatibility.
- The Docker workflow is designed to behave consistently on Windows, Linux, and macOS.
- The local workflow remains available for contributors who want to run the frontend and backend directly on their machine.
