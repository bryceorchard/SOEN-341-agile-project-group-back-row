# AI Interaction Log

**Author:** Luca
**Date:** 2026-11-16
**AI Tool:** Claude (Cowork)

## Task / Prompt
Summary: Pasted the US-22 acceptance-test issue (#146) and asked for automated tests citing each AT.

## Purpose of AI Use
Testing (test design and generation)

## Context / Findings
- #146: Recruiter notifications. Task: add a test per AT where practical and cite its name in the issue (#103 / #155).
- Rule from review: new files only and the test count must only go up.

## AI Output / Actions
- Tests for AT-1 to AT-3: the new-application notification and its link, exactly one "closing soon" reminder, and the empty state.
- Wrote the commit summary, PR title and PR description (team template), plus the citation lines for the issue.

## Validation
- Ran the full backend and frontend suites locally; all passed, and the count went up.
- Opened a PR from a `luca-...` branch off an up-to-date main; CI ran on it.
- The manual demo of each AT in the running app is done separately before ticking the boxes.

## Decision
Accepted.

## Reflection
Prefixing test names with the AT number made it easy to cite them in the issue.

Files: `us22-acceptance.spec.ts` (3), `us22-acceptance.test.js` (3)
