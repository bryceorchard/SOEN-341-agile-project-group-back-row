import Database from 'better-sqlite3';
import { readFileSync, rmSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const DB_PATH = process.env.DB_PATH ?? join(here, '..', 'data', 'careerconnect.db');

export function openDb() {
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');
  return db;
}

export function migrate(db) {
  db.exec(readFileSync(join(here, 'schema.sql'), 'utf8'));

  // schema.sql only CREATEs tables, so a column added after a table already exists
  // (e.g. jobs.status) needs an explicit, idempotent ALTER for databases from before it.
  const jobColumns = db.prepare('PRAGMA table_info(jobs)').all().map((c) => c.name);
  if (!jobColumns.includes('status')) {
    db.exec("ALTER TABLE jobs ADD COLUMN status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed'))");
  }
  if (!jobColumns.includes('archived_at')) {
    db.exec('ALTER TABLE jobs ADD COLUMN archived_at TEXT');
  }

  backfillStatusHistory(db);
}

// Gives every application that has no status history yet (one from before #134, or one
// inserted directly by seed.js or a test) a single row: its current status, dated when it
// was applied for if still Applied, otherwise when it was last updated. Idempotent, since
// applications created through the API always have at least one row already.
export function backfillStatusHistory(db) {
  return db
    .prepare(
      `INSERT INTO application_status_history (application_id, status, changed_at, changed_by)
       SELECT a.id, a.status, CASE WHEN a.status = 'Applied' THEN a.applied_at ELSE a.updated_at END, NULL
       FROM applications a
       WHERE NOT EXISTS (SELECT 1 FROM application_status_history h WHERE h.application_id = a.id)`
    )
    .run().changes;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--reset')) rmSync(DB_PATH, { force: true });
  const db = openDb();
  migrate(db);
  console.log(`Migrated ${DB_PATH}`);
  db.close();
}
