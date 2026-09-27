# AI log documentation and format specification

Every AI-assisted interaction on this project gets its own log entry, committed
as a markdown file under `AI-log/<YourName>/<filename>.md`.

## Format

Each log entry is a markdown file with a header block followed by five sections:

```
# AI Interaction Log

**Author:** <your name>
**Date:** <YYYY-MM-DD>
**AI Tool:** <e.g. Claude (Cowork), ChatGPT, Copilot>

## Task / Prompt
What you asked the AI to do and the goal behind it.

## Context / Findings
Relevant background, repo state, files consulted, and anything the AI or you
discovered along the way.

## AI Output / Actions
What the AI produced or did — suggested code, commands, drafts, explanations,
decisions it flagged for the team.

## Decision
**<your name>:** What you decided to do with the AI's output — accept, modify,
reject — and any verification you performed. (Filled in by you, not the AI.)

## Reflection
**<your name>:** What you learned or would do differently. (Filled in by you,
not the AI.)
```

## Conventions

- **Filename:** `YYYY-MM-DD-short-description.md` (e.g. `2026-09-25-database-schema-issue.md`).
- **One file per interaction.** Keep each entry focused on a single task or question.
- **Decision and Reflection are yours to write.** The AI leaves these empty (aside
  from the `**<name>:**` label); you and the team fill them in yourselves.
- **Prefix the author's name** on the Decision and Reflection lines so it's clear
  who wrote them.
