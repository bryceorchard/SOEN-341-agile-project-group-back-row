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
  - Frontend: recent Node (see `frontend/.tool-versions`)
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
npm starm
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
