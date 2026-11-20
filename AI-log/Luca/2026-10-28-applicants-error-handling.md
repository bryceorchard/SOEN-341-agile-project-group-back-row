# AI Interaction Log

**Author:** Luca
**Date:** 2026-10-28
**AI Tool:** Claude (Cowork)

## Task / Prompt
Summary: Asked for help finishing my PR #112 follow-up for the recruiter applicants view (#87): handle failed requests and add tests.

## Purpose of AI Use
Implementation and testing

## Context / Findings
- The applicants page and profile page did not show anything useful when a request failed.
- Bryce's review of PR #112 listed the follow-ups for #87.

## AI Output / Actions
- Added error messages for failed loads and status updates on the applicants and profile pages.
- Added `open-blob.ts` to open resume files in a new tab.
- Added unit tests in `posting-applicants.component.spec.ts`.

## Validation
- Ran the frontend tests locally; all passed.
- Pushed to the PR #112 branch; CI passed.

## Decision
Accepted.

## Reflection
Testing the failure paths showed the errors were being swallowed silently before.

Files: `open-blob.ts`, `posting-applicants.component.*`, `profile.component.*`
