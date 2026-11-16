import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';

// Acceptance tests for US-05 (#92): submit applications through the platform (backend side).

const tmp = mkdtempSync(join(tmpdir(), 'cc-us05-'));
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

async function postJob(title) {
  return (await api.post('/jobs').set(recruiter).send({ title, description: 'Do the work' }).expect(201)).body.job.id;
}

before(async () => {
  db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  migrate(db);
  api = request(createApp(db));
  seeker = await login('us05-seeker@test.com', 'job_seeker');
  recruiter = await login('us05-recruiter@test.com', 'recruiter');
});
after(() => rmSync(tmp, { recursive: true, force: true }));

test('US-05 AT-1: applying with one of my resumes creates an "Applied" application with that resume attached', async () => {
  const jobId = await postJob('Backend Developer');
  const resumeId = (
    await api.post('/resumes').set(seeker).attach('resume', Buffer.from('%PDF-1.4'), { filename: 'backend-cv.pdf', contentType: 'application/pdf' }).expect(201)
  ).body.resume.id;

  const { application } = (await api.post('/applications').set(seeker).send({ jobId, resumeId }).expect(201)).body;
  assert.equal(application.status, 'Applied');
  assert.ok(application.appliedAt, 'the application date is recorded');
  assert.equal(application.resumeFilename, 'backend-cv.pdf');
});

test('US-05 AT-2: applying twice to the same job is refused and no duplicate application is created', async () => {
  const jobId = await postJob('Frontend Developer');
  await api.post('/applications').set(seeker).send({ jobId }).expect(201);

  const second = await api.post('/applications').set(seeker).send({ jobId }).expect(409);
  assert.ok(second.body.error, 'an error message is returned');

  const mine = (await api.get('/applications').set(seeker).expect(200)).body.applications;
  assert.equal(mine.filter((a) => a.jobId === jobId).length, 1);
});

test('US-05 AT-4: applying to a job that was removed from the database is blocked with an error', async () => {
  const jobId = await postJob('Removed Role');
  db.prepare('DELETE FROM jobs WHERE id = ?').run(jobId);

  const res = await api.post('/applications').set(seeker).send({ jobId }).expect(404);
  assert.ok(res.body.error, 'an error message is returned');

  const mine = (await api.get('/applications').set(seeker).expect(200)).body.applications;
  assert.equal(mine.filter((a) => a.jobId === jobId).length, 0);
});
