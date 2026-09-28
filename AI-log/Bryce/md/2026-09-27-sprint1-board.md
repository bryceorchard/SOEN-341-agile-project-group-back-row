# AI Interaction Log

**Author:** Bryce
**Date:** 2026-09-27
**AI Tool:** Claude (Cowork)

## Task / Prompt
Clarify what Sprint 1 requires (only a plan vs. the whole sprint), then set up a single
"Sprint 1" GitHub project board with all issues and generate the Appendix A table.

## Context / Findings
- Clarified from the outline: Sprint 1 is a full delivery sprint, not just a plan.
  "Sprint Planning" (backlog, priorities, risks, estimates, capacity + Appendix A) is one
  of ~8 deliverables, alongside GitHub setup, README, 15+ user stories, team process,
  AI usage log, meeting minutes, and a demo of two working features.
- The spec asks for one project board (under GitHub Setup), and Appendix A is a table, not
  a second board — so a single board is sufficient and simpler than two.
- The GitHub web UI's "New label"/"New milestone" buttons were not rendering for Bryce, so
  gh (the API) is the reliable path.

## AI Output / Actions
- Produced `setup-sprint1-board.sh`:
  - creates (or reuses) a user Project named "Sprint 1",
  - adds every repo issue (open + closed, so #1/#2 are included) to the board,
  - generates the Appendix A work-plan table from the live issues (Issue #, Title, Type
    from labels, Responsible from assignees, Priority from labels, Status from open/closed)
    and writes it to appendix-a.md.
- Noted the extra step `gh auth refresh -s project` (Projects scope), that the default
  board Status column is Todo/In Progress/Done (editable in project settings), and that
  #1/#2 should be dragged to Done.

## Decision
**Bryce:** Went with a single Sprint 1 board rather than two, since the spec only asks for one and Appendix A is a table anyway. Ran the script to create the board, add every issue, and generate the appendix, then moved the closed issues into Done manually.

## Reflection
**Bryce:** Sorting out up front that Sprint 1 is a full delivery sprint and not just a planning exercise saved me from under-scoping the work. Using the gh CLI instead of the web UI was also a good fallback to learn, given the buttons weren't rendering for me.
