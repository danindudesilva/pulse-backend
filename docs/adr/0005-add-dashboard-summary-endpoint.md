# ADR 0005: Add a server-computed workspace-scoped dashboard summary endpoint

## Status

Accepted

## Context

The frontend needs a compact summary view for the authenticated workspace, including top-level opportunity counts and follow-up urgency counts.

Without a dedicated endpoint, the frontend would need to orchestrate multiple API calls and compute dashboard values client-side.

## Decision

We will add a protected backend endpoint at `GET /api/dashboard/summary` that returns:

- total opportunities
- counts by opportunity status
- due follow-up count
- upcoming follow-up count

The response will always include all opportunity status buckets, even when zero.

## Why this decision

- keeps dashboard aggregation logic on the server
- reduces frontend complexity
- provides a stable response shape
- avoids client-side stitching and counting

## Alternatives considered

### 1. Let the frontend derive summary counts from list endpoints

Rejected.

- requires extra requests
- wastes bandwidth
- duplicates aggregation logic in the client

### 2. Return only non-zero status buckets

Rejected.

- makes the response shape unstable
- complicates frontend rendering logic

### 3. Add richer metrics immediately (for example values, conversion rates, trends)

Rejected for now.

- unnecessary for the current MVP
- increases scope and implementation complexity

## Consequences

### Positive

- simpler frontend dashboard implementation
- stable response shape
- server remains the source of truth for product summaries

### Negative

- additional backend aggregation queries
- future summary expansion will require careful scope control
