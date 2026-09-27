# Contributing to CareerConnect

This is the team's working agreement. It defines how we branch, review, and merge
work so every pull request follows the same rules. All contributors are expected
to follow it. (Issue #23)

## Team and roles

| Member  | GitHub                  | Role                 |
| ------- | ----------------------- | -------------------- |
| Bryce   | @bryceorchard           | Scrum lead / process |
| Gene    | @GeneFeng1              | Documentation        |
| Zohair  | @ZA-Error               | Requirements         |
| Mahmoud | @MahmoudAbdalla28       | Backend              |
| Gabriel | @gabibdods              | Frontend / UI        |
| Luca    | @lucamancini2005-design | Integration & QA     |

## Workflow

We use a feature-branch workflow with `main` as the single integration branch.

1. `main` is always protected and always deployable/testable. Never commit directly to `main`.
2. Pick up (or open) a GitHub Issue and assign yourself. Work is tracked on the
   **Sprint 1** project board (Backlog → To Do → In Progress → Review → Done).
3. Create a feature branch off the latest `main`.
4. Commit small, focused changes with clear messages.
5. Open a Pull Request into `main` early (draft PR is fine) and link the issue.
6. Get the required review(s), pass CI, then squash-and-merge.
7. Delete the branch after merge and move the issue card to **Done**.

## Branching strategy

- Branch off the latest `main`: `git switch main && git pull && git switch -c <branch>`.
- **Naming:** `<type>/<short-description>` (kebab-case), optionally suffixed with the issue number.
  - `feature/` – new functionality (`feature/resume-upload-ui`, `feature/38-profile-api`)
  - `fix/` – bug fixes (`fix/login-401-handling`)
  - `docs/` – documentation (`docs/team-process`)
  - `chore/` – tooling, config, CI (`chore/ci-node-pin`)
  - `test/` – tests only (`test/auth-flow-coverage`)
- One branch per issue where practical. Keep branches short-lived; rebase or merge
  `main` in frequently to avoid large conflicts.
- Never force-push a shared branch that others are working on.

## Pull request process

- Every change reaches `main` through a PR — no direct pushes.
- Fill in the PR template (`.github/PULL_REQUEST_TEMPLATE.md`) completely, including
  the linked issue (`Closes #NN`) and the Definition of Done checklist.
- **Required reviews:** at least **one** approving review from someone other than the
  author before merge. For changes that cross areas (e.g. backend + frontend), request
  a reviewer from each affected area.
- **CI must be green.** The GitHub Actions `CI` workflow (Node 22, `npm ci`, `npm test`
  in `backend/`) must pass before merge.
- Resolve all review conversations before merging.
- **Merge method:** squash and merge, so `main` keeps a clean, linear history. The
  squash commit message should summarize the change and reference the issue.
- The **author** merges once approved and green (or asks the reviewer to). Delete the
  branch on merge.

## Code review process

- Review within ~24h of being requested so work doesn't stall near sprint end.
- Reviewers check: does it meet the issue's acceptance criteria and the Definition of
  Done; is it readable and consistent with the codebase; are there tests for new
  behaviour; any security concerns (auth, input validation, secrets); does CI pass.
- Leave specific, actionable comments. Use "Request changes" for blockers and
  "Approve" (optionally with nits) otherwise.
- Authors respond to every comment — fix it or explain why not. Don't merge over an
  unresolved "Request changes".
- Be kind and direct; review the code, not the person.

## Definition of Ready (DoR)

An issue is **ready** to be pulled into a sprint when:

- [ ] It has a clear title and description (user story format for stories: *As a … I want … so that …*).
- [ ] Acceptance criteria are written and testable.
- [ ] It is broken into tasks where useful.
- [ ] It is labelled (type, area, priority) and has a sprint/milestone.
- [ ] It has an owner (or is explicitly ready for anyone to pick up).
- [ ] Dependencies are known and not blocking (or are called out).
- [ ] It is small enough to finish within the sprint (split it otherwise).

## Definition of Done (DoD)

An issue/PR is **done** when:

- [ ] Acceptance criteria are all met.
- [ ] Code is merged into `main` via a reviewed PR.
- [ ] At least one approving review, all conversations resolved.
- [ ] CI is green (build + tests pass).
- [ ] Tests exist for new behaviour where applicable.
- [ ] Documentation updated (README / docs / code comments) where relevant.
- [ ] Any AI assistance used is logged in `AI-log/<name>/` per the AI Usage Log format.
- [ ] The issue is closed and its board card moved to **Done**.
