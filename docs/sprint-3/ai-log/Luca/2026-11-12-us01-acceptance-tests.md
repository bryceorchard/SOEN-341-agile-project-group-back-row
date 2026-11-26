# AI Interaction Log

**Author:** Luca
**Date:** 2026-11-12
**AI Tool:** Claude (Cowork)

## Task / Prompt
Summary: Pasted the US-01 acceptance-test issue (#88) and asked for automated tests citing each AT.

## Purpose of AI Use
Testing (test design and generation)

## Context / Findings
- #88: Register and manage profile. Task: add a test per AT where practical and cite its name in the issue (#103 / #155).
- Rule from review: new files only and the test count must only go up.

## AI Output / Actions
- Tests for AT-3 to AT-6: registering as either role, validation for an invalid email or a short password, saving and reloading the profile, and logout.
- The first version replaced two existing team spec files. The reviewer asked me to restore them and put my tests in a separate file so the test count only goes up. I fixed this on `lucamancini2005-design-patch-1`.
- Wrote the commit summary, PR title and PR description (team template), plus the citation lines for the issue.

## Validation
- Ran the full backend and frontend suites locally; all passed, and the count went up.
- Opened a PR from a `luca-...` branch off an up-to-date main; CI ran on it.
- The manual demo of each AT in the running app is done separately before ticking the boxes.

## Decision
Accepted after changes requested in review.

## Reflection
Prefixing test names with the AT number made it easy to cite them in the issue.

Files: `frontend/CareerConnect/src/app/us01-acceptance.spec.ts` (6), `logout.spec.ts` (2)
