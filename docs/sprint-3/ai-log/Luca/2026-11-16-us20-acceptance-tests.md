# AI Interaction Log

**Author:** Luca
**Date:** 2026-11-16
**AI Tool:** Claude (Cowork)

## Task / Prompt
Summary: Pasted the US-20 acceptance-test issue (#91) and asked for automated tests citing each AT.

## Purpose of AI Use
Testing (test design and generation)

## Context / Findings
- #91: View job details. Task: add a test per AT where practical and cite its name in the issue (#103 / #155).
- Rule from review: new files only and the test count must only go up.

## AI Output / Actions
- Tests for AT-1 to AT-3: full details, the back link keeping the search, 404 for a missing job, and who sees the apply form.
- Flagged in the PR: the link text says "Back to search" but the AT says "Back to results", and POST /applications does not check the job_seeker role.
- Wrote the commit summary, PR title and PR description (team template), plus the citation lines for the issue.

## Validation
- Ran the full backend and frontend suites locally; all passed, and the count went up.
- Opened a PR from a `luca-...` branch off an up-to-date main; CI ran on it.
- The manual demo of each AT in the running app is done separately before ticking the boxes.

## Decision
Accepted.

## Reflection
Prefixing test names with the AT number made it easy to cite them in the issue.

Files: `us20-acceptance.spec.ts` (5), `us20-acceptance.test.js` (3)
