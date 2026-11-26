# CareerConnect — Documentation

This folder holds the project's non-code deliverables. (Repository folder
structure, issue #22.)

## Layout

```
docs/
├── README.md                # this index
├── CONTRIBUTING.md          # team process: workflow, branching, PRs, review, DoR/DoD (#23)
├── ERD.md                   # database entity-relationship diagram
├── refactor-proposal.md     # repository restructure proposal (#166, #206)
├── ai/
│   └── us10-resume-feedback.md  # AI resume feedback: schema, prompt, provider, evaluation, privacy notice (#141)
├── sprint-N/                # one folder per sprint (sprint-1 … sprint-4)
│   ├── plan.md              # sprint plan: goal, ranked backlog / work plan, capacity, risks (#24, #98, #148)
│   ├── minutes/             # meetings held during the sprint (#27)
│   │   └── YYYY_MM_DD_Meeting_Minutes.md
│   ├── contributions/       # one contribution log per member (#101, #151)
│   │   └── <Name>-sprintN-contribution.md
│   └── ai-log/              # AI usage logs for the sprint, one folder per member (#99)
│       └── <Name>/
├── templates/
│   ├── minutes-template.md       # blank template for a new meeting
│   └── contribution-template.md  # template for each member's contribution log
└── user-stories/            # requirements — AI- and team-sourced kept separate (#28, #29)
    ├── AI Generated User Stories/
    │   └── Zohair AI LOG.pdf
    └── Team Generated User Stories/
        └── Team-Generated User Stories and Features.pdf
```

Sprint 1 also has `appendix-a.md` (the Sprint 1 work-plan table).

Files go in the sprint they were written in, by date: Sprint 1 to 2026-09-28, Sprint 2 to
2026-10-29, Sprint 3 to 2026-11-16, Sprint 4 from 2026-11-17. A log that runs across sprints
(for example Mahmoud's `AI Log Entries.md`) lives in the latest sprint it was updated in.
