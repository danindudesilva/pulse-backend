# Identity bootstrap flow

## Purpose

The backend maintains a local user and workspace model even though authentication is handled by Clerk.

## MVP behavior

When a user is seen for the first time:

- create or update the local user record using Clerk identity fields
- create a default workspace if the user has no existing workspace membership
- create an owner membership linking the user to the workspace

On later calls:

- return the existing workspace membership instead of creating a new workspace

## Why

This establishes tenancy boundaries before product modules such as opportunities and follow-ups are introduced.

## Notes

This flow is intentionally separate from Clerk verification for now. Authentication wiring will be added later, while this bootstrap service remains reusable and testable.
