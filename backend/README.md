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
