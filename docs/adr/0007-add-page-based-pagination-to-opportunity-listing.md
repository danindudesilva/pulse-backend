# ADR 0007: Add page-based pagination to opportunity listing

## Status

Accepted

## Context

The opportunity listing endpoint currently returns all matching records. As product usage grows, this becomes inefficient and makes the frontend harder to build.

The frontend needs list pagination and metadata for rendering page controls.

## Decision

We will add page-based pagination to `GET /api/opportunities` using:

- `page`
- `pageSize`

The endpoint will also continue supporting existing filters:

- `view`
- `status`

The response will return:

- `items`
- `pagination`

## Pagination rules

- default `page` is `1`
- default `pageSize` is `10`
- maximum `pageSize` is `50`

## Why this decision

- simple to implement and debug
- works well for the current product stage
- easy for the frontend to consume
- avoids returning unbounded result sets

## Alternatives considered

### 1. Cursor pagination

Rejected for now.

- better for larger datasets and dynamic ordering
- more complexity than needed for the current product stage

### 2. Returning all opportunities and paginating client-side

Rejected.

- inefficient
- poor UX and performance as data grows
- unnecessary data transfer

## Consequences

### Positive

- predictable API response size
- easier frontend pagination UI
- backend controls result size

### Negative

- page-based pagination can shift slightly as new records are inserted
- future migration to cursor pagination may still be desirable
