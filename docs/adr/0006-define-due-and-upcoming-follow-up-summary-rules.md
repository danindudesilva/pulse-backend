# ADR 0006: Define due and upcoming follow-up summary rules

## Status

Accepted

## Context

The dashboard needs simple urgency buckets for follow-ups, but the product does not yet define richer lifecycle concepts such as stale, ignored, or archived reminders.

## Decision

We define:

- `due` as pending follow-ups with `dueAt <= now`
- `upcoming` as pending follow-ups with `dueAt > now`

Only pending follow-ups are included in these counts.

## Why this decision

- aligns with the current reminder model
- provides useful urgency information without overcomplicating the MVP
- matches the existing semantics already used in opportunity views

## Alternatives considered

### 1. Add a `stale` bucket now

Rejected for now.

- stale is not yet sharply defined
- risks introducing inconsistent product semantics

### 2. Count all follow-ups regardless of status

Rejected.

- would inflate dashboard counts
- would not reflect actionable reminder state

## Consequences

### Positive

- clear and consistent summary semantics
- actionable dashboard numbers

### Negative

- does not yet capture richer reminder lifecycle concepts such as stale or skipped follow-ups
