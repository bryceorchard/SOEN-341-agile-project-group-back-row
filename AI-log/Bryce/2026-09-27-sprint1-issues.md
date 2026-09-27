# AI Interaction Log

**Author:** Bryce
**Date:** 2026-09-27
**AI Tool:** Claude (Cowork)

## Task / Prompt
Using the team role breakdown (from Discord) and the Sprint 1 project outline, create
the next set of GitHub issues for the CareerConnect repo.

## Context / Findings
- Read the Sprint 1 outline (SOEN341_CareerConnect_Project_Sprint1.docx). Key requirements:
  minimum 15 user stories as GitHub Issues with associated tasks and labels; plus GitHub
  setup, README, sprint planning, team process (DoR/DoD), AI usage log, meeting minutes,
  and a demo of two basic features. Rubric weights User Stories (3.0) and Sprint Planning
  (3.0) most heavily.
- Existing issues #1 (DB schema) and #2 (backend API) already cover the auth/profile/resume
  backend, so the new set references them rather than duplicating.
- Team roles: Bryce (scrum lead/process), Gene (docs), Zohair (requirements), Mahmoud/@meh
  (backend), Gabriel (frontend), Luca (integration & QA).
- Chosen approach (confirmed with Bryce): full Sprint 1 set, delivered as a runnable
  `gh issue create` script.

## AI Output / Actions
- Produced `create-sprint1-issues.sh`: a GitHub CLI script that
  - creates the label set (type / area / priority / sprint) and a "Sprint 1" milestone,
  - creates 17 user stories (US-01..US-17) covering the whole CareerConnect backlog —
    Sprint 1 stories for auth/profile/resume (tied to #1/#2, frontend tasks to Gabriel)
    and backlog stories for job posting, search, apply, status tracking, dashboard, saved
    jobs, notifications, recruiter flows, and two AI features,
  - creates 12 process/docs/QA task issues mapped to owners (GitHub setup, team process,
    sprint plan + Appendix A, README, submission doc, minutes, AI-generated stories log,
    team-generated stories, AI Log structure, CI, tests, demo prep).
- Assignees are variables at the top of the script (only bryceorchard known); blank ones
  create issues unassigned. Backlog stories intentionally unassigned.
- Script is idempotent for labels/milestone; issue creation should be run once.

## Decision


## Reflection

