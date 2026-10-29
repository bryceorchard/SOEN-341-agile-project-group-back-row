# CareerConnect

**SOEN 341 - Agile Project (Group: back-row)**

CareerConnect is a web-based platform that streamlines job seeking and recruiting in one place. Job seekers can build a profile, upload and manage resumes, search and filter jobs, and track their applications through each stage. Recruiters can post and manage job listings and review candidates. The goal is to replace the scattered, multi-channel job hunt with a single organized workflow for both sides of the market.

## Table of Contents

- [CareerConnect](#careerconnect)
  - [Table of Contents](#table-of-contents)
  - [Team](#team)
  - [Project Overview](#project-overview)
    - [Problem](#problem)
    - [Solution](#solution)
  - [Tech Stack](#tech-stack)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Backend setup and start](#backend-setup-and-start)
    - [Frontend setup and start](#frontend-setup-and-start)
    - [Configuration](#configuration)
  - [Features](#features)
  - [File Structure](#file-structure)

## Team

| Member  | GitHub                    | Role                  | Responsibilities                                                                                   |
| ------- | ------------------------- | --------------------- | -------------------------------------------------------------------------------------------------- |
| Bryce   | @bryceorchard             | Scrum lead / process  | GitHub setup, project board, labels, team process (branching, PRs, DoR/DoD), sprint planning, Appendix A |
| Gene    | @GeneFeng1                | Documentation         | README, cover page, submission document, meeting minutes template, upkeep                          |
| Zohair  | @ZA-Error                 | Requirements          | User stories, team brainstorm, "Team-Generated User Stories and Features", issue tracking          |
| Mahmoud | @MahmoudAbdalla28         | Backend               | DB schema, auth API (signup/login), profile and resume backend                                     |
| Gabriel | @gabibdods                | Frontend / UI         | Registration/login UI, profile/resume upload UI                                                    |
| Luca    | @lucamancini2005-design   | Integration & QA      | CI setup, tests for both features, demo prep, AI log structure and contribution log                |

## Project Overview

### Problem

Job seeking is a fragmented process spread across many channels — third-party job boards, company websites, in-person paper submissions. Recruiting has the same problem in reverse: finding a suitable candidate among many qualified applicants takes many attempts across many people and groups. The result is wasted effort on both sides.

### Solution

CareerConnect brings both sides into one platform. Job seekers create a profile, upload and manage resumes, track application submissions and their status, and search and filter for jobs. Recruiters post and manage listings and review applicants. The platform centralizes the organization and management of a job search or hiring effort in a single place.

## Tech Stack

| Layer          | Technology                                                        |
| -------------- | ---------------------------------------------------------------- |
| Frontend       | Angular 22, TypeScript                                            |
| Backend        | Express 5 (Node.js)                                              |
| Database       | SQLite (via `better-sqlite3`)                                     |
| Authentication | JSON Web Tokens (session/tokens) + bcrypt (password hashing)      |
| CI/CD          | GitHub Actions                                                    |

## Getting Started

### Prerequisites

- **git**
- **Node.js** — the backend and frontend pin their own versions:
  - Backend: Node 22 (see `backend/.nvmrc`; requires `>=22 <25`)
  - Frontend: Node `^22.22.3`, `^24.15` or `>=26` (Angular 22's requirement; CI uses Node 24). `frontend/CareerConnect/.tool-versions` pins one for asdf users.
- A Node version manager (**nvm** recommended) so you can switch between them.

### Backend setup and start

```
cd backend
nvm install --lts   # Windows: nvm install lts
nvm use             
npm install
npm run db:migrate  # create tables
npm run db:seed     # add demo users (password: Password123!)
npm test            # optional: run the test suite
npm start
```

### Frontend setup and start
In a second terminal:

```
cd frontend/CareerConnect
npm install
npm start
```

### Configuration

The backend reads these environment variables (all optional in development):

- `PORT` — API port (default `3000`)
- `CORS_ORIGIN` — allowed frontend origin (default `http://localhost:4200`)
- `JWT_SECRET` — token signing secret (**must** be set in production)
- `DB_PATH` — SQLite file location (default `backend/data/careerconnect.db`)
- `UPLOAD_DIR` — resume upload directory (default `backend/uploads/`)

See [`backend/README.md`](backend/README.md) for the full API reference and database notes, and [`docs/ERD.md`](docs/ERD.md) for the data model.

## Features

- User registration, authentication, and profile management
- Resume upload and management
- Job posting management for recruiters
- Job search and filtering
- Job application submission
- Application status tracking (Applied, Interview, Offered, Rejected)
- Application history dashboard
- Notifications and reminders for application deadlines
- Saved jobs and favourites

## File Structure

General file structure of the major folders and salient files. Folders marked _git-ignored_ are
created locally and aren't in the repository.

```text
SOEN-341-agile-project-group-back-row/
├── .github/
│   ├── workflows/
│   │   └── ci.yml                     # GitHub Actions: backend and frontend jobs (install, test, build)
│   └── PULL_REQUEST_TEMPLATE.md       # PR checklist (Definition of Done)
├── AI-log/                            # Individual AI usage logs, one folder per member (#99)
│   ├── Bryce/
│   ├── Gabriel/
│   ├── Gene/
│   ├── Luca/
│   ├── Mahmoud/
│   └── Zohair/
├── backend/                           # Express 5 API with a SQLite database
│   ├── db/
│   │   ├── schema.sql                 # Table definitions
│   │   ├── migrate.js                 # npm run db:migrate
│   │   └── seed.js                    # npm run db:seed (demo users, profiles, jobs, applications)
│   ├── src/
│   │   ├── routes/                    # auth, profile, resumes, jobs, applications
│   │   ├── app.js                     # Express app: middleware and routes
│   │   ├── server.js                  # Entry point (npm start)
│   │   ├── config.js                  # Environment variables and defaults
│   │   ├── middleware.js              # JWT authentication and role checks
│   │   └── errors.js                  # HTTP error type
│   ├── test/                          # Backend tests (npm test)
│   ├── data/                          # SQLite database file (git-ignored)
│   ├── uploads/                       # Uploaded resumes (git-ignored)
│   ├── .nvmrc                         # Backend Node version
│   └── README.md                      # API reference and database notes
├── docs/
│   ├── ContributionLog/               # Contribution logs (#101)
│   │   ├── Sprint 1/
│   │   ├── Sprint2/                   # One file per member
│   │   └── contribution-template.md
│   ├── minutes/                       # Meeting minutes: attendance, decisions, action items (#27)
│   │   ├── minutes-template.md        # Template for new meetings
│   │   └── YYYY_MM_DD_Meeting_Minutes.md
│   ├── sprint-1/                      # Sprint 1 plan (backlog, priorities, work-plan table) and Appendix A
│   ├── sprint-2/                      # Sprint 2 plan (goal, ranked backlog, work plan, risks) (#98)
│   ├── user-stories/                  # Requirements, kept separate by source
│   │   ├── AI Generated User Stories/
│   │   └── Team Generated User Stories/
│   ├── CONTRIBUTING.md                # Team process: workflow, branching, PRs, review, DoR/DoD
│   ├── ERD.md                         # Entity-relationship diagram (current and planned features)
│   └── README.md                      # Layout of the docs folder
├── frontend/CareerConnect/            # Angular 22 app
│   ├── public/                        # Static assets (favicon)
│   ├── src/
│   │   ├── app/                       # Each component has .ts, .html, .css and a .spec.ts unit test
│   │   │   ├── app.ts / .html / .css      # App shell: nav bar and page outlet
│   │   │   ├── app.routes.ts              # Page routes and their guards
│   │   │   ├── app.config.ts              # Router, HTTP client and interceptor setup
│   │   │   ├── auth.service.ts            # Login state and token storage
│   │   │   ├── auth.interceptor.ts        # Adds the token to API calls; logs out on a 401
│   │   │   ├── guards.ts                  # Logged-in and role guards
│   │   │   ├── open-blob.ts               # Opens a downloaded resume in a new tab
│   │   │   ├── login.component.*          # Login and registration
│   │   │   ├── profile.component.*        # Profile and resumes
│   │   │   ├── jobs.component.*           # Job search and filters
│   │   │   ├── job-detail.component.*     # Job details and applying
│   │   │   ├── my-applications.component.*     # Job seeker's applications dashboard
│   │   │   ├── recruiter-postings.component.*  # Recruiter's postings: create, edit, close/reopen
│   │   │   └── posting-applicants.component.*  # Applicants for a posting and status updates
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css                 # Global styles
│   ├── .tool-versions                 # Frontend Node version (asdf)
│   ├── angular.json                   # Angular build and test configuration
│   ├── package.json
│   ├── tsconfig*.json                 # TypeScript configuration
│   └── README.md
├── .gitignore
├── LICENSE                            # GNU General Public License v3
└── README.md                          # This file, the primary README
```
