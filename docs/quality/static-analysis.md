# Static Analysis Report

Sprint 4, guideline 5.3 (Static Analysis and Maintenance). Owner: Luca (Integration & QA).
Fixes are tracked in #209 (backend) and #210 (frontend).

## Setup

| Item | Value |
| --- | --- |
| Tool | SonarQube Cloud (free for public repositories) |
| Project | [CareerConnect on SonarQube Cloud](https://sonarcloud.io/project/overview?id=bryceorchard_SOEN-341-agile-project-group-back-row) |
| Scope | `backend/` (src, db, scripts) and `frontend/CareerConnect/src`; tests are analysed as tests |
| When it runs | Every PR and every push to `main`, in the `sonar` job of `.github/workflows/ci.yml` |
| Result on PRs | The SonarQube Cloud quality-gate check and summary comment on each PR |
| Config | `sonar-project.properties` at the repo root; `SONAR_TOKEN` is a repository secret (never committed) |
| Coverage | LCOV from the backend (`node --test`) and frontend (Vitest) test runs |

**Why SonarQube Cloud:** it reports the handout's own categories (bugs, vulnerabilities, code
smells and maintainability) for both JavaScript and TypeScript in one place. GitHub CodeQL only
covers security.

## First report — YYYY-MM-DD

Analysis of `main` at commit `xxxxxxx`.

### Counts by type and severity

| Type | Blocker | High | Medium | Low | Info | Total |
| --- | --- | --- | --- | --- | --- | --- |
| Bugs (Reliability) | | | | | | |
| Vulnerabilities (Security) | | | | | | |
| Security hotspots (to review) | | | | | | |
| Code smells (Maintainability) | | | | | | |
| **Total** | | | | | | |

Other measures: coverage __%, duplications __%, quality gate __.

### Findings

Decision is **fix** or **won't fix** (with the reason). The fixing commit is added once the fix is on `main`.

| # | Finding (link) | Type / severity | File | Decision | Fixing commit |
| --- | --- | --- | --- | --- | --- |
| 1 | | | | | |

## Final report — YYYY-MM-DD

### Before and after

| Type | First report | Final report | Change |
| --- | --- | --- | --- |
| Bugs | | | |
| Vulnerabilities | | | |
| Security hotspots | | | |
| Code smells | | | |
| Coverage | | | |
| Duplications | | | |

### Summary

What was fixed, what was accepted as won't fix and why, and what's left.
