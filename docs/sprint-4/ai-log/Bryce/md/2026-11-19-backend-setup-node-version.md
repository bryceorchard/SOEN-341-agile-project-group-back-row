# AI Interaction Log

**Author:** Bryce
**Date:** 2026-11-19
**AI Tool:** Claude (Cowork)
**chat url:** <https://claude.ai/code/session_01FY2WCR2RWJSfuDukER3CVJ>

## Task / Prompt
1. "Can you figure out why the backend setup and start isn't working?" (local clone on Bryce's Mac, `main` at `c922463`).

## Context / Findings
- `backend/node_modules/better-sqlite3/build/Release/` has `sqlite3.a` but no `better_sqlite3.node`. The native
  addon never finished building, so anything that opens the DB (`db:migrate`, `db:seed`, `npm start`) fails.
- `build/config.gypi` shows the build ran against Node **26.13.1** (`node_module_version` 147, darwin arm64).
  The project requires Node 22: `backend/.nvmrc` is `22` and `engines` is `>=22 <25`.
- `better-sqlite3@11.10.0` publishes darwin-arm64 prebuilds only for ABI 108 / 115 / 127 / 131 (Node 18–23).
  Node 26 has no prebuild, so npm falls back to compiling from source with node-gyp. The compile of
  `src/better_sqlite3.cpp` did not complete (only its `.d.raw` dependency file exists, no `.o`).
- The working copy has uncommitted changes from the failed attempts: `backend/package.json` gained an
  `allowScripts` block for `better-sqlite3@11.10.0`, and `backend/package-lock.json` bumped `body-parser`
  2.3.0→2.4.0, `multer` 2.4.0→2.5.0 and `qs` 6.16.0→6.17.1 (from `npm install` instead of `npm ci`). Neither
  change is needed on Node 22.
- Control: a fresh clone of `c922463` on Node 22.23.5 / npm 10.9.9 ran `npm ci`, `npm run db:reset` and
  `npm start` without errors; `GET /jobs` returned the seeded jobs. `npm test`: 162/162 pass.

## AI Output / Actions
- Inspected the local clone read-only (git status/diff, `node_modules/better-sqlite3/build`, `config.gypi`).
  Nothing in the local clone was changed.
- Reproduced the working setup on Node 22 in a separate fresh clone and checked the better-sqlite3 v11.10.0
  release assets through the GitHub API.
- Fix handed to Bryce: switch the Mac to Node 22 (`nvm install 22 && nvm use`, or Homebrew `node@22`), revert
  `backend/package.json` and `backend/package-lock.json`, delete `backend/node_modules`, then
  `npm ci && npm run db:reset && npm start`.
- Noted as an option, not done: upgrading `better-sqlite3` to a release with Node 26 prebuilds and widening
  `engines` would remove the pin, but it is a dependency change for the team to decide on.

## Decision


## Reflection

