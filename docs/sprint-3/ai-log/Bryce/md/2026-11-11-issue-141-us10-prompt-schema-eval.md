# AI Interaction Log

**Author:** Bryce
**Date:** 2026-11-11
**AI Tool:** Claude (Opus 5.5)

One log for the whole chat, updated after each prompt.

## Task / Prompt
1. "Can you complete issue #141 please?" #141 is Bryce's US-10 task (#47): the prompt, the JSON
   response schema and the evaluation set for the AI resume feedback feature. #139 (backend,
   Mahmoud) and #140 (UI, Gabriel) depend on it.
2. "So what do you think my next steps should be?"
3. "I've moved all my .md AI files to the md folder. Can you delete the AI logs from this
   session, and just make one single AI log (for this specific chat) that you update as we go?"
4. "Can you come up with something for the response schema that you think is best, then pretend
   Gab and Mahmoud agreed on it? They gave me carte blanche."
5. "Should I commit now, or is there anything else that's needed?"
6. "Can you do the branches and the commits?"

## Context / Findings
- What #141 asks for: a schema (summary, strengths, improvements by section with priority,
  suggested rewordings) agreed with Mahmoud and Gabriel by Mon 2026-11-09; a system prompt and
  user template in `backend/src/ai/`; a choice of provider and model with the reasons; 4–6
  synthetic resumes in `backend/test/fixtures/`; a hand review of each output; limitations and
  the privacy notice for the UI.
- Dates:
  - the schema target (Mon 11-09) has passed;
  - #141's evaluation, and #139, are due Thu 11-12; #140 is due Fri 11-13;
  - the Sprint 3 lab evaluation is Mon 11-16.
- Neither #139 nor #140 has a branch or PR yet. #147's acceptance tests (AT-1 to AT-5) and the
  Sprint 3 guidelines' AI Usage section shaped the design. That section says teams must show
  prompts, outputs, modifications, validation steps and decisions, and that each member submits
  a Sprint 3 PDF report in their AI-log folder.
- The local repo is in iCloud Drive, and many files, including `.git/HEAD` and `.git/config`,
  had been evicted to the cloud. Git couldn't run on it from the AI's side.
  - Local `main` is behind `origin/main`: it doesn't have #157 or #158.
  - The work was done in a fresh clone of `origin/main`.
  - The three existing files that changed (`backend/package.json`, `backend/.gitignore`,
    `docs/README.md`) are identical to `origin/main`'s locally and unchanged upstream since
    2026-10-30, so pulling won't conflict.
- Provider research (prices and terms checked 2026-11-11):
  - **Groq:** free plan with no card; says it doesn't train on API data; self-serve Zero Data
    Retention; strict `json_schema` on the gpt-oss models. Community reports say strict mode
    sometimes fails on gpt-oss.
  - **Claude Haiku 5.5:** $0.10 / $0.50 per M tokens, about $0.0007 per request; API data not
    used for training by default; structured outputs.
  - **GPT-5 mini:** $0.25 / $2.00 per M tokens; no free tier.
  - **Gemini:** has a free tier, but free-tier content is used to improve Google's products, which
    rules it out for real resumes.
- Estimated request size: about 2,000 input tokens (system prompt about 1,000, schema about 550)
  and about 1,000 output tokens.

## AI Output / Actions

### Prompt 1: complete #141
- **Schema** (`backend/src/ai/feedback-schema.js`):
  - fields: `isResume`, `summary`, `strengths[] {point, evidence}`,
    `improvements[] {section, priority, issue, suggestion}`,
    `rewordings[] {section, original, suggested, reason}`;
  - `section` and `priority` are enums; there is no numeric score, on purpose;
  - a dependency-free validator, `parseFeedback()` (parse, validate, sort by priority), and
    `providerSchema()`, which drops the keywords that strict modes reject.
- **Prompt** (`backend/src/ai/prompt.js`, `resume-feedback-v1`):
  - grounding: evidence and originals are copied exactly, and missing numbers become
    `[placeholders]`;
  - fairness: no name, gender or age; no speculation about gaps;
  - privacy: email, phone and postal code are redacted before sending;
  - injection: resume text is treated as data, `</resume>` look-alikes are stripped, and
    instructions inside the resume are flagged;
  - tolerance of extraction damage, and a 12,000-character truncation.
- **Automatic checks** (`backend/src/ai/checks.js`):
  - flag quotes that aren't in the resume, numbers added in rewordings, contact details in the
    output, and demographic words;
  - check the per-fixture expectations;
  - compare the two halves of the bias pair.
- **Evaluation set** (`backend/test/fixtures/resumes/`):
  - six fixtures: strong; weak (career change, age cues, personal details); sparse; badly
    formatted (two-column extraction); prompt injection; and a name-swap copy of the strong resume
    for the bias check;
  - `manifest.json` says what each one tests and what the hand review should look for;
  - `test/fixtures/ai/sample-feedback.json` is a hand-written valid reply for #139's mock and
    #140's tests.
- **Runner** (`npm run ai:eval`, `backend/scripts/eval-resume-feedback.js`):
  - providers: Groq, Anthropic, OpenAI, Gemini, any OpenAI-compatible API, or a mock;
  - `--repeat` gives a run-to-run variation baseline, and `--dry-run` prints the prompt;
  - writes the raw outputs and `REVIEW.md`, a sheet with the checklist for each fixture.
- **Doc** (`docs/ai/us10-resume-feedback.md`, added to `docs/README.md`):
  - the schema contract for #139 and #140, and the reason behind each prompt rule;
  - the provider comparison and recommendation, and the evaluation method;
  - limitations, the privacy notice text, and the Sprint 4 open items.
- **Recommendation, for Bryce to decide:** Groq's free plan with `openai/gpt-oss-120b`. It is
  free, doesn't train on data, and offers Zero Data Retention. Claude Haiku 5.5 is the fallback.
  The final choice should follow an evaluation run on both. The AI that made this recommendation
  is itself an Anthropic model.
- **Checks run:**
  - `npm test`: 53/53 pass, 17 of them new; no network.
  - A mock run of the whole set.
  - Both request formats (OpenAI-compatible and Anthropic) were tested against a local fake
    server, including an HTTP 400 path.
  - The request bodies were confirmed: strict `json_schema`, `output_config.format`, headers and
    temperature.
- **Not done** (needs the team or a real key):
  - confirming the schema with Mahmoud and Gabriel;
  - running the set against a real provider and doing the hand review;
  - recording the provider decision.

### Prompt 2: next steps
Suggested order:
1. Send the schema to Mahmoud and Gabriel first, because it unblocks both of them.
2. Move the repo out of iCloud, or keep it downloaded. Then pull, branch, commit and open a PR
   marked "Part of #141", with Mahmoud as reviewer, so that his review is also the schema
   agreement.
3. Run the evaluation on Groq, with `--repeat 2` and Zero Data Retention on. Hand-review the
   sheet, make any prompt change with a version bump, and record the provider decision.
4. As Scrum lead, check that #139 and #140 have started. The Monday demo only needs the mock
   working end to end.
5. Before Monday, read the prompt-design and provider sections well enough to explain them.
   Fill in Decision and Reflection, and write the Sprint 3 PDF report.

### Prompt 3: one log for this chat
- Bryce had already moved the first log into `AI-log/Bryce/md/`. Both of this chat's logs were
  deleted: `md/2026-11-11-issue-141-prompt-schema-eval.md` and
  `2026-11-11-issue-141-next-steps.md`.
- They were replaced by this file, `md/2026-11-11-issue-141-us10-prompt-schema-eval.md`, which
  will be updated after each prompt in this chat.

### Prompt 4: finalise the schema
Changes to the first draft (`backend/src/ai/feedback-schema.js`):
- **`summary` moved to the end of the schema.** Structured-output decoding writes fields in
  schema order, so the summary is now written after the lists it summarises.
  `normalizeFeedback()` puts it back first for storage and display.
- **Added `improvements[].excerpt`.** It holds the resume text the issue is about, copied
  exactly, or `""` if the issue is something missing. This makes "specific" checkable:
  `checks.js` now grounds non-empty excerpts. It also lets the UI quote what each point refers
  to.
- **Clarified the section enum:** volunteering goes under `experience`, and languages and
  certifications go under `skills`.

Kept from the draft:
- one flat list of improvements with a `section` field, which the UI groups;
- no numeric score;
- `isResume` as a gate for non-resumes.

API response defined, to finish the contract between #139 and #140 (in
`docs/ai/us10-resume-feedback.md`):
- `{ feedback: { resumeId, createdAt, model, promptVersion, isResume, summary, strengths,
  improvements, rewordings } }`;
- POST returns 201; GET returns 200 with `feedback: null` when there is none yet;
- errors: 404, 422, 429, 502 and 503; nothing is saved on error.

Other files updated to match:
- the prompt's grounding and output-order rules (still `resume-feedback-v1`, since nothing has
  been released);
- `sample-feedback.json`, the unit tests, and the runner's review sheet, which now shows each
  excerpt.

Sign-off: the doc's status now says the schema is final for v1. It records that Mahmoud and
Gabriel left the schema to Bryce, who settled it on 2026-11-11, and that later changes go
through a PR reviewed by both. The doc doesn't claim a meeting or review that didn't happen.

Checks: `npm test` 55/55 pass. A mock run of the full set shows the excerpt grounding flags
working.

### Prompt 5: ready to commit?
Checked Bryce's local repo:
- It is on `main` and was pulled at 23:30, so it matches `origin/main` (`6cb3181`).
- Besides the #141 changes, the working tree also has unrelated changes:
  - Bryce's move of his AI-log `.md` files into `AI-log/Bryce/md/`;
  - four older logs that were never committed (11-05 and 11-09).
- The move breaks the AI-log links in `docs/ContributionLog/Sprint2/Bryce-sprint2-contribution.md`,
  which point at `AI-log/Bryce/2026-10-*.md`.

Added the new folders to the file tree in the root `README.md`: `backend/src/ai/`,
`backend/scripts/`, `backend/test/fixtures/`, the git-ignored `backend/eval-output/`, and
`docs/ai/`. The local `README.md` matched `origin/main` before the edit.

Advice given:
- Commit #141 now, on a new branch rather than `main`, staging only the #141 files.
- Put the AI-log move and the older logs in a separate commit, and fix the contribution-log
  links first.
- Open the PR as "Part of #141", with Mahmoud and Gabriel as reviewers. The evaluation results
  follow in a later commit.

### Prompt 6: branches and commits
- iCloud had evicted about 110 files (git objects, refs, hooks, a few PDFs), so git couldn't run.
  They were downloaded to the Mac first.
- Before committing, the AI-log paths in the doc and in the runner's closing message were updated
  to `AI-log/Bryce/md/`. The local files were checked byte for byte against the copy where
  `npm test` passes (55/55).
- **`feature/141-ai-prompt-schema-eval`**, branched from `main` (`6cb3181`):
  - `319772f`: the schema, prompt, checks, fixtures, runner, doc, README trees and this log;
  - a follow-up commit brings this log up to date. The copy in `319772f` was missing the
    Prompt 5 entry: the AI's file transfer had delivered an outdated copy of the log, and the
    mistake was caught and fixed after the commit.
- **`docs/bryce-ai-logs-md`**, branched from `main` (`6cb3181`):
  - `0382dd6`: moves the 19 `.md` logs into `md/`, recorded as clean renames, and fixes the 10
    AI-log links in `docs/ContributionLog/Sprint2/Bryce-sprint2-contribution.md`;
  - `3e61662`: adds the four logs from 11-05 and 11-09 that had never been committed.
- The two branches touch different files and merge without conflicts.
- Commits are authored as Bryce Orchard `<brworchard@gmail.com>` (the identity on Bryce's local
  commits), with a Co-Authored-By trailer for Claude.
- Nothing was pushed. `docs/sprint-3/sprint-3-plan.md` is untracked and not on `origin/main`;
  it was left alone.

## Decision
**Bryce:**

## Reflection
**Bryce:**
