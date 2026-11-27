# AI Interaction Log

**Author:** Bryce
**Date:** 2026-11-19
**AI Tool:** Claude (Cowork)
**chat url:** <https://claude.ai/code/session_01FY2WCRZ21mzzZBK8RPuNgM>

## Task / Prompt
"Can you implement issue #140 please?" #140 is the frontend task for US-10 AI resume
feedback (#47): "Get AI feedback" per resume with a privacy notice, loading/error/Regenerate
states, structured feedback display, and reopening saved feedback with
`GET /resumes/:id/feedback`.

## Context / Findings
- #140 was still open, but PR #193 (Gabriel, with a fix commit from Mahmoud) had already been
  squash-merged at 18:12 UTC on 2026-11-19. Its PR body left `Closes #` blank, so the issue
  didn't close.
- Checked the merged code against #140 and the "UI (#140)" section of
  `docs/ai/us10-resume-feedback.md`. Done in #193: notice, loading state, Regenerate, GET on
  open, summary/strengths/rewordings. Still missing or wrong:
  - Improvements were a flat list. The doc asks for groups by section (in order of first
    appearance), a priority badge, and the `excerpt` quoted above the issue.
  - `[placeholders]` in rewordings weren't highlighted or explained.
  - `isResume: false` still rendered the empty lists; the doc says summary only.
  - After a failed first generation there was no retry button (Mahmoud's non-blocking note on
    #193). After a failed GET, the panel offered a new AI request even though saved feedback
    might exist.
  - `PUT /resumes/:id` deletes the resume's feedback on the backend, but the frontend cache
    kept showing it.
  - Opening resume B while resume A's request was still running showed A's reply in B's panel.
  - `createdAt` is SQLite UTC without a zone ("2026-11-19 18:12:00"). The date pipe read it as
    local time, 5 hours off in Montréal. `parseServerTime()` in `notification.service.ts`
    already handles this.
  - The privacy notice didn't say that contact details are removed or that the feedback is
    deleted with the resume (the doc says the notice covers this).
  - `alert-info` / `alert-warning` classes used in the template don't exist in `styles.css`.

## AI Output / Actions
- Branch `feature/140-ai-feedback-ui`, changes only in
  `frontend/CareerConnect/src/app/profile.component.{ts,html,css,spec.ts}`:
  - `groupImprovements()`, `splitPlaceholders()`, `sectionLabel()` helpers; grouped
    improvements with `priority-high|medium|low` badges and excerpt quotes; highlighted
    placeholders with a one-line note; summary only when `isResume` is false.
  - Loading state split into "Loading saved feedback…" (GET) and "Generating AI feedback…
    This can take several seconds." (POST).
  - "Try again" after a failed POST (POSTs again) or a failed GET (GETs again). A failed
    Regenerate keeps the earlier feedback on screen (AT-3).
  - Requests tracked per resume, so a late reply only updates its own resume's panel; the
    cache entry is dropped on replace and delete.
  - Timestamp parsed with `parseServerTime()`; privacy notice expanded; inline styles moved to
    `profile.component.css`.
- Tests: replaced the 3 feedback tests from #193 with 18 (helpers, grouping/badges/excerpts,
  placeholders, `isResume: false`, notice → POST, retry after POST and GET errors, failed
  Regenerate keeps old feedback, reopen without a request, replace clears the cache, replies
  for another resume, UTC timestamp). `npx ng test --watch=false`: 151 passed (26 files),
  previously 136.
- `npm run build` passes with no budget warnings. In the sandbox it needed font inlining
  turned off for one run, because fonts.googleapis.com is blocked there; `angular.json` was
  restored and isn't changed.
- Checked in Chrome against the backend with `AI_PROVIDER=mock` (seeded `seeker@example.com`,
  a PDF made from `backend/test/fixtures/resumes/02-weak-career-change.txt`): notice, POST,
  grouped improvements, placeholder highlight, reopen after page reload via GET, local
  timestamp.
- Not changed: "Uploaded" dates in the resume list have the same UTC parsing issue (outside
  #140).

## Decision
**Bryce:**

## Reflection
**Bryce:**
