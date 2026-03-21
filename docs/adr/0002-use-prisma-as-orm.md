# ADR 0002: Use Prisma as the ORM for the initial backend

## Status

Accepted

## Context

QuoteFollow needs a maintainable and productive way to model relational data, manage migrations, and interact with PostgreSQL during the MVP phase.

## Decision

We will use Prisma as the ORM and migration tool for the backend.

## Rationale

- Fast development for CRUD-heavy SaaS workflows
- Clear schema definition and migration flow
- Good TypeScript integration
- Readable for a small product team
- Suitable for a modular monolith MVP

## Consequences

### Positive

- Faster feature delivery
- Type-safe database access
- Simple migration workflow
- Clear schema source of truth

### Negative

- Less direct SQL control than lower-level tools
- Some advanced query patterns may need raw SQL later

## Notes

If future requirements demand closer-to-SQL ergonomics or highly specialized queries, targeted raw SQL can be introduced without abandoning Prisma entirely.
