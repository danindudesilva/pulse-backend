# ADR 0001: Use a modular monolith for the initial backend

## Status
Accepted

## Context
QuoteFollow is an MVP micro-SaaS intended to reach market quickly while remaining maintainable and production-minded. The product scope is narrow and does not justify the complexity of microservices at this stage.

## Decision
We will implement the backend as a modular monolith in a single deployable service.

The codebase will be organized by business capability modules rather than technical layers alone. Each module may contain domain, application, infrastructure, and API concerns with clear boundaries.

## Consequences
### Positive
- Faster development velocity
- Simpler local development and deployment
- Easier transactional consistency
- Lower infrastructure and operational complexity
- Clear upgrade path to service extraction later if needed

### Negative
- Requires discipline to preserve module boundaries
- Some scaling concerns may emerge later if one module becomes disproportionately heavy

## Notes
The initial architecture should optimize for product learning, speed, and maintainability rather than early distributed-system complexity.
