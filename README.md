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

## Test prerequisites

Integration tests require Docker to be running locally.

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

## Testing

The backend uses two testing layers:

- **unit and route tests** for fast feedback without a real database
- **integration tests** for Prisma repositories against a real PostgreSQL instance

Protected write APIs derive actor and workspace context server-side from authenticated Clerk requests. Client-supplied tenant and actor identifiers are intentionally not accepted for these routes.

### Unit and route tests

Run the default test suite with:

```bash
npm test
```

Integration tests

Integration tests run against a dedicated PostgreSQL test database.

1. Create the test env file

```bash
   cp .env.test.example .env.test
```

2. Start the test database

```bash
   npm run db:test:up:ci
```

This starts a PostgreSQL container on port 5433.

3. Apply migrations to the test database

```bash
   npm run prisma:migrate:test
```

4. Run the integration test suite

```bash
   npm run test:integration
```

### Common test database commands

Start the test database:

```bash
npm run db:test:up:ci
```

## Opportunity list and status APIs

Protected opportunity APIs derive workspace and actor context server-side from authenticated request context.

### List opportunities

```http
GET /api/opportunities
GET /api/opportunities?view=due
GET /api/opportunities?view=upcoming
GET /api/opportunities?status=sent
```

Supported view values:

- all
- due
- upcoming

Get one opportunity

```http
GET /api/opportunities/:opportunityId
```

Update opportunity status

```http
PATCH /api/opportunities/:opportunityId/status
```

Example request body:

```json
{
  "status": "replied"
}
```

If setting status to sent, quoteSentAt is required:

```json
{
  "status": "sent",
  "quoteSentAt": "2026-03-24T10:00:00.000Z"
}
```

## Edit opportunity

Protected opportunity updates are scoped to the authenticated workspace.

### Endpoint

```http
PATCH /api/opportunities/:opportunityId
```

#### Editable fields

- title
- companyName
- contactName
- contactEmail
- valueAmount
- currency
- notes

#### Not editable through this endpoint

- workspaceId
- createdByUserId
- status
- quoteSentAt

Status changes must use:

```http
PATCH /api/opportunities/:opportunityId/status
```

#### Clearing optional fields

To clear optional fields, send null.

Example:

```json
{
  "companyName": null,
  "contactName": null,
  "contactEmail": null,
  "valueAmount": null,
  "currency": null,
  "notes": null
}
```

Creating an opportunity also generates the default follow-up schedule atomically. If follow-up generation fails, the opportunity creation is rolled back and no partial data is persisted.

## Known Limitations & Future Improvements

### Membership Integrity

- **Current state (MVP)**:
  - The service layer enforces that a user creating an opportunity must belong to the workspace.
  - Integration tests verify this behavior.
  - No composite foreign key exists in the database yet.

- **Future improvement**:
  - Add a raw SQL migration to enforce a composite foreign key `(workspaceId, userId)` in the `Opportunity` table referencing `WorkspaceMember`.
  - This will guarantee integrity even if someone bypasses the application layer or runs raw SQL queries.

This ensures the backend is robust and maintains data integrity even beyond MVP usage.
