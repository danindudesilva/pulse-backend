# Pulse Backend

Backend service for Pulse, a modular-monolith micro-SaaS that helps freelancers and small service businesses track quotes and follow up at the right time.

## Tech stack

- Node.js
- TypeScript
- Express
- Postgres
- Prisma
- Vitest

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

## Scripts

```
npm run dev
npm run build
npm run start
npm run test
npm run lint
npm run format
npm run check
```

## Architecture

This service is implemented as a modular monolith.

See docs/adr for architecture decisions.

## Local database setup

QuoteFollow backend uses PostgreSQL with Prisma.

### 1. Start PostgreSQL

You can use a local installation or Docker.

Example with Docker:

```bash
docker run --name pulse-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pulse_backend \
  -p 5432:5432 \
  -d postgres:16
```

### 2. Configure environment

Copy .env.example to .env and update DATABASE_URL if needed.

### 3. Run migrations

```bash
npm run prisma:migrate:dev
```

### 4. Start the app

```bash
npm run dev
```
