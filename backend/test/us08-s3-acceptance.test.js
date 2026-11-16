import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';

// Acceptance tests for US-08 Sprint 3 (#142): archive postings + recruiter dashboard (backend side).
// AT-1 to AT-4 are in us08-acceptance.test.js (#94).

const tmp = mkdtempSync(join(tmpdir(), 'cc-us08s3-'));
process.env.UPLOAD_DIR = join(tmp, 'uploads');

const { default: Database } = await import('better-sqlite3');
const { migrate } = await import('../db/migrate.js');
const { createApp } = await import('../src/app.js');

let api;
let recruiter;
let otherRecruiter;
let seeker;
let seeker2;

async function login(email, role) {
  const creds = { email, password: 'Password123!', role };
  await api.post('/auth/signup').send(creds).expect(201);
  const token = (await api.post('/auth/login').send(creds).expect(200)).body.token;
  return { Authorization: `Bearer ${token}` };
}

before(async () => {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  migrate(db);
  api = request(createApp(db));
  recruiter = await login('us08s3-recruiter@test.com', 'recruiter');
  otherRecruiter = await login('us08s3-other@test.com', 'recruiter');
  seeker = await login('us08s3-seeker@test.com', 'job_seeker');
  seeker2 = await login('us08s3-seeker2@test.com', 'job_seeker');
});
after(() => rmSync(tmp, { recursive: true, force: true }));

const createJob = async (title, extra = {}) =>
  (await api.post('/jobs').set(recruiter).send({ title, description: 'Do the work', deadline: '2026-12-31', ...extra }).expect(201)).body.job.id;
const mine = async (view = 'active') => (await api.get('/jobs/mine').query({ view }).set(recruiter).expect(200)).body.jobs;
const inPublicSearch = async (id) => (await api.get('/jobs').expect(200)).body.jobs.some((j) => j.id === id);

test('US-08 AT-5: archiving moves the posting to the archived view, hides it from public search and rejects applications', async () => {
  const id = await createJob('Technical Writer');
  await api.patch(`/jobs/${id}/archive`).set(recruiter).expect(200);

  assert.ok(!(await mine('active')).some((j) => j.id === id), 'gone from the active view');
  assert.ok((await mine('archived')).some((j) => j.id === id), 'shown in the archived view');
  assert.equal(await inPublicSearch(id), false);
  await api.post('/applications').set(seeker).send({ jobId: id }).expect(400);
});

test('US-08 AT-6: restoring brings the posting back with its deadline and past applications, and back into search when open', async () => {
  const id = await createJob('Support Specialist');
  await api.post('/applications').set(seeker).send({ jobId: id }).expect(201);
  await api.post('/applications').set(seeker2).send({ jobId: id }).expect(201);

  await api.patch(`/jobs/${id}/archive`).set(recruiter).expect(200);
  await api.patch(`/jobs/${id}/unarchive`).set(recruiter).expect(200);

  const restored = (await mine('active')).find((j) => j.id === id);
  assert.ok(restored, 'back in the active view');
  assert.equal(restored.deadline, '2026-12-31');
  assert.equal(restored.applicationCount, 2);
  assert.equal(restored.statusCounts.Applied, 2);
  assert.equal(await inPublicSearch(id), true);
});

test('US-08 AT-6: a closed posting that is restored stays out of the public search', async () => {
  const id = await createJob('Closed Role');
  await api.patch(`/jobs/${id}/status`).set(recruiter).send({ status: 'closed' }).expect(200);
  await api.patch(`/jobs/${id}/archive`).set(recruiter).expect(200);
  await api.patch(`/jobs/${id}/unarchive`).set(recruiter).expect(200);

  const restored = (await mine('active')).find((j) => j.id === id);
  assert.equal(restored.status, 'closed');
  assert.equal(await inPublicSearch(id), false);
});

test('US-08 AT-7: the dashboard reports each posting\'s status, deadline and application counts by status', async () => {
  const id = await createJob('Data Analyst');
  await api.post('/applications').set(seeker).send({ jobId: id }).expect(201);
  const second = (await api.post('/applications').set(seeker2).send({ jobId: id }).expect(201)).body.application;
  await api.patch(`/applications/${second.id}`).set(recruiter).send({ status: 'Interview' }).expect(200);

  const card = (await mine('active')).find((j) => j.id === id);
  assert.equal(card.status, 'open');
  assert.equal(card.deadline, '2026-12-31');
  assert.equal(card.applicationCount, 2);
  assert.deepEqual(card.statusCounts, { Applied: 1, 'Under Review': 0, Interview: 1, Offered: 0, Rejected: 0 });

  // The count links lead to the applicant list filtered by that status.
  const interviewOnly = (await api.get(`/jobs/${id}/applications`).query({ status: 'Interview' }).set(recruiter).expect(200)).body.applications;
  assert.deepEqual(interviewOnly.map((a) => a.id), [second.id]);
});

test('US-08 AT-8: another recruiter gets 404 and a job seeker gets 403 when archiving, and the posting is unchanged', async () => {
  const id = await createJob('Protected Role');

  await api.patch(`/jobs/${id}/archive`).set(otherRecruiter).expect(404);
  await api.patch(`/jobs/${id}/archive`).set(seeker).expect(403);

  const job = (await api.get(`/jobs/${id}`).expect(200)).body.job;
  assert.equal(job.archivedAt, null);
  assert.equal(job.status, 'open');
  assert.equal(await inPublicSearch(id), true);
});
