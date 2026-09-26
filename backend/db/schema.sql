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
