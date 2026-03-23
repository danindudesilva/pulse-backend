# ADR 0003: Use Clerk for authentication and keep a local identity/workspace model

## Status

Accepted

## Context

QuoteFollow needs authenticated API access but also maintains its own local user, workspace, and workspace membership data for tenancy and product behavior.

## Decision

We will use Clerk for authentication and continue to maintain a local user/workspace model in the backend.

## Rationale

- Clerk handles authentication and session management
- local product identity remains the source of truth for tenancy and business rules
- backend modules can stay aligned with local domain concepts
- future product behavior should not depend directly on external auth provider data structures

## Consequences

### Positive

- clear separation between authentication and product identity
- local control over tenancy and business data
- easier modular backend design

### Negative

- bootstrap/sync flow is required between Clerk identity and local user records
- backend must resolve Clerk user IDs to local auth context
