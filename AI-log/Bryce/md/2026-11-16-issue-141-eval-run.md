# AI Interaction Log

**Author:** Bryce
**Date:** 2026-11-16
**AI Tool:** Claude (Opus 5.5)
**chat url:** <https://claude.ai/code/session_01FY2WCUmc8nYV5LGCDxft6P>

## Task / Prompt
1. "Can you complete #141 please?"

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

## AI Output / Actions
### Prompt 1: complete #141
- Ran the current `main` (`9c7a524`): backend `npm test` 79/79 pass; mock eval 6/6 schema-valid.
- Branch `feature/141-eval-run`, commit `f46303d`:
  - `backend/scripts/eval-resume-feedback.js`: on HTTP 429, wait for `retry-after` (default 20 s,
    capped at 120 s) and retry, up to 6 times;
  - `docs/ai/us10-resume-feedback.md`: notes the free-plan limit and the expected run time.
  - Tested against a local fake server that returns two 429s then a valid reply: two waits, then
    1/1 schema-valid. `npm test` still 79/79.
- Gave Bryce the command to run the Groq eval (`--repeat 2`) from a fresh clone of the branch,
  with the output written to `Assignment 1/Claude outputs/us10-eval-groq/`.

## Decision
**Bryce:**

## Reflection
**Bryce:**
