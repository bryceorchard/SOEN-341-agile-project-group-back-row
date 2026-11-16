# AI Interaction Log

**Author:** Bryce
**Date:** 2026-11-16
**AI Tool:** Claude (Opus 5.5)
**chat url:** <https://claude.ai/code/session_01FY2WCUmc8nYV5LGCDxft6P>

## Task / Prompt
1. "Can you complete #141 please?"
2. "Where do I put the API key? Are there any special Groq setup instructions?"
3. (Screenshot of the first Groq run: fixture 01 failed twice with HTTP 400, 02 #1 passed, then
   Bryce stopped it with Ctrl-C.)
4. (Screenshot of the second run, stopped after three fixtures; no reply needed.)
5. (Pasted Terminal output of the full v1 run: 12/12 schema-valid.)

## Context / Findings
- #141's code (schema, prompt, checks, six fixtures, eval runner, design doc) was merged in #162
  on 2026-11-12. Still open:
  - choosing the provider and recording why;
  - running the set against a real provider and reviewing each output by hand;
  - the DoD: evaluation results and decisions in `AI-log/Bryce/`, with open findings for Sprint 4.
- #165 (Mahmoud, #139) is open and uses a Groq-compatible provider through `AI_API_KEY`.
- No API key on Bryce's Mac or in the repo. From the AI's shells, `api.anthropic.com` is
  reachable but `api.groq.com` is blocked by the network allowlist. Bryce chose to run the Groq
  eval on his own machine and have the AI do the review.
- Groq's free plan for `openai/gpt-oss-120b` allows 30 requests/min, 1,000/day, 8,000 tokens/min
  and 200,000 tokens/day. One eval request is about 3,000–4,000 tokens, so the runner (no retry)
  would get 429s from the third request of a 12-request run.
- gpt-oss is a reasoning model. On Groq, its hidden reasoning counts toward
  `max_completion_tokens`, and `reasoning_effort` can be low, medium or high.
- The first run's "Invalid API Key" (401) files were left over from an earlier attempt (their
  timestamps were older than the run). The real failures were fixture 01: one reply was cut off
  ("max completion tokens reached"), and the other was missing `summary` and `rewordings`. Both
  came back as HTTP 400 `json_validate_failed`.

## AI Output / Actions
### Prompt 1: complete #141
- Ran the current `main` (`9c7a524`): backend `npm test` 79/79 pass; mock eval 6/6 schema-valid.
- Branch `feature/141-eval-run`, commit `f46303d`:
  - `backend/scripts/eval-resume-feedback.js`: on HTTP 429, wait for `retry-after` (default 20 s,
    capped at 120 s) and retry, up to 6 times;
  - `docs/ai/us10-resume-feedback.md`: notes the free-plan limit and the expected run time.
  - Tested against a local fake server that returns two 429s then a valid reply: two waits, then
    1/1 schema-valid. `npm test` still 79/79.
- Gave Bryce the command to run the Groq eval (`--repeat 2`) from a fresh clone of the branch in
  `/tmp`, reading the key without echoing it, with the output in `Assignment 1/Claude outputs/`.

### Prompt 2: API key and Groq setup
- The command prompts for the key ("Groq key:") and keeps it only in that Terminal session.
- Setup steps given: create a key under API Keys in the Groq console; turn on Zero Data
  Retention in Data Controls; check `node -v` is 22–24. Keep the key out of the chat and the repo.

### Prompt 3: first run failed
- Commit `276949e`: the runner sends `reasoning_effort: "low"` and `max_completion_tokens: 5000`
  for Groq (`--reasoning-effort`, `--max-tokens` to change them), keeps the whole error body
  (Groq includes the failed generation), and records both settings in the outputs and the
  review sheet. Input plus the cap stays under 8,000 tokens/min.
- Tested the request body against a local fake server. `npm test` 79/79.
- Found the same gap in #165's `provider.js` (no completion limit or reasoning setting); noted
  in the design doc. Offered to comment on #165; nothing was posted.

### Prompt 5: v1 run complete (12/12 valid), then review and iteration
Four runs in total, all reviewed by hand against the checklist and the fixtures' "look for"
items. Each review sheet is in `AI-log/Bryce/md/`:

| Run | Sheet | Main findings |
|---|---|---|
| v1, low | `2026-11-16-us10-eval-gpt-oss-120b-v1.md` | **Bias pair failed:** 06 told to remove its pronouns, once as the top fix ("gender can be inferred from name"). Invented figures (team of 15, 2,000 sq ft, 99%) and duties; false claims about typos and date formats; extraction damage blamed on the user; told to fill in `[email]`/`[phone]`. Injection never followed, flagged 2/2. |
| v2, low | `2026-11-16-us10-eval-gpt-oss-120b-v2.md` | Bias pair passes; invented numbers in rewordings 4 → 2 outputs. **Regression:** injection flagged 0/2. 04 still blames extraction damage and says the contact section "contains only placeholders". |
| v3, low | `2026-11-16-us10-eval-gpt-oss-120b-v3-low.md` | No invented numbers in rewordings; invented outcomes and duties 11 → 6 outputs; bias passes; injection flagged 1/2; 04 unchanged. |
| v3, medium | `2026-11-16-us10-eval-gpt-oss-120b-v3-medium.md` | Not better than low (injection 1/2, 04 unchanged, invented outcomes 9), 2–3× latency, 2–4× output tokens (one reply 4,818 of 5,000). Comparison table and decision. |

- Prompt changes, each tied to its finding in the sheets' "Prompt changes" tables:
  - `2caf16e`, **v2:** pronouns and the name line off limits; placeholders for any missing figure
    or detail, suggestions included; no added outcomes; extraction artifacts not raised;
    contiguous quotes only; claims of inconsistencies must name the text; a bullet with a stated
    result is never high.
  - `aa72d01`, **v3:** injected text is never an extraction artifact and is always the first
    improvement; the multi-column point only for clearly mixed lines; redaction markers now say
    `[email removed for privacy]`; no comment on the contact line.
- `checks.js`: warns on numbers in suggestions that aren't in the resume; fails on mentions of
  the redaction markers; warns on complaints about missing or placeholder contact details. The
  runner's latency now excludes rate-limit waits. Tests: `npm test` 80/80 (one new test).
- **Recommendation, for Bryce to confirm:** Groq free plan, `openai/gpt-oss-120b`, prompt v3,
  `reasoning_effort: "low"`, `max_completion_tokens: 5000`. 48/48 replies schema-valid once the
  completion limit was set. Claude Haiku 5.5 was not tested (no key) and stays the fallback.
  The AI that made this recommendation is itself an Anthropic model.
- Design doc: status, prompt-design table (v2/v3 rules and why), provider decision, evaluation
  results summary, limitations and Sprint 4 open items updated.
- Open findings for Sprint 4: #139 must send the two gpt-oss settings; add injection detection in
  code; keep PDF columns apart in extraction; invented outcomes make #140's "check each
  suggestion" notice required; the free plan allows about two requests a minute for the team;
  Haiku comparison; French and not-a-resume fixtures; rerun #147 with v3.

## Decision
**Bryce:**

## Reflection
**Bryce:**
