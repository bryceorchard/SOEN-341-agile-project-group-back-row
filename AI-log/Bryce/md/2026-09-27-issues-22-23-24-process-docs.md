# AI Interaction Log

**Author:** Bryce
**Date:** 2026-09-27
**AI Tool:** Claude (Cowork)

## Task / Prompt
Tackle issues #22, #23, and #24 — the three Scrum-lead process/documentation deliverables
for Sprint 1: GitHub setup (folders + board), team process (branching/PRs/review/DoR/DoD),
and Sprint 1 planning + Appendix A. Decisions: keep all process/planning docs under `docs/`,
and add a PR template only (no issue templates).

## Context / Findings
- Read the assignment spec (`SOEN341_CareerConnect_Project_Sprint1.docx`) to ground the
  deliverables. Confirmed exact Appendix A columns: Issue Number, Issue Title, Issue Type
  (User Story/Task), Responsible Member, Target Completion Date, Priority, Current Status
  (Not Started/In Progress/Completed). Confirmed the Team Process Definition must cover
  workflow, branching, PR process, code review, DoR, and DoD. Rubric weights User Stories
  (3.0) and Sprint Planning (3.0) most heavily.
- Pulled the live issue set from the GitHub REST API (unauthenticated; the repo is public).
  Mapped GitHub handles to members: bryceorchard=Bryce, MahmoudAbdalla28=Mahmoud,
  GeneFeng1=Gene, ZA-Error=Zohair, lucamancini2005-design=Luca, gabibdods=Gabriel.
- Identified the Sprint 1 issue set (16 issues) by `sprint-1` label / Sprint 1 milestone:
  #1, #2 (closed), #22–#33, and user stories #38 and #42. Story issues #39–#47 are
  backlog (no sprint-1 label). Milestone "Sprint 1" is due 2026-09-28.
- Pulled backend/CI details to keep the docs accurate: Node 22 (`backend/.nvmrc`), tests via
  `node --test test/*.test.js`, CI runs `npm ci` + `npm test` in `backend/` on push/PR to `main`.
- Current working branch is `AI-log`; the repo had no `docs/` or `.github/` in the working
  tree yet, so the new files are created cleanly with no conflicts.

## AI Output / Actions
Created the following files in the repo working tree (untracked; not committed — Bryce
manages git):
- `docs/README.md` — documentation index describing the folder layout (#22: docs, minutes,
  AI logs, sprint deliverables).
- `docs/CONTRIBUTING.md` — team working agreement (#23): roles, workflow, branching strategy
  and naming, PR process (template + one required review + green CI + squash merge), code
  review process, Definition of Ready, Definition of Done.
- `.github/PULL_REQUEST_TEMPLATE.md` — PR template with linked-issue field and a DoD checklist (#23).
- `docs/minutes/minutes-template.md` — meeting-minutes template so the minutes folder exists (#22);
  content ownership stays with Gene (#27).
- `docs/sprint-1/sprint-1-plan.md` — Sprint 1 plan (#24): sprint goal, team capacity, backlog
  (committed vs product backlog), priorities, effort estimation (t-shirt sizing), and risks
  with mitigations.
- `docs/sprint-1/appendix-a.md` — Appendix A work-plan table generated from the live issues,
  with the exact spec columns; 16 Sprint 1 issues (4 Completed, 12 In Progress).

Flagged for Bryce (not actioned in code):
- #22 Definition of Done also requires the project board to reflect Sprint 1 issues with
  labels applied. Board (GitHub Projects v2) state can't be read without an authenticated
  token, so it needs a manual check in the GitHub UI (confirm all Sprint 1 issues are on the
  "Sprint 1" board and #1/#2/#28/#31 are in Done).
- A stale `appendix-a.md` (an earlier draft, listing obsolete issue numbers #5–#21) sits at
  the repo root on the `lucamancini2005-design/ci-setup` branch; it should not be merged to
  `main` — the correct file is now `docs/sprint-1/appendix-a.md`.

## Decision
**Bryce:** Kept all the process and planning docs under docs/ and went with just a PR template (no issue templates) to keep things simple. Used the generated files mostly as written, with the understanding that the team process doc (branching, PR, DoR/DoD) is something the whole team needs to sign off on rather than just me imposing it.

## Reflection
**Bryce:** As scrum lead this was the part of the sprint I owned, so getting the process pieces grounded in the actual rubric and the live issue set was useful. It also flagged the gap between our documented branch convention and what branches actually exist, which is something I still need to reconcile with the team.
