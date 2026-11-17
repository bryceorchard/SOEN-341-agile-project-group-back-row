import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';

// Acceptance tests for US-08 (#94): recruiter creates and manages job postings (backend side).
// Editing, closing and ownership checks (AT-3, AT-4) are also covered in jobs-applications.test.js.

const tmp = mkdtempSync(join(tmpdir(), 'cc-us08-'));
process.env.UPLOAD_DIR = join(tmp, 'uploads');

const { default: Database } = await import('better-sqlite3');
const { migrate } = await import('../db/migrate.js');
const { createApp } = await import('../src/app.js');

let api;
let db;
let recruiter;
let otherRecruiter;
let seeker;

async function login(email, role) {
  const creds = { email, password: 'Password123!', role };
  await api.post('/auth/signup').send(creds).expect(201);
  const token = (await api.post('/auth/login').send(creds).expect(200)).body.token;
  return { Authorization: `Bearer ${token}` };
}

const jobCount = () => db.prepare('SELECT COUNT(*) AS n FROM jobs').get().n;

before(async () => {
  db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  migrate(db);
  api = request(createApp(db));
  recruiter = await login('us08-recruiter@test.com', 'recruiter');
  otherRecruiter = await login('us08-other@test.com', 'recruiter');
  seeker = await login('us08-seeker@test.com', 'job_seeker');
});
after(() => rmSync(tmp, { recursive: true, force: true }));

test('US-08 AT-1: a posting created with a title and description appears in My postings and in the public job search', async () => {
  const { job } = (await api.post('/jobs').set(recruiter).send({ title: 'QA Analyst', description: 'Test the platform' }).expect(201)).body;

  const mine = (await api.get('/jobs/mine').set(recruiter).expect(200)).body.jobs;
  assert.ok(mine.some((j) => j.id === job.id), 'listed in My postings');

  const publicList = (await api.get('/jobs').expect(200)).body.jobs; // no login: public search
  assert.ok(publicList.some((j) => j.id === job.id), 'listed in the public job search');
});

test('US-08 AT-2: a job seeker posting a job gets 403 and no posting is created', async () => {
  const before = jobCount();
  await api.post('/jobs').set(seeker).send({ title: 'Sneaky', description: 'Should not exist' }).expect(403);
  assert.equal(jobCount(), before);
});

test('US-08 AT-3: edits show in My postings; closing hides the posting from search and blocks new applications', async () => {
  const { job } = (await api.post('/jobs').set(recruiter).send({ title: 'Designer', description: 'UI work' }).expect(201)).body;

  await api.put(`/jobs/${job.id}`).set(recruiter).send({ title: 'Senior Designer', description: 'UI and UX work', location: 'Toronto' }).expect(200);
  const edited = (await api.get('/jobs/mine').set(recruiter).expect(200)).body.jobs.find((j) => j.id === job.id);
  assert.equal(edited.title, 'Senior Designer');
  assert.equal(edited.location, 'Toronto');

  await api.patch(`/jobs/${job.id}/status`).set(recruiter).send({ status: 'closed' }).expect(200);
  const closed = (await api.get('/jobs/mine').set(recruiter).expect(200)).body.jobs.find((j) => j.id === job.id);
  assert.equal(closed.status, 'closed');
  assert.ok(!(await api.get('/jobs').expect(200)).body.jobs.some((j) => j.id === job.id), 'hidden from public search');
  await api.post('/applications').set(seeker).send({ jobId: job.id }).expect(400);
});

test("US-08 AT-4: another recruiter cannot edit or close someone else's posting, and nothing changes", async () => {
  const { job } = (await api.post('/jobs').set(recruiter).send({ title: 'Data Analyst', description: 'Numbers' }).expect(201)).body;

  await api.put(`/jobs/${job.id}`).set(otherRecruiter).send({ title: 'Hijacked', description: 'x' }).expect(404);
  await api.patch(`/jobs/${job.id}/status`).set(otherRecruiter).send({ status: 'closed' }).expect(404);

  const unchanged = (await api.get(`/jobs/${job.id}`).expect(200)).body.job;
  assert.equal(unchanged.title, 'Data Analyst');
  assert.equal(unchanged.status, 'open');
});
