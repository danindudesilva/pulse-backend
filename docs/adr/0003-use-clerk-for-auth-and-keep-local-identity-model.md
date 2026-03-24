# ADR 0003: Use Clerk for authentication and keep a local identity/workspace model

## Status

Accepted

## Context

QuoteFollow needs authenticated API access for protected product routes. The backend also maintains its own local user, workspace, and workspace membership model for tenancy and business rules.

## Decision

We will use Clerk as the authentication provider and keep a separate local identity/workspace model in the backend.

## Why this decision

- Authentication is not the core differentiator of the product.
- Clerk reduces the amount of auth/session/security work we need to build and maintain ourselves.
- The backend still needs a local user and workspace model because product behavior depends on tenancy and business-specific relationships.
- This lets us move quickly on the MVP while keeping product identity and tenancy under our control.

## Alternatives considered

### 1. Build custom auth in-house

Rejected for MVP.

- More engineering effort
- More security responsibility
- Slower path to product value

### 2. Use Clerk as the only user model and avoid local user/workspace records

Rejected.

- Product logic depends on local tenancy boundaries
- Workspace membership and domain behavior should remain in our backend
- Tighter coupling to provider-specific identity structures

### 3. Use another auth provider (for example Auth.js / Supabase Auth)

Considered, but not chosen.

- Similar benefits exist across providers
- Clerk was chosen as the current implementation path for speed and product fit
- This decision can be revisited later if requirements change

## Consequences

### Positive

- Faster MVP delivery
- Less auth/session/security surface area to build ourselves
- Local tenancy and business rules remain explicit in our backend

### Negative

- We depend on an external auth provider
- We need a bootstrap/sync flow between Clerk identity and local user records
- Backend must resolve Clerk user IDs into local auth context
