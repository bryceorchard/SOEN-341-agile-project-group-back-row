import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';

// Acceptance tests for US-09 Sprint 3 (#143), backend side (#132):
// date range filter on a posting's applications, and the candidate review endpoint.

const tmp = mkdtempSync(join(tmpdir(), 'cc-us09s3-'));
process.env.UPLOAD_DIR = join(tmp, 'uploads');

const { default: Database } = await import('better-sqlite3');
const { migrate } = await import('../db/migrate.js');
const { createApp } = await import('../src/app.js');

let api;
let db;
let recruiter;
let otherRecruiter;
let ada;
let grace;
let linus;
let jobId;
let otherJobId; // same recruiter, a second posting
let foreignJobId; // another recruiter's posting
const apps = {};

async function login(email, role) {
  const creds = { email, password: 'Password123!', role };
  await api.post('/auth/signup').send(creds).expect(201);
  const token = (await api.post('/auth/login').send(creds).expect(200)).body.token;
  return { Authorization: `Bearer ${token}` };
}

const postJob = async (auth, title) =>
  (await api.post('/jobs').set(auth).send({ title, description: 'Do the work' }).expect(201)).body.job.id;

async function apply(auth, job, appliedAt, resumeId) {
  const id = (await api.post('/applications').set(auth).send({ jobId: job, resumeId }).expect(201)).body.application.id;
  db.prepare('UPDATE applications SET applied_at = ? WHERE id = ?').run(appliedAt, id);
  return id;
}

before(async () => {
  db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  migrate(db);
  api = request(createApp(db));

  recruiter = await login('us09s3-recruiter@test.com', 'recruiter');
  otherRecruiter = await login('us09s3-other@test.com', 'recruiter');
  ada = await login('us09s3-ada@test.com', 'job_seeker');
  grace = await login('us09s3-grace@test.com', 'job_seeker');
  linus = await login('us09s3-linus@test.com', 'job_seeker');

  jobId = await postJob(recruiter, 'Backend Developer');
  otherJobId = await postJob(recruiter, 'QA Analyst');
  foreignJobId = await postJob(otherRecruiter, 'Elsewhere Inc. Role');

  await api
    .put('/profile')
    .set(ada)
    .send({ fullName: 'Ada Lovelace', headline: 'Backend dev', location: 'London', phone: '555-0100', bio: 'Engines.' })
    .expect(200);
  const resumeId = (
    await api.post('/resumes').set(ada).attach('resume', Buffer.from('%PDF-1.4'), { filename: 'ada-cv.pdf', contentType: 'application/pdf' }).expect(201)
  ).body.resume.id;

  // Applications to the posting on different days (times included, to check the "to" day is inclusive).
  apps.ada = await apply(ada, jobId, '2026-11-01 09:00:00', resumeId);
  apps.grace = await apply(grace, jobId, '2026-11-05 23:59:00');
  apps.linus = await apply(linus, jobId, '2026-11-10 12:00:00');
  await api.patch(`/applications/${apps.grace}`).set(recruiter).send({ status: 'Interview' }).expect(200);

  // Ada's other applications: one to this recruiter, one to someone else (must never be shown).
  apps.adaOther = await apply(ada, otherJobId, '2026-11-08 10:00:00');
  apps.adaForeign = await apply(ada, foreignJobId, '2026-11-09 10:00:00');
});
after(() => rmSync(tmp, { recursive: true, force: true }));

const ids = (res) => res.body.applications.map((a) => a.id).sort((a, b) => a - b);
const list = (query, auth = recruiter) => api.get(`/jobs/${jobId}/applications`).query(query).set(auth);

test('US-09 AT-6: from/to only returns applications submitted within the range, both days included', async () => {
  assert.deepEqual(ids(await list({ from: '2026-11-01', to: '2026-11-05' }).expect(200)), [apps.ada, apps.grace].sort((a, b) => a - b));
  assert.deepEqual(ids(await list({ from: '2026-11-05', to: '2026-11-05' }).expect(200)), [apps.grace]); // a single day
  assert.deepEqual(ids(await list({ from: '2026-11-06' }).expect(200)), [apps.linus]); // only a start
  assert.deepEqual(ids(await list({ to: '2026-11-04' }).expect(200)), [apps.ada]); // only an end
});

test('US-09 AT-6: the date range combines with the status filter', async () => {
  assert.deepEqual(ids(await list({ status: 'Interview', from: '2026-11-01', to: '2026-11-10' }).expect(200)), [apps.grace]);
  assert.deepEqual(ids(await list({ status: 'Applied', from: '2026-11-01', to: '2026-11-05' }).expect(200)), [apps.ada]);
});

test('US-09 AT-6: a range with no applications returns an empty list', async () => {
  assert.deepEqual((await list({ from: '2026-12-01', to: '2026-12-31' }).expect(200)).body.applications, []);
});

test('US-09 AT-7: "from" after "to" is rejected with a 400 and an error message', async () => {
  const res = await list({ from: '2026-11-10', to: '2026-11-01' }).expect(400);
  assert.match(res.body.error, /from must be on or before to/);
  assert.equal(res.body.applications, undefined);
});

test('US-09 AT-7: dates that are not real YYYY-MM-DD dates are rejected with a 400', async () => {
  for (const bad of ['2026-13-01', '2026-02-30', '11/05/2026', 'yesterday', '2026-11-5']) {
    const res = await list({ from: bad }).expect(400);
    assert.match(res.body.error, /from must be a date in YYYY-MM-DD format/, `from=${bad}`);
  }
  await list({ to: 'not-a-date' }).expect(400);
});

test("US-09 AT-8: the candidate review returns the full profile, the applied resume, and their other applications to this recruiter's postings", async () => {
  const res = await api.get(`/jobs/${jobId}/applications/${apps.ada}`).set(recruiter).expect(200);
  const { application, candidate, otherApplications } = res.body;

  assert.equal(application.id, apps.ada);
  assert.equal(application.status, 'Applied');
  assert.equal(application.appliedAt, '2026-11-01 09:00:00');
  assert.equal(application.resumeFilename, 'ada-cv.pdf');
  assert.ok(application.resumeId);
  assert.deepEqual(candidate, {
    email: 'us09s3-ada@test.com',
    fullName: 'Ada Lovelace',
    headline: 'Backend dev',
    location: 'London',
    phone: '555-0100',
    bio: 'Engines.',
  });
  // Only the application to this recruiter's other posting: not the one under review, not another recruiter's.
  assert.deepEqual(
    otherApplications.map((o) => [o.id, o.jobTitle, o.status]),
    [[apps.adaOther, 'QA Analyst', 'Applied']],
  );

  // The recruiter can open the resume they were shown.
  await api.get(`/resumes/${application.resumeId}/file`).set(recruiter).expect(200);
});

test('US-09 AT-8: a candidate without a profile or resume still gets a review with empty fields', async () => {
  const { application, candidate, otherApplications } = (await api.get(`/jobs/${jobId}/applications/${apps.linus}`).set(recruiter).expect(200)).body;
  assert.equal(application.resumeId, null);
  assert.equal(application.resumeFilename, null);
  assert.equal(candidate.email, 'us09s3-linus@test.com');
  assert.equal(candidate.fullName, null);
  assert.deepEqual(otherApplications, []);
});

test('US-09 AT-8: the status can be updated from the review and the review shows the new status', async () => {
  await api.patch(`/applications/${apps.linus}`).set(recruiter).send({ status: 'Under Review' }).expect(200);
  const { application } = (await api.get(`/jobs/${jobId}/applications/${apps.linus}`).set(recruiter).expect(200)).body;
  assert.equal(application.status, 'Under Review');
});

test("US-09 AT-9: another recruiter gets 404 and no candidate data", async () => {
  const res = await api.get(`/jobs/${jobId}/applications/${apps.ada}`).set(otherRecruiter).expect(404);
  assert.deepEqual(Object.keys(res.body), ['error']);
});

test('US-09 AT-9: a job seeker (even the candidate) gets 403 and no candidate data', async () => {
  for (const seeker of [ada, grace]) {
    const res = await api.get(`/jobs/${jobId}/applications/${apps.ada}`).set(seeker).expect(403);
    assert.deepEqual(Object.keys(res.body), ['error']);
  }
});

test('US-09 AT-9: an application that is not on this posting is not found', async () => {
  // Real application, but it belongs to the recruiter's other posting.
  await api.get(`/jobs/${jobId}/applications/${apps.adaOther}`).set(recruiter).expect(404);
  // Another recruiter's application, asked through this recruiter's posting.
  await api.get(`/jobs/${jobId}/applications/${apps.adaForeign}`).set(recruiter).expect(404);
  await api.get(`/jobs/${jobId}/applications/999999`).set(recruiter).expect(404);
});

test('US-09 AT-9: logged-out requests are refused', async () => {
  await api.get(`/jobs/${jobId}/applications/${apps.ada}`).expect(401);
  await api.get(`/jobs/${jobId}/applications`).query({ from: '2026-11-01' }).expect(401);
});
