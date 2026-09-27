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
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--reset')) rmSync(DB_PATH, { force: true });
  const db = openDb();
  migrate(db);
  console.log(`Migrated ${DB_PATH}`);
  db.close();
}
