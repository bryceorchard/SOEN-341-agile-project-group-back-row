-- CareerConnect schema (SQLite). Sprint 1 tables are live; later-sprint tables are
-- defined here so relationships are settled, but are created by later migrations.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT    NOT NULL,
  role          TEXT    NOT NULL DEFAULT 'job_seeker'
                        CHECK (role IN ('job_seeker', 'recruiter')),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profiles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name   TEXT,
  headline    TEXT,
  location    TEXT,
  phone       TEXT,
  bio         TEXT,
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Resume files live on disk; the DB stores only the path and metadata.
CREATE TABLE IF NOT EXISTS resumes (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_path         TEXT    NOT NULL,
  original_filename TEXT    NOT NULL,
  file_type         TEXT    NOT NULL,
  uploaded_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);

CREATE TABLE IF NOT EXISTS jobs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  recruiter_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT    NOT NULL,
  description   TEXT    NOT NULL,
  location      TEXT,
  category      TEXT,
  deadline      TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON jobs(recruiter_id);

-- Sprint 2 status set; later sprints can extend with Under Review -> interview scheduling etc.
CREATE TABLE IF NOT EXISTS applications (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id      INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  resume_id   INTEGER REFERENCES resumes(id) ON DELETE SET NULL,
  status      TEXT    NOT NULL DEFAULT 'Applied'
                      CHECK (status IN ('Applied', 'Under Review', 'Interview', 'Offered', 'Rejected')),
  applied_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
