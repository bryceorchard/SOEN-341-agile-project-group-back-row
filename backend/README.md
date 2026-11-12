# CareerConnect Backend

## Database
- **DBMS:** SQLite (via `better-sqlite3`). Zero setup for dev and demo, single file, easy to swap for PostgreSQL later.
- **Resume storage:** files on disk under `uploads/`; the `resumes` table stores the path and metadata only.
- **ERD:** see [`docs/ERD.md`](../docs/ERD.md).

## Setup
```
cd backend
npm install
npm run db:migrate   # create tables from db/schema.sql
npm run db:seed      # demo users (password: Password123!), 14 jobs across 2 recruiters, and demo applications
npm run db:reset     # wipe + migrate + seed
```
The database file is created at `backend/data/careerconnect.db` (gitignored). Override with `DB_PATH`.

## API
Run: `npm start` (http://localhost:3000, override with `PORT`). Tests: `npm test`.
Env: `JWT_SECRET` (set in production), `CORS_ORIGIN` (default `http://localhost:4200`), `DB_PATH`, `UPLOAD_DIR`.
AI resume feedback (#139): `AI_API_KEY` (never committed; unset in dev and CI, which uses a deterministic mock reply instead of calling out), `AI_MODEL` (default `openai/gpt-oss-120b`), `AI_BASE_URL` (default Groq's OpenAI-compatible endpoint, `https://api.groq.com/openai/v1`). See `.env.example`.

Errors are always `{ "error": "message" }` with status 400 / 401 / 404 / 409.
Protected routes need `Authorization: Bearer <token>`.

| Method | Route          | Body                                                  | Success                             |
| ------ | -------------- | ----------------------------------------------------- | ----------------------------------- |
| POST   | `/auth/signup` | `{ email, password (min 8), role? }`                  | 201 `{ user }` (409 if email taken) |
| POST   | `/auth/login`  | `{ email, password }`                                 | 200 `{ token, user }`               |
| POST   | `/auth/logout` | –                                                     | 204 (client discards token)         |
| GET    | `/auth/me`     | –                                                     | 200 `{ user }`                      |
| GET    | `/profile`     | –                                                     | 200 `{ profile }`                   |
| PUT    | `/profile`     | any of `{ fullName, headline, location, phone, bio }` | 200 `{ profile }`                   |
| POST   | `/resumes`     | multipart field `resume` (PDF/DOC/DOCX, max 5 MB)     | 201 `{ resume }`                    |
| GET    | `/resumes`     | –                                                     | 200 `{ resumes }`                   |
| PUT    | `/resumes/:id` | multipart field `resume` (replaces the file)          | 200 `{ resume }`                    |
| GET    | `/resumes/:id/file` | –                                                | 200 file stream, `inline` with the original filename (owner or a recruiter whose job this resume was submitted to; 404 otherwise) |
| DELETE | `/resumes/:id` | –                                                     | 204                                 |
| GET    | `/jobs`        | query: `keyword?`, `location?`, `category?`           | 200 `{ jobs }` (no auth required, closed and archived postings excluded) |
| GET    | `/jobs/categories` | –                                                  | 200 `{ categories }` (distinct, open + non-archived postings only; no auth required) |
| GET    | `/jobs/mine`   | query: `view?` (`active` default, or `archived`)      | 200 `{ jobs }` (recruiter's own, with `applicationCount` and `statusCounts`) |
| GET    | `/jobs/:id`    | –                                                     | 200 `{ job }` (no auth required)    |
| GET    | `/jobs/:id/applications` | query: `status?`                            | 200 `{ applications }` (owning recruiter only; 404 otherwise) |
| POST   | `/jobs`        | `{ title, description, location?, category?, deadline? }` (recruiter only; optional fields are trimmed strings) | 201 `{ job }` (403 if not a recruiter) |
| PUT    | `/jobs/:id`    | same body as POST (owning recruiter only)             | 200 `{ job }` (404 if not yours)    |
| PATCH  | `/jobs/:id/status` | `{ status }` one of open/closed (owning recruiter only) | 200 `{ job }` (404 if not yours) |
| PATCH  | `/jobs/:id/archive` | –                                                | 200 `{ job }` (owning recruiter only; 404 if not yours, 403 if not a recruiter) |
| PATCH  | `/jobs/:id/unarchive` | –                                              | 200 `{ job }` (owning recruiter only; 404 if not yours, 403 if not a recruiter) |
| POST   | `/applications`     | `{ jobId, resumeId? }`                           | 201 `{ application }` (409 if already applied, 400 if the posting is closed or archived) |
| GET    | `/applications`     | query: `status?`                                 | 200 `{ applications }` (current user's own) |
| PATCH  | `/applications/:id` | `{ status }` one of Applied/Under Review/Interview/Offered/Rejected (recruiter who owns the job only) | 200 `{ application }` |
| GET    | `/notifications`      | query: `unread?` (`true` to only show unread)   | 200 `{ notifications }` (current user's own, newest first) |
| GET    | `/notifications/unread-count` | –                                        | 200 `{ count }` (current user's own) |
| PATCH  | `/notifications/read-all` | –                                          | 200 `{ count: 0 }` (marks all of the current user's notifications read) |
| PATCH  | `/notifications/:id/read` | –                                          | 200 `{ notification }` (recipient only; 404 otherwise) |
| POST   | `/resumes/:id/feedback` | –                                             | 201 `{ feedback }`, replacing any earlier feedback for that resume (owner only; 404 otherwise; 422 no readable text or not a resume; 429 too many requests; 502 the AI reply failed validation; 503 the AI service is unavailable or timed out) |
| GET    | `/resumes/:id/feedback` | –                                             | 200 `{ feedback }`, or `{ feedback: null }` if none has been generated yet (owner only; 404 otherwise) |

`user` = `{ id, email, role, createdAt }`; `resume` = `{ id, originalFilename, fileType, uploadedAt }`;
`job` = `{ id, recruiterId, title, description, location, category, deadline, status, archivedAt, createdAt }` (`/jobs/mine` adds `applicationCount` and
`statusCounts`, an object with every application status mapped to its count for that posting, e.g. `{ "Applied": 2, "Under Review": 0, ... }`);
`application` = `{ id, jobId, jobTitle, jobLocation, jobCategory, jobDeadline, jobStatus, resumeId, resumeFilename, status, appliedAt, updatedAt }`.
An entry from `/jobs/:id/applications` is shaped `{ id, applicantEmail, applicantName, applicantHeadline, resumeId, resumeFilename, status, appliedAt }`.
`notification` = `{ id, type, title, message, link, jobId, applicationId, read, readAt, createdAt }`, where `type` is one of
`status_update`, `interview_invite`, `new_application`, `deadline_reminder`. Created by `notify(db, {...})` in `src/notify.js`, the
one place every trigger (a status change, a new application, and eventually deadline reminders in #137) goes through.
`feedback` (resume feedback) = `{ resumeId, createdAt, model, promptVersion, isResume, summary, strengths, improvements, rewordings }`.
See [`docs/ai/us10-resume-feedback.md`](../docs/ai/us10-resume-feedback.md) for what each field means and the full design. Text is
extracted from the stored PDF/DOC/DOCX in `src/ai/extract-text.js`; the prompt and schema (#141) live in `src/ai/prompt.js` and
`src/ai/feedback-schema.js`; the provider call is `src/ai/provider.js` (mock unless `AI_API_KEY` is set); each user is limited to a
few requests per minute (`src/ai/rate-limit.js`).
