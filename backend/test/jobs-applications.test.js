import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';

const tmp = mkdtempSync(join(tmpdir(), 'cc-test-'));
process.env.UPLOAD_DIR = join(tmp, 'uploads');

const { default: Database } = await import('better-sqlite3');
const { migrate } = await import('../db/migrate.js');
const { createApp } = await import('../src/app.js');

let api;
let db;
before(() => {
  db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  migrate(db);
  api = request(createApp(db));
});
after(() => rmSync(tmp, { recursive: true, force: true }));

let seekerToken;
let recruiterToken;
let jobId;

test('setup: a job seeker and a recruiter', async () => {
  await api.post('/auth/signup').send({ email: 'seeker@test.com', password: 'Password123!', role: 'job_seeker' }).expect(201);
  await api.post('/auth/signup').send({ email: 'recruiter@test.com', password: 'Password123!', role: 'recruiter' }).expect(201);
  seekerToken = (await api.post('/auth/login').send({ email: 'seeker@test.com', password: 'Password123!' }).expect(200)).body.token;
  recruiterToken = (await api.post('/auth/login').send({ email: 'recruiter@test.com', password: 'Password123!' }).expect(200)).body.token;
});

test('only a recruiter can post a job', async () => {
  await api.post('/jobs').set('Authorization', `Bearer ${seekerToken}`)
    .send({ title: 'Dev', description: 'Build things' }).expect(403);
  await api.post('/jobs').set('Authorization', `Bearer ${recruiterToken}`).send({ title: '' }).expect(400);

  const res = await api.post('/jobs').set('Authorization', `Bearer ${recruiterToken}`)
    .send({ title: 'Backend Developer', description: 'Work on the API', location: 'Montreal', category: 'Engineering' })
    .expect(201);
  jobId = res.body.job.id;
  assert.equal(res.body.job.title, 'Backend Developer');
});

test('jobs are listed and searched without auth', async () => {
  await api.post('/jobs').set('Authorization', `Bearer ${recruiterToken}`)
    .send({ title: 'QA Analyst', description: 'Test things', location: 'Remote', category: 'QA' }).expect(201);

  const all = await api.get('/jobs').expect(200);
  assert.equal(all.body.jobs.length, 2);

  const byKeyword = await api.get('/jobs').query({ keyword: 'backend' }).expect(200);
  assert.equal(byKeyword.body.jobs.length, 1);
  assert.equal(byKeyword.body.jobs[0].title, 'Backend Developer');

  const byLocation = await api.get('/jobs').query({ location: 'remote' }).expect(200);
  assert.equal(byLocation.body.jobs.length, 1);
  assert.equal(byLocation.body.jobs[0].category, 'QA');

  await api.get(`/jobs/${jobId}`).expect(200);
  await api.get('/jobs/99999').expect(404);
});

test('a job seeker applies, cannot double-apply, sees their applications', async () => {
  const auth = { Authorization: `Bearer ${seekerToken}` };
  const applied = await api.post('/applications').set(auth).send({ jobId }).expect(201);
  assert.equal(applied.body.application.status, 'Applied');

  await api.post('/applications').set(auth).send({ jobId }).expect(409);
  await api.post('/applications').set(auth).send({ jobId: 99999 }).expect(404);

  const mine = await api.get('/applications').set(auth).expect(200);
  assert.equal(mine.body.applications.length, 1);
  assert.equal(mine.body.applications[0].jobTitle, 'Backend Developer');
});

test('only the owning recruiter can update an application status', async () => {
  const applicationId = (await api.get('/applications').set('Authorization', `Bearer ${seekerToken}`)).body.applications[0].id;

  await api.patch(`/applications/${applicationId}`).set('Authorization', `Bearer ${seekerToken}`)
    .send({ status: 'Interview' }).expect(403);
  await api.patch(`/applications/${applicationId}`).set('Authorization', `Bearer ${recruiterToken}`)
    .send({ status: 'Not A Status' }).expect(400);

  const res = await api.patch(`/applications/${applicationId}`).set('Authorization', `Bearer ${recruiterToken}`)
    .send({ status: 'Interview' }).expect(200);
  assert.equal(res.body.application.status, 'Interview');
});

test('resume replace swaps the file and keeps the id', async () => {
  const auth = { Authorization: `Bearer ${seekerToken}` };
  const up = await api.post('/resumes').set(auth)
    .attach('resume', Buffer.from('%PDF-1.4 v1'), { filename: 'v1.pdf', contentType: 'application/pdf' }).expect(201);
  const id = up.body.resume.id;

  await api.put(`/resumes/${id}`).set(auth).expect(400); // no file
  const replaced = await api.put(`/resumes/${id}`).set(auth)
    .attach('resume', Buffer.from('%PDF-1.4 v2'), { filename: 'v2.pdf', contentType: 'application/pdf' }).expect(200);

  assert.equal(replaced.body.resume.id, id);
  assert.equal(replaced.body.resume.originalFilename, 'v2.pdf');

  const list = await api.get('/resumes').set(auth).expect(200);
  assert.equal(list.body.resumes.length, 1);
});

test('resume file: owner, applied-to recruiter, others, and missing file', async () => {
  const seekerAuth = { Authorization: `Bearer ${seekerToken}` };
  const recruiterAuth = { Authorization: `Bearer ${recruiterToken}` };

  await api.post('/auth/signup').send({ email: 'other-seeker@test.com', password: 'Password123!', role: 'job_seeker' }).expect(201);
  const otherSeekerToken = (await api.post('/auth/login').send({ email: 'other-seeker@test.com', password: 'Password123!' }).expect(200)).body.token;
  const otherSeekerAuth = { Authorization: `Bearer ${otherSeekerToken}` };

  const up = await api.post('/resumes').set(seekerAuth)
    .attach('resume', Buffer.from('%PDF-1.4 file test'), { filename: 'file-test.pdf', contentType: 'application/pdf' }).expect(201);
  const resumeId = up.body.resume.id;

  // seekerToken already applied to `jobId` in an earlier test; apply to the other
  // recruiter-owned job instead so the resume can be attached to a fresh application.
  const qaJob = db.prepare("SELECT id FROM jobs WHERE title = 'QA Analyst'").get();
  await api.post('/applications').set(seekerAuth).send({ jobId: qaJob.id, resumeId }).expect(201);

  const asOwner = await api.get(`/resumes/${resumeId}/file`).set(seekerAuth).expect(200);
  assert.equal(asOwner.headers['content-type'], 'application/pdf');

  await api.get(`/resumes/${resumeId}/file`).set(recruiterAuth).expect(200);
  await api.get(`/resumes/${resumeId}/file`).set(otherSeekerAuth).expect(404);

  db.prepare('UPDATE resumes SET file_path = ? WHERE id = ?').run('/nonexistent/path.pdf', resumeId);
  await api.get(`/resumes/${resumeId}/file`).set(seekerAuth).expect(404);
});
