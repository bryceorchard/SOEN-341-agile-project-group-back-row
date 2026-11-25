# AI Interaction Log

**Author:** Bryce
**Date:** 2026-11-25
**AI Tool:** Claude (Cowork)
**chat url:** <https://claude.ai/code/session_01FY2WCUMdW26MJhaKjzatBj>

## Task / Prompt
"alright, we're in sprint 4 now. Can you create a new sprint-4 github project, import the old issues, and create
new issues please? also create a sprint-4-planning document. we need to implement a non-ai unique feature, and
we're gonna call as a team later today to brainstorm"

Questions asked by the AI and answered by Bryce:
- Sprint 4 handout: not in `Assignment 1/` at first; Bryce added `SOEN341_CareerConnect_Sprint4.pdf`.
- Unique feature: create a placeholder story and a decision task now; feature tasks and ATs after the call.
- Board: copy the Sprint 3 project, link it to the repo and make it public, like Sprints 1–3.
- Second AI feature: the handout requires at least two AI features and the team only has US-10, so plan US-11 AI
  job matching (#54) as well.
- Evaluation date (not in the handout): Mon 2026-11-30.

## Context / Findings
Sources reviewed: the Sprint 4 and Sprint 3 handouts, `docs/sprint-3/sprint-3-plan.md`, `docs/CONTRIBUTING.md`,
the 2026-11-12 minutes, `docs/ai/us10-resume-feedback.md`, Bryce's Sprint 3 planning AI logs, every open issue and
recent PR through the GitHub API, PR #166 and its review, and the Sprint 3 project (#8).
- Sprint 4 handout: finalize Features 1–5, **at least two** Generative-AI features (Feature 6), TA approval before
  any new team-proposed feature, plus quality work: repository organization, code review on every PR, coding
  standards, static analysis in CI with commits linked to the reports. Grading: features 20, contribution 10,
  acceptance/unit tests 10, CI 10, repo organization 5, code review 10, coding standards 5, minutes 5, static
  analysis 10, contribution/AI logs 5, project management 10.
- The request said the unique feature is non-AI; the handout asks for two AI features. Resolved with Bryce: US-11
  is AI feature #2 and the non-AI feature is a separate team-proposed feature (US-23).
- `main` at `3e079fa`: backend 162/162, frontend 151/151 (26 files), run locally; CI green on the last push.
- Missing for the features: the US-21 analytics and history page (#135, not started; branch
  `feature-application-analytics-and-history` has no commits beyond `main`), and all of US-11.
- No linter or static-analysis tool on `main`. PR #166 (repository reorganization) is open and blocked on review;
  its branch already uses `docs/sprint-N/{plan.md,minutes,contributions,ai-log}`, so this plan and log follow that
  layout.
- Open Sprint 3 issues: #47, #128, #135, #144, #147 (real remaining work) and #149, #151, #154, #155, #156
  (Sprint 3 deliverables).
- Tooling: the session's GitHub token can write to the repo through REST, but the Projects API and GraphQL are
  blocked, so the board was set up in the built-in browser, signed in as Bryce.

## AI Output / Actions
**Milestone and label:** `Sprint 4` (#5), due 2026-11-30 (GitHub stores midnight UTC, so it shows "due by
November 29"); label `sprint-4`.

**23 new issues (#199–#221)**, all on the Sprint 4 milestone with `sprint-4`, assignees, and type/area/priority
labels:
- US-23 placeholder story (#199) and the decision task (#200): pick the feature, write it up, get TA approval.
- US-11 tasks: #201 prompt/schema/evaluation/validation doc (Bryce), #202 backend (Mahmoud), #203 page (Gabriel),
  ATs #213 (Zohair + Luca, six Given/When/Then drafts).
- US-10 tasks: #204 injected text and PDF columns (Mahmoud, P2), #205 final validation (Bryce).
- Quality: #206 repository move (Gene + Bryce), #207 coding standards + ESLint (Bryce), #208 static analysis in CI
  (Luca), #209 / #210 fixes (Mahmoud / Gabriel), #211 code review (Bryce).
- Requirements and QA: #212 finalize stories and ATs (Zohair), #214 unit tests + CI (Luca), #215 AT verification
  and regression (Luca).
- Process and docs: #216 plan + board, #217 AI logs + PDFs (Bryce); #218 minutes, #219 contribution logs, #220
  summary report (Gene); #221 demo (Luca).
- Cross-references between the new issues were filled in after creation; 0 placeholders left.

**Existing issues updated:** #54 (US-11) got Sprint 4 acceptance criteria, task and AT links, assignees, high
priority. #47 got the two Sprint 4 tasks and high priority. #128, #135 (new target), #144, #147 (Sprint 4
verification link, high priority) moved to the Sprint 4 milestone with `sprint-4`.

**Sub-issues:** #54 ← #201, #202, #203, #213; #47 ← #204, #205; #199 ← #200.

**Sprint 4 project (#9, <https://github.com/users/bryceorchard/projects/9>)**
- Copied from Sprint 3 (fields, views, workflows). Rewrote the Priority option descriptions (P0 evaluation, P1
  Sprint 3 carry-overs, P2 cut first, P3 backlog) and the Sprint 4 option description.
- Linked to the repo and made public.
- 43 items, every open issue: the 29 Sprint 4 items with Status, Priority, Sprint, Start and Target set as in the
  plan; #149, #151, #154–#156 as Sprint 3 / P1 / Todo; backlog #40, #55–#62 as Backlog / P3 / Backlog.
- Timeline view filter changed from `sprint:"Sprint 3"` to `sprint:"Sprint 4"`.
- Turning off sub-issue nesting in "Prioritized backlog" didn't persist after saving; it still nests sub-issues.

**Plan:** `docs/sprint-4/plan.md`: goal, starting point, grading-to-issues table, priorities, day-by-day timeline
with a feature freeze on Sat Nov 28, critical path, ranked work plan (29 rows), Sprint 3 carry-overs, a shortlist
of unique-feature candidates for the call, capacity, effort and risks. markdownlint: 0 errors.

**Problems hit**
- The board's table only pastes values when the copied value comes from a cell; the browser pane blocks the
  system clipboard, so the AI replaced `navigator.clipboard` in the page with an in-memory copy for the session.
  Field values were set by the project's own copy/paste and pickers.
- A few pastes didn't apply on the first try (#203 and #199 target dates, #204 status, #216 status); each was
  re-read and fixed.

**Validation by the AI**
- All 29 Sprint 4 milestone issues re-read through the API: titles, labels, assignees, milestone; no leftover
  placeholders.
- All 43 board items re-read from the table: Status, Priority, Sprint, Start and Target match the plan.

## Decision
**Bryce:**

## Reflection
**Bryce:**
