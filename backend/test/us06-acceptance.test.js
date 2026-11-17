import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';

// Acceptance tests for US-06 (#93): application dashboard with status (backend side).

const tmp = mkdtempSync(join(tmpdir(), 'cc-us06-'));
process.env.UPLOAD_DIR = join(tmp, 'uploads');

const { default: Database } = await import('better-sqlite3');
const { migrate } = await import('../db/migrate.js');
const { createApp } = await import('../src/app.js');

let api;
let db;
let seeker;
let recruiter;

async function login(email, role) {
  const creds = { email, password: 'Password123!', role };
  await api.post('/auth/signup').send(creds).expect(201);
  const token = (await api.post('/auth/login').send(creds).expect(200)).body.token;
  return { Authorization: `Bearer ${token}` };
}

before(async () => {
  db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  migrate(db);
  api = request(createApp(db));
  seeker = await login('us06-seeker@test.com', 'job_seeker');
  recruiter = await login('us06-recruiter@test.com', 'recruiter');
});
after(() => rmSync(tmp, { recursive: true, force: true }));

test('US-06 AT-2: when a recruiter changes the status to "Interview", the job seeker\'s list shows "Interview" and a new last-updated date', async () => {
  const jobId = (await api.post('/jobs').set(recruiter).send({ title: 'Backend Developer', description: 'API work' }).expect(201)).body.job.id;
  const applicationId = (await api.post('/applications').set(seeker).send({ jobId }).expect(201)).body.application.id;
  // Pretend the application was submitted a week ago, so the update date is clearly different.
  db.prepare("UPDATE applications SET applied_at = '2026-11-01 10:00:00', updated_at = '2026-11-01 10:00:00' WHERE id = ?").run(applicationId);

  await api.patch(`/applications/${applicationId}`).set(recruiter).send({ status: 'Interview' }).expect(200);

  const [mine] = (await api.get('/applications').set(seeker).expect(200)).body.applications;
  assert.equal(mine.status, 'Interview');
  assert.equal(mine.appliedAt, '2026-11-01 10:00:00'); // applied date unchanged
  assert.ok(mine.updatedAt > mine.appliedAt, `last updated (${mine.updatedAt}) should be after the applied date`);
});
