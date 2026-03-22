# Opportunity domain

## Purpose

An opportunity represents a quote or proposal being tracked inside a workspace.

## Initial creation rules

An opportunity may only be created with status:

- `draft`
- `sent`

If status is `sent`, `quoteSentAt` is required.

## Notes

For now, `workspaceId` and `createdByUserId` are accepted via API input as a temporary development seam. Once authenticated request context is added, these values should be derived server-side.
