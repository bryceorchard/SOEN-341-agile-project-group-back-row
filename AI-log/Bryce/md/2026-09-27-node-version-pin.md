# AI Interaction Log

**Author:** Bryce
**Date:** 2026-09-27
**AI Tool:** Claude (Cowork)

## Task / Prompt
The backend tests (PR #4) wouldn't run locally. Diagnose why, get them passing, and pin
the Node version so the team doesn't hit the same wall.

## Context / Findings
- `npm test` failed on a fresh checkout: first `Cannot find package 'supertest'` (deps not
  installed), then, after `npm install`, `Could not locate the bindings file` and finally
  `slice is not valid mach-o file` for better-sqlite3's native binding.
- Root cause was the Node version, not the PR. Node had been installed via `brew install
  node`, which gave Node 26. `better-sqlite3@11.10.0` has no prebuilt binary for Node 26
  and its source fails to compile against Node 26's V8 (`no member named 'GetPrototype' /
  'GetIsolate' / 'This'`). The current library (13.0.3) also declares `engines: >=22`.
- A secondary issue: the project lives on an iCloud path containing spaces, which broke
  node-gyp's shell invocation during the source-compile fallback.
- An earlier AI attempt to "rebuild" the binding ran in a Linux helper VM and produced a
  Linux binary, which macOS then rejected — a reminder that native modules are per-platform
  and must be verified on the target OS.

## AI Output / Actions
- Walked through removing the bad setup: delete `backend/node_modules`, `git restore
  package.json` (npm had injected an `allowScripts` block), `brew uninstall node`, and
  clear the npm / node-gyp caches.
- Recommended running the project on Node 22 LTS via nvm. Confirmed by Bryce: on Node 22
  `npm install` uses the prebuilt binary (no compile, no allowScripts step needed) and all
  7 tests pass.
- Pinned the runtime on the branch to prevent recurrence:
  - Added `backend/.nvmrc` = `22`.
  - Added `"engines": { "node": ">=22 <25" }` to `backend/package.json`.
- Decided the `install-scripts approve` step does NOT belong in the README, since it was
  only a symptom of being on Node 26 and is unnecessary on Node 22.

## Decision
**Bryce:** Followed the cleanup steps, moved back to Node 22 LTS via nvm, and confirmed the install and all seven tests pass. Pinned it with .nvmrc and the engines field so nobody else hits the same wall. Left the install-scripts approve step out of the README since it was only a symptom of being on Node 26.

## Reflection
**Bryce:** This was a good lesson in native modules being tied to a specific platform and Node version — the earlier attempt that built a Linux binary on a macOS project made that really clear. I now understand why pinning the runtime matters on a shared repo instead of just letting everyone run whatever brew gave them.
