# Static Analysis Report

Sprint 4, guideline 5.3 (Static Analysis and Maintenance). Owner: Luca (Integration & QA).
Fixes are tracked in #209 (backend) and #210 (frontend).

## Setup

| Item | Value |
| --- | --- |
| Tool | SonarQube Cloud (free for public repositories) |
| Project | [CareerConnect on SonarQube Cloud](https://sonarcloud.io/project/overview?id=bryceorchard_SOEN-341-agile-project-group-back-row) |
| Scope | `backend/` (src, db, scripts) and `frontend/src`; tests are analysed as tests |
| When it runs | Every PR and every push to `main`, in the `sonar` job of `.github/workflows/ci.yml` |
| Result on PRs | The SonarQube Cloud quality-gate check and summary comment on each PR |
| Config | `sonar-project.properties` at the repo root; `SONAR_TOKEN` is a repository secret (never committed) |
| Coverage | LCOV from the `backend` (`npm run test:lcov`) and `frontend` (Vitest) CI jobs, passed to the `sonar` job as artifacts |

**Why SonarQube Cloud:** it reports the handout's own categories (bugs, vulnerabilities, code
smells and maintainability) for both JavaScript and TypeScript in one place. GitHub CodeQL only
covers security.

## First report — 2026-11-26

Analysis of `main` at commit `832f93d` (merge of #224), run by the `sonar` CI job on 2026-11-27 01:00 UTC
(2026-11-26 20:00 Montréal). 7,716 lines of code analysed.

### Counts by type and severity

Severity is SonarQube Cloud's impact severity (the highest one when a finding has several).

| Type | Blocker | High | Medium | Low | Info | Total |
| --- | --- | --- | --- | --- | --- | --- |
| Bugs (Reliability) | 0 | 2 | 26 | 0 | 0 | 28 |
| Vulnerabilities (Security) | 0 | 0 | 2 | 1 | 0 | 3 |
| Security hotspots (to review) | | | | | | 0 |
| Code smells (Maintainability) | 0 | 0 | 34 | 0 | 0 | 34 |
| **Total** | **0** | **2** | **62** | **1** | **0** | **65** |

By area: CI workflow 2, backend 13, frontend 50.

Other measures:
- Ratings: Reliability D, Security C, Maintainability A, Security review A.
- Coverage 60.7% overall: backend 52.9%, frontend 90.6%. The backend figure counts `backend/scripts/`
  and `backend/db/`, which the tests do not run.
- Duplications 1.5%.
- Quality gate: Passed. The gate (Sonar way) checks new code only, so it does not reflect the findings below.

### Decisions by rule

| Ref | Rule | Findings | Decision |
| --- | --- | --- | --- |
| D1 | githubactions:S6505, backend install | 1 | **Fix.** `npm ci --ignore-scripts`, then `npm rebuild better-sqlite3`, the only backend package with an install script. Tested: 162/162 tests pass. |
| D2 | githubactions:S6505, frontend install | 1 | **Fix.** `npm ci --ignore-scripts`. No frontend package needs its install script (esbuild, lmdb, msgpackr-extract and @parcel/watcher all fall back to prebuilt binaries). Tested: 165/165 tests pass and `ng build` completes. |
| D3 | jssecurity:S5145 Log injection | 1 | **Fix.** Strip CR/LF from the provider's error message before logging it. |
| D4 | javascript:S2871 Sort without a compare function | 2 | **Fix.** Pass `(a, b) => a.localeCompare(b)`. Same order, since both arrays hold strings. |
| D5 | javascript:S3403 `===` always false | 1 | **Won't fix: false positive.** `providerSchema` is recursive and gets every schema value, and `typeof null === 'object'`, so the null guard is needed. |
| D6 | S8786 Regex backtracking, email check on user input | 2 | **Fix.** Rewrite the email regex in `auth.js` and `login.component.ts` so it cannot backtrack, for example `^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$`. Domain labels can no longer contain dots, so each character has one possible match. The only newly rejected inputs have an empty domain label, like `a@b..c` or `a@b.c.`. |
| D7 | javascript:S8786 Regex backtracking, resume text and model replies | 8 | **Fix.** Simplify each regex, or cap the input length before matching if a simpler regex would change behaviour. Owner may change individual rows to "won't fix" with a reason. |
| D8 | Web:InputWithoutLabelCheck + Web:S6853 Unlabelled form inputs | 47 | **Fix.** Give each input an `id` and point its `<label>` at it with `for` (or wrap the input in the label). |
| D9 | Web:S6845 `tabindex` on a non-interactive element | 1 | **Won't fix.** The element is the Application flow carousel (`overflow-x: auto`, one chart per period). `tabindex="0"` with an `aria-label` is the standard way to let keyboard users scroll a scrollable region (WCAG 2.1.1). Chrome and Firefox make scroll containers focusable on their own, but Safari doesn't, so removing it would block Safari keyboard users. |
| D10 | Web:S6843 Non-interactive role on an interactive element | 1 | **Fix.** Drop the role, or use a non-interactive element. |

### Findings

Decision refers to the table above. The fixing commit is added once the fix is on `main`.

| # | Finding (link) | Type / severity | File | Decision | Tracked in | Fixing commit |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [githubactions:S6505](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkBZ9baHMF1NsNT-) | Vulnerability / Medium | `.github/workflows/ci.yml:30` | D1 | #208 | |
| 2 | [githubactions:S6505](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkBZ9baHMF1NsNT_) | Vulnerability / Medium | `.github/workflows/ci.yml:59` | D2 | #208 | |
| 3 | [javascript:S8786](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkAt9baHMF1NsNTM) | Code smell / Medium | `backend/scripts/eval-resume-feedback.js:131` | D7 | #209 | |
| 4 | [javascript:S2871](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkAt9baHMF1NsNTN) | Bug / High | `backend/scripts/eval-resume-feedback.js:306` | D4 | #209 | |
| 5 | [javascript:S8786](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkAj9baHMF1NsNTI) | Code smell / Medium | `backend/src/ai/checks.js:25` | D7 | #209 | |
| 6 | [javascript:S8786](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkAj9baHMF1NsNTJ) | Code smell / Medium | `backend/src/ai/checks.js:48` | D7 | #209 | |
| 7 | [javascript:S8786](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkAj9baHMF1NsNTK) | Code smell / Medium | `backend/src/ai/checks.js:50` | D7 | #209 | |
| 8 | [javascript:S2871](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkAj9baHMF1NsNTL) | Bug / High | `backend/src/ai/checks.js:152` | D4 | #209 | |
| 9 | [javascript:S3403](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkAH9baHMF1NsNTD) | Bug / Medium | `backend/src/ai/feedback-schema.js:94` | D5 | #209 | |
| 10 | [javascript:S8786](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkAI9baHMF1NsNTE) | Code smell / Medium | `backend/src/ai/feedback-schema.js:176` | D7 | #209 | |
| 11 | [javascript:S8786](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkAh9baHMF1NsNTF) | Code smell / Medium | `backend/src/ai/prompt.js:54` | D7 | #209 | |
| 12 | [javascript:S8786](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkAh9baHMF1NsNTG) | Code smell / Medium | `backend/src/ai/prompt.js:59` | D7 | #209 | |
| 13 | [javascript:S8786](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkAh9baHMF1NsNTH) | Code smell / Medium | `backend/src/ai/prompt.js:74` | D7 | #209 | |
| 14 | [javascript:S8786](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkAF9baHMF1NsNTC) | Code smell / Medium | `backend/src/routes/auth.js:8` | D6 | #209 | |
| 15 | [jssecurity:S5145](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPj-y9baHMF1NsNTB) | Vulnerability / Low | `backend/src/routes/resume-feedback.js:59` | D3 | #209 | |
| 16 | [Web:S6845](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIahZ1BukwRRjkoZtMW) | Code smell / Medium | `frontend/src/app/analytics/analytics.component.html:30` | D9 | #210 | |
| 17 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkAy9baHMF1NsNTP) | Code smell / Medium | `frontend/src/app/job-detail.component.html:36` | D8 | #210 | |
| 18 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkAy9baHMF1NsNTQ) | Bug / Medium | `frontend/src/app/job-detail.component.html:37` | D8 | #210 | |
| 19 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA89baHMF1NsNT2) | Code smell / Medium | `frontend/src/app/jobs.component.html:12` | D8 | #210 | |
| 20 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA89baHMF1NsNT3) | Bug / Medium | `frontend/src/app/jobs.component.html:13` | D8 | #210 | |
| 21 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA89baHMF1NsNT4) | Code smell / Medium | `frontend/src/app/jobs.component.html:16` | D8 | #210 | |
| 22 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA89baHMF1NsNT5) | Bug / Medium | `frontend/src/app/jobs.component.html:17` | D8 | #210 | |
| 23 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA89baHMF1NsNT6) | Code smell / Medium | `frontend/src/app/jobs.component.html:20` | D8 | #210 | |
| 24 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA89baHMF1NsNT7) | Bug / Medium | `frontend/src/app/jobs.component.html:21` | D8 | #210 | |
| 25 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA29baHMF1NsNTl) | Code smell / Medium | `frontend/src/app/login.component.html:11` | D8 | #210 | |
| 26 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA39baHMF1NsNTm) | Bug / Medium | `frontend/src/app/login.component.html:12` | D8 | #210 | |
| 27 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA39baHMF1NsNTn) | Code smell / Medium | `frontend/src/app/login.component.html:17` | D8 | #210 | |
| 28 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA39baHMF1NsNTo) | Bug / Medium | `frontend/src/app/login.component.html:18` | D8 | #210 | |
| 29 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA39baHMF1NsNTp) | Code smell / Medium | `frontend/src/app/login.component.html:24` | D8 | #210 | |
| 30 | [typescript:S8786](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkAx9baHMF1NsNTO) | Code smell / Medium | `frontend/src/app/login.component.ts:32` | D6 | #210 | |
| 31 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkBA9baHMF1NsNT8) | Bug / Medium | `frontend/src/app/posting-applicants.component.html:82` | D8 | #210 | |
| 32 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkBA9baHMF1NsNT9) | Bug / Medium | `frontend/src/app/posting-applicants.component.html:112` | D8 | #210 | |
| 33 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA69baHMF1NsNTq) | Code smell / Medium | `frontend/src/app/profile.component.html:12` | D8 | #210 | |
| 34 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA69baHMF1NsNTr) | Bug / Medium | `frontend/src/app/profile.component.html:13` | D8 | #210 | |
| 35 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA69baHMF1NsNTs) | Code smell / Medium | `frontend/src/app/profile.component.html:16` | D8 | #210 | |
| 36 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA69baHMF1NsNTt) | Bug / Medium | `frontend/src/app/profile.component.html:17` | D8 | #210 | |
| 37 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA69baHMF1NsNTu) | Code smell / Medium | `frontend/src/app/profile.component.html:20` | D8 | #210 | |
| 38 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA69baHMF1NsNTv) | Bug / Medium | `frontend/src/app/profile.component.html:21` | D8 | #210 | |
| 39 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA69baHMF1NsNTw) | Code smell / Medium | `frontend/src/app/profile.component.html:24` | D8 | #210 | |
| 40 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA69baHMF1NsNTx) | Bug / Medium | `frontend/src/app/profile.component.html:25` | D8 | #210 | |
| 41 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA69baHMF1NsNTy) | Code smell / Medium | `frontend/src/app/profile.component.html:28` | D8 | #210 | |
| 42 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA69baHMF1NsNTz) | Bug / Medium | `frontend/src/app/profile.component.html:29` | D8 | #210 | |
| 43 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA69baHMF1NsNT0) | Bug / Medium | `frontend/src/app/profile.component.html:44` | D8 | #210 | |
| 44 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA69baHMF1NsNT1) | Bug / Medium | `frontend/src/app/profile.component.html:61` | D8 | #210 | |
| 45 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA19baHMF1NsNTR) | Code smell / Medium | `frontend/src/app/recruiter-postings.component.html:26` | D8 | #210 | |
| 46 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA19baHMF1NsNTS) | Bug / Medium | `frontend/src/app/recruiter-postings.component.html:27` | D8 | #210 | |
| 47 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA19baHMF1NsNTT) | Code smell / Medium | `frontend/src/app/recruiter-postings.component.html:30` | D8 | #210 | |
| 48 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA19baHMF1NsNTU) | Bug / Medium | `frontend/src/app/recruiter-postings.component.html:31` | D8 | #210 | |
| 49 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA19baHMF1NsNTV) | Code smell / Medium | `frontend/src/app/recruiter-postings.component.html:35` | D8 | #210 | |
| 50 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA19baHMF1NsNTW) | Bug / Medium | `frontend/src/app/recruiter-postings.component.html:36` | D8 | #210 | |
| 51 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA19baHMF1NsNTX) | Code smell / Medium | `frontend/src/app/recruiter-postings.component.html:39` | D8 | #210 | |
| 52 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA19baHMF1NsNTY) | Bug / Medium | `frontend/src/app/recruiter-postings.component.html:40` | D8 | #210 | |
| 53 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA19baHMF1NsNTZ) | Code smell / Medium | `frontend/src/app/recruiter-postings.component.html:43` | D8 | #210 | |
| 54 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA19baHMF1NsNTa) | Bug / Medium | `frontend/src/app/recruiter-postings.component.html:44` | D8 | #210 | |
| 55 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA19baHMF1NsNTb) | Code smell / Medium | `frontend/src/app/recruiter-postings.component.html:57` | D8 | #210 | |
| 56 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA19baHMF1NsNTc) | Bug / Medium | `frontend/src/app/recruiter-postings.component.html:58` | D8 | #210 | |
| 57 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA19baHMF1NsNTd) | Code smell / Medium | `frontend/src/app/recruiter-postings.component.html:61` | D8 | #210 | |
| 58 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA19baHMF1NsNTe) | Bug / Medium | `frontend/src/app/recruiter-postings.component.html:62` | D8 | #210 | |
| 59 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA19baHMF1NsNTf) | Code smell / Medium | `frontend/src/app/recruiter-postings.component.html:66` | D8 | #210 | |
| 60 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA19baHMF1NsNTg) | Bug / Medium | `frontend/src/app/recruiter-postings.component.html:67` | D8 | #210 | |
| 61 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA19baHMF1NsNTh) | Code smell / Medium | `frontend/src/app/recruiter-postings.component.html:70` | D8 | #210 | |
| 62 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA19baHMF1NsNTi) | Bug / Medium | `frontend/src/app/recruiter-postings.component.html:71` | D8 | #210 | |
| 63 | [Web:S6853](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA19baHMF1NsNTj) | Code smell / Medium | `frontend/src/app/recruiter-postings.component.html:74` | D8 | #210 | |
| 64 | [Web:InputWithoutLabelCheck](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIaPkA19baHMF1NsNTk) | Bug / Medium | `frontend/src/app/recruiter-postings.component.html:75` | D8 | #210 | |
| 65 | [Web:S6843](https://sonarcloud.io/project/issues?id=bryceorchard_SOEN-341-agile-project-group-back-row&open=AaIahZ2QukwRRjkoZtMX) | Code smell / Medium | `frontend/src/app/sankey-view/sankey-view.html:4` | D10 | #210 | |

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
