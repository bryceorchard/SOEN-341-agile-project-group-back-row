import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';

// Acceptance tests for US-20 (#91): view job details (backend side).

const tmp = mkdtempSync(join(tmpdir(), 'cc-us20-'));
process.env.UPLOAD_DIR = join(tmp, 'uploads');

const { default: Database } = await import('better-sqlite3');
const { migrate } = await import('../db/migrate.js');
const { createApp } = await import('../src/app.js');

const DESCRIPTION = 'Work on the API.\nWrite tests.\n\nMontreal office, hybrid.';

let api;
let jobId;
before(async () => {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  migrate(db);
  api = request(createApp(db));

  const creds = { email: 'us20-recruiter@test.com', password: 'Password123!', role: 'recruiter' };
  await api.post('/auth/signup').send(creds).expect(201);
  const token = (await api.post('/auth/login').send(creds).expect(200)).body.token;
  const res = await api
    .post('/jobs')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Backend Developer', description: DESCRIPTION, location: 'Montreal', category: 'Engineering', deadline: '2026-12-31' })
    .expect(201);
  jobId = res.body.job.id;
});
after(() => rmSync(tmp, { recursive: true, force: true }));

test('US-20 AT-1: a job\'s details include title, full description with line breaks, location, category, deadline and posted date', async () => {
  const { job } = (await api.get(`/jobs/${jobId}`).expect(200)).body; // public: no login needed

  assert.equal(job.title, 'Backend Developer');
  assert.equal(job.description, DESCRIPTION);
  assert.equal(job.location, 'Montreal');
  assert.equal(job.category, 'Engineering');
  assert.equal(job.deadline, '2026-12-31');
  assert.ok(job.createdAt, 'posted date is included');
});

test('US-20 AT-2: a job id that does not exist returns 404', async () => {
  await api.get('/jobs/999999').expect(404);
});

test('US-20 AT-3: a logged-out user cannot apply', async () => {
  await api.post('/applications').send({ jobId }).expect(401);
});
