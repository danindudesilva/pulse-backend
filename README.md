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