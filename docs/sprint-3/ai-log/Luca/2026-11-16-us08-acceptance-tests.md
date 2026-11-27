# AI Interaction Log

**Author:** Luca
**Date:** 2026-11-16
**AI Tool:** Claude (Cowork)

## Task / Prompt
Summary: Pasted the US-08 acceptance-test issue (#94) and asked for automated tests citing each AT.

## Purpose of AI Use
Testing (test design and generation)

## Context / Findings
- #94: Recruiter creates and manages postings. Task: add a test per AT where practical and cite its name in the issue (#103 / #155).
- Rule from review: new files only and the test count must only go up.

## AI Output / Actions
- Tests for AT-1 to AT-4: creating, editing and closing postings, the role check, and ownership checks.
- Wrote the commit summary, PR title and PR description (team template), plus the citation lines for the issue.

## Validation
- Ran the full backend and frontend suites locally; all passed, and the count went up.
- Opened a PR from a `luca-...` branch off an up-to-date main; CI ran on it.
- The manual demo of each AT in the running app is done separately before ticking the boxes.

## Decision
Accepted.

## Reflection
Prefixing test names with the AT number made it easy to cite them in the issue.

Files: `us08-acceptance.spec.ts` (3), `us08-acceptance.test.js` (4)
