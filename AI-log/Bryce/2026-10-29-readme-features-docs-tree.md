# AI Interaction Log

**Author:** Bryce
**Date:** 2026-10-29
**AI Tool:** Claude (Cowork)

## Task / Prompt
Fix the two problems found while updating the README's file structure:
1. The README's Features list mixed built features with ones still in the backlog.
2. `docs/README.md`'s folder tree was missing `ContributionLog/`.

## Context / Findings
- Bryce had committed the file-structure update on `docs/update-readme` (`fc767c3`, pushed, no PR
  yet). He was working on `logs/Bryce-AI-Logs` with AI logs staged, so his checkout couldn't be
  switched without disturbing that work.
- **Checked against the code on `main`:**
  - The application statuses are Applied, Under Review, Interview, Offered and Rejected. The old
    list left out Under Review.
  - The apply form lets the job seeker attach one of their resumes (optional).
  - Recruiters can close and reopen postings.
  - The applicants page has a status filter and a status dropdown.
- Notifications (US-07) and saved jobs (US-04) aren't built. They're backlog stories, like
  AI-assisted resume feedback (US-10, planned for Sprint 3) and US-11–US-19.
- When asked how to add the fixes, Bryce chose a commit on `docs/update-readme` that leaves his
  checkout alone.

## AI Output / Actions
- **Features:** the README's list is now split into "Implemented (Sprints 1–2)" (7 items) and
  "Planned for later sprints" (US-10, US-04, US-07, and the rest of the backlog).
- **`docs/README.md`:** added `ContributionLog/` (template, Sprint 1 summary, one Sprint 2 file
  per member) to the tree.
- **The commit:** made `019b99f` on local `docs/update-readme` (parent `fc767c3`) using git
  plumbing: a temporary index, `commit-tree` and `update-ref`. Bryce's working tree, index and
  current branch were not touched. Not pushed.

## Decision
**Bryce:**

## Reflection
**Bryce:**
