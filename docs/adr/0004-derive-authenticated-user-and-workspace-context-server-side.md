# ADR 0004: Derive authenticated user and workspace context server-side

## Status

Accepted

## Context

Earlier MVP routes accepted identifiers such as `workspaceId` and `createdByUserId` directly from clients. This created a trust gap at the API boundary.

## Decision

Protected write APIs will derive local `userId` and `workspaceId` server-side from authenticated request context instead of accepting them in request bodies.

## Rationale

- clients should not control actor or tenant identity for protected writes
- the backend already maintains local user and workspace membership models
- server-derived context reduces the chance of tenant-boundary mistakes

## Notes

Bootstrap is a special case:

- it requires Clerk-authenticated requests
- it establishes local user/workspace state
- it cannot depend on preexisting local auth context

## Consequences

### Positive

- safer API boundary
- consistent actor and tenant derivation
- cleaner product route contracts

### Negative

- local auth-context resolution middleware is required
- multi-workspace selection remains a future concern
