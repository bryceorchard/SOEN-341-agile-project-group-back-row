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
npm run db:seed      # demo users (password: Password123!)
npm run db:reset     # wipe + migrate + seed
```
The database file is created at `backend/data/careerconnect.db` (gitignored). Override with `DB_PATH`.

## API
Run: `npm start` (http://localhost:3000, override with `PORT`). Tests: `npm test`.
Env: `JWT_SECRET` (set in production), `CORS_ORIGIN` (default `http://localhost:4200`), `DB_PATH`, `UPLOAD_DIR`.

Errors are always `{ "error": "message" }` with status 400 / 401 / 404 / 409.
Protected routes need `Authorization: Bearer <token>`.

| Method | Route | Body | Success |
|---|---|---|---|
| POST | `/auth/signup` | `{ email, password (min 8), role? }` | 201 `{ user }` (409 if email taken) |
| POST | `/auth/login` | `{ email, password }` | 200 `{ token, user }` |
| POST | `/auth/logout` | – | 204 (client discards token) |
| GET | `/auth/me` | – | 200 `{ user }` |
| GET | `/profile` | – | 200 `{ profile }` |
| PUT | `/profile` | any of `{ fullName, headline, location, phone, bio }` | 200 `{ profile }` |
| POST | `/resumes` | multipart field `resume` (PDF/DOC/DOCX, max 5 MB) | 201 `{ resume }` |
| GET | `/resumes` | – | 200 `{ resumes }` |
| DELETE | `/resumes/:id` | – | 204 |

`user` = `{ id, email, role, createdAt }`; `resume` = `{ id, originalFilename, fileType, uploadedAt }`.
