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
Run: `npm start` (http://localhost:3000, override with `PORT`). Tests: `npm test` (`npm run test:coverage` adds a coverage report, as CI does).
Env: `JWT_SECRET` (set in production), `CORS_ORIGIN` (default `http://localhost:4200`), `DB_PATH`, `UPLOAD_DIR`, `DEADLINE_REMINDER_DAYS` (default `3`).
AI resume feedback (#139): `AI_API_KEY` (never committed), `AI_MODEL` (default `openai/gpt-oss-120b`), `AI_BASE_URL` (default Groq's OpenAI-compatible endpoint, `https://api.groq.com/openai/v1`), `AI_PROVIDER` (set to `mock` to get a fixed sample reply without calling out; the tests set it themselves). With neither a key nor `AI_PROVIDER=mock`, `POST /resumes/:id/feedback` returns 503 rather than fake feedback. For local development without a key: `AI_PROVIDER=mock npm run dev`. See `.env.example`.

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
| GET    | `/jobs/:id/applications` | query: `status?`, `from?`, `to?` (`YYYY-MM-DD`, inclusive, on the applied date; all filters combine) | 200 `{ applications }` (owning recruiter only; 404 otherwise; 400 for an invalid date or `from` after `to`) |
| GET    | `/jobs/:id/applications/:applicationId` | –                            | 200 `{ application, candidate, otherApplications }` (owning recruiter only; 404 for other recruiters or an application not on this posting, 403 for job seekers) |
| POST   | `/jobs`        | `{ title, description, location?, category?, deadline? }` (recruiter only; optional fields are trimmed strings) | 201 `{ job }` (403 if not a recruiter) |
| PUT    | `/jobs/:id`    | same body as POST (owning recruiter only)             | 200 `{ job }` (404 if not yours)    |
| PATCH  | `/jobs/:id/status` | `{ status }` one of open/closed (owning recruiter only) | 200 `{ job }` (404 if not yours) |
| PATCH  | `/jobs/:id/archive` | –                                                | 200 `{ job }` (owning recruiter only; 404 if not yours, 403 if not a recruiter) |
| PATCH  | `/jobs/:id/unarchive` | –                                              | 200 `{ job }` (owning recruiter only; 404 if not yours, 403 if not a recruiter) |
| POST   | `/applications`     | `{ jobId, resumeId? }`                           | 201 `{ application }` (409 if already applied, 400 if the posting is closed or archived) |
| GET    | `/applications`     | query: `status?`                                 | 200 `{ applications }` (current user's own) |
| PATCH  | `/applications/:id` | `{ status }` one of Applied/Under Review/Interview/Offered/Rejected (recruiter who owns the job only) | 200 `{ application }` |
| GET    | `/applications/stats` | –                                              | 200 `{ stats }` (analytics over the current user's own applications) |
| GET    | `/applications/:id/history` | –                                        | 200 `{ history }`, oldest first (the applicant, or the recruiter who owns the job; 404 otherwise) |
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
Application analytics (#134, US-21): `stats` = `{ total, byStatus, submittedLast7Days, submittedLast30Days, responded, responseRate, perWeek, postings }`.
`byStatus` is `[{ status, count, percent }]` for all five statuses in pipeline order; `responded` is how many applications have ever had a
status other than Applied, and `responseRate` is that as a percentage of `total`; `perWeek` is `[{ weekStart, count }]` for the last 8
weeks, oldest first, weeks starting Monday (UTC) and the last one being the current week; `postings` = `{ open, closed }`, where a posting
counts as open if it is open and not archived. Percentages are rounded to one decimal and are `0` when there are no applications.
Computed in `src/application-stats.js`. A `history` entry is `{ status, changedAt, changedBy }`, where `changedBy` is `applicant`,
`recruiter`, or `null` for rows backfilled by `db/migrate.js` (one per application that had no history, its current status).
Every status write goes through `recordStatus()` / `changeStatus()` in `src/routes/applications.js`; `changeStatus()` also sends the
status notification, and re-saving the status an application already has records and sends nothing.
An entry from `/jobs/:id/applications` is shaped `{ id, applicantEmail, applicantName, applicantHeadline, resumeId, resumeFilename, status, appliedAt }`.
The candidate review (`/jobs/:id/applications/:applicationId`) returns `application` = `{ id, jobId, status, appliedAt, updatedAt, resumeId, resumeFilename }`
(open the resume with `GET /resumes/:resumeId/file`), `candidate` = `{ email, fullName, headline, location, phone, bio }`, and
`otherApplications` = `[{ id, jobId, jobTitle, jobStatus, status, appliedAt }]`: the same candidate's other applications to this recruiter's postings only.
`notification` = `{ id, type, title, message, link, jobId, applicationId, read, readAt, createdAt }`, where `type` is one of
`status_update`, `interview_invite`, `new_application`, `deadline_reminder`. Created by `notify(db, {...})` in `src/notify.js`, the
one place every trigger (a status change, a new application, a deadline reminder) goes through.
Deadline reminders (`src/deadline-reminders.js`) are generated whenever `GET /notifications` or `GET /notifications/unread-count`
is called, so no scheduler is needed: an open, unarchived posting whose deadline is within `DEADLINE_REMINDER_DAYS` calendar days
(deadline day included) gets one `deadline_reminder` for its recruiter and one for each applicant not Rejected or Offered, never
twice for the same user and posting.
`feedback` (resume feedback) = `{ resumeId, createdAt, model, promptVersion, isResume, summary, strengths, improvements, rewordings }`.
See [`docs/ai/us10-resume-feedback.md`](../docs/ai/us10-resume-feedback.md) for what each field means and the full design. Text is
extracted from the stored PDF/DOC/DOCX in `src/ai/extract-text.js`; the prompt and schema (#141) live in `src/ai/prompt.js` and
`src/ai/feedback-schema.js`; the provider call is `src/ai/provider.js` (the real service with `AI_API_KEY`, the fixed reply in
`src/ai/mock-feedback.json` with `AI_PROVIDER=mock`); each user is limited to a few requests per minute (`src/ai/rate-limit.js`).
Replacing a resume's file (`PUT /resumes/:id`) deletes its feedback, since it described the old file.
