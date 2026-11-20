# AI Interaction Log

**Author:** Bryce
**Date:** 2026-11-19
**AI Tool:** Claude (Cowork)
**chat url:** <https://claude.ai/code/session_01FY2WCSw6qFbXTLHXqGNLuF>

## Task / Prompt
1. "Can you fix the docs folder? I'd like to have a per-sprint minutes folder, contribution folder,
   ai log folder, and plan.md."
   - Follow-up choice: AI logs go in `docs/sprint-N/ai-log/<Name>/`, moved out of the root `AI-log/`.
2. "Can you add it to #166?" (Gene's refactor proposal PR, branch `Refactor-Proposal`).
3. "Move Sprint-3/Contribution commits onto #166. Also post a comment in #166, and give me a
   message I can send in the Discord."

## Context / Findings
- Before: `docs/minutes/` (6 minutes + template), `docs/ContributionLog/` (folders `Sprint 1/`,
  `Sprint2/`, `Sprint3/`, plus `Gene_sprint_3_contribution.md` loose at the top level),
  `docs/sprint-N/sprint-N-plan.md` for sprints 1–3, and `AI-log/<Name>/` at the repo root
  (~130 files, all six members).
- Sprint windows used for sorting by date: Sprint 1 to 2026-09-28, Sprint 2 to 2026-10-29
  (the Sprint 2 plan is dated 2026-10-29), Sprint 3 to 2026-11-16 (evaluation day), Sprint 4 from 2026-11-17.
- Files with no date in the name were placed by their sprint number (Gene's and Mahmoud's
  per-sprint PDFs). Running multi-sprint logs went to the sprint of their last commit:
  `Gene AI Log Entries.md` → Sprint 1 (`6509602`), `Zohair AI LOG.pdf` → Sprint 3 (`e1288ac`),
  `Mahmoud AI Log Entries.md` → Sprint 4 (`2aee1ed`).
- Live references to the old paths: `.github/PULL_REQUEST_TEMPLATE.md`, `docs/CONTRIBUTING.md` (DoD),
  `backend/scripts/eval-resume-feedback.js` (console message), `docs/ai/us10-resume-feedback.md`,
  `docs/sprint-3` plan, both README folder trees, and relative links in the contribution logs.
- PR #166 (`docs/Back Row Career Connect Refactor Draft.md`) already proposes moving AI logs into `docs/`.
  The branch was 30 commits behind `main`.
- Unmerged work still at the old paths: branch `Sprint-3/Contribution` (Bryce's and Zohair's Sprint 3
  contribution logs and an AI log, no PR).

## AI Output / Actions
- Moved 126 files with `git mv` and a script (date → sprint), deleted the placeholders
  `AI-log/Gabriel/README.md` and `AI-log/Zohair/placeholder.txt`:
  - `docs/sprint-N/plan.md` (renamed from `sprint-N-plan.md`); `appendix-a.md` stays in `sprint-1/`.
  - `docs/sprint-N/minutes/`: names zero-padded (`2026_10_1` → `2026_10_01`, `2026_10_6` → `2026_10_06`).
  - `docs/sprint-N/contributions/`: `Genes-sprint2-contribution.md` → `Gene-sprint2-contribution.md`,
    `Gene_sprint_3_contribution.md` → `Gene-sprint3-contribution.md`.
  - `docs/sprint-N/ai-log/<Name>/` (Bryce keeps his `md/` subfolder).
  - `docs/templates/` for the minutes and contribution templates.
  - Empty `docs/sprint-4/minutes/` and `contributions/` (`.gitkeep`). No Sprint 4 `plan.md` yet.
- Rewrote relative links that pointed at moved files; 0 broken relative links across all `.md` files.
  Historical text in older AI logs was left as written.
- Updated the PR template, CONTRIBUTING DoD, eval script message, US-10 design doc, Sprint 3 plan and
  both README trees to `docs/sprint-N/ai-log/<Name>/`.
- On `Refactor-Proposal` (#166): merged `origin/main` (`c12acad`), then applied the restructure
  (`fc35e51`). Git's rename detection put `2026-11-16-pr166-refactor-proposal-review.md` in Sprint 2;
  moved to Sprint 3.
- Backend tests: 162 pass, 0 fail. No frontend files changed.
- Prompt 3:
  - `Sprint-3/Contribution` had 4 commits (`1b65303`, `dd54849`, `a3584e2` by Zohair; `f1babae` by Bryce),
    30 behind `main`, no PR. Cherry-picked all 4 onto `Refactor-Proposal` with authorship kept
    (`d4f5b76`, `1f50bba`, `88a3b07`, `3bd65a7`). Rename detection put `2026-11-16-sprint3-contribution-log.md`
    in Sprint 2; moved to Sprint 3.
  - `b88e3ae`: moved Bryce's and Zohair's Sprint 3 contribution logs to `docs/sprint-3/contributions/`,
    pointed Bryce's 15 AI-log links at `../ai-log/Bryce/md/` and the Sprint 3 plan link at `../plan.md`.
    0 broken relative links.
  - Bryce's Sprint 3 contribution log records his 2026-11-16 review of #166 asking to keep `AI-log/`
    at the root. Left as written (historical); the #166 comment says the decision changed.
  - Posted a comment on #166 summarising the moves and drafted a Discord message for the team.
  - `Sprint-3/Contribution` branch left in place (not deleted).

## Decision
**Bryce:**

## Reflection
**Bryce:**
