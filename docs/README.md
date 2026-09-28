# CareerConnect — Documentation

This folder holds the project's non-code deliverables. (Repository folder
structure, issue #22.)

## Layout

```
docs/
├── README.md                # this index
├── CONTRIBUTING.md          # team process: workflow, branching, PRs, review, DoR/DoD (#23)
├── ERD.md                   # database entity-relationship diagram
├── minutes/                 # meeting minutes (attendance, decisions, action items) (#27)
│   ├── minutes-template.md  # blank template for new meetings
│   └── WeeklyMinutes.md     # running weekly minutes log
├── sprint-1/                # Sprint 1 deliverables (#24)
│   ├── sprint-1-plan.md     # backlog, priorities, risks, effort, capacity
│   └── appendix-a.md        # Sprint 1 work-plan table
└── user-stories/            # requirements — AI- and team-sourced kept separate (#28, #29)
    ├── AI Generated User Stories/
    │   └── Zohair AI LOG.pdf
    └── Team Generated User Stories/
        └── Team-Generated User Stories and Features.pdf
```

- **Documentation** lives in `docs/`.
- **Minutes** live in `docs/minutes/` — use `minutes-template.md` for each new meeting;
  `WeeklyMinutes.md` is the running log.
- **User stories** live in `docs/user-stories/`, with AI-generated and team-generated
  content in **separate** folders so the two sources are never mixed (assignment requirement).
- **Sprint deliverables** live in `docs/sprint-<n>/`.
- **AI usage logs** are kept per member under `AI-log/<Name>/` at the repo root
  (per-interaction markdown entries plus each member's Sprint PDF).
