# Backend application patterns

## Goals

The backend should remain modular, testable, and explicit as the product grows.

## Rules

- Validate requests at the edge using Zod
- Keep route handlers thin
- Put business logic in application services
- Use shared application errors for predictable API responses
- Use centralized error middleware
- Keep infrastructure concerns under `src/lib`
- Organize product code by module under `src/modules`

## Notes

These conventions are intended to keep the modular monolith maintainable as new modules are added.
