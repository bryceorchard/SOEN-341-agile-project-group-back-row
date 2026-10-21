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
before(() => {
  const db = new Database(':memory:');
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

test('GET /jobs/:id/applications: owning recruiter sees applicants, others are refused', async () => {
  const recruiterAuth = { Authorization: `Bearer ${recruiterToken}` };
  const seekerAuth = { Authorization: `Bearer ${seekerToken}` };

  await api.post('/auth/signup').send({ email: 'other-recruiter@test.com', password: 'Password123!', role: 'recruiter' }).expect(201);
  const otherRecruiterToken = (await api.post('/auth/login').send({ email: 'other-recruiter@test.com', password: 'Password123!' }).expect(200)).body.token;

  await api.put('/profile').set(seekerAuth).send({ fullName: 'Sam Seeker' }).expect(200);

  await api.get(`/jobs/${jobId}/applications`).set(seekerAuth).expect(403);
  await api.get(`/jobs/${jobId}/applications`).set({ Authorization: `Bearer ${otherRecruiterToken}` }).expect(404);

  const res = await api.get(`/jobs/${jobId}/applications`).set(recruiterAuth).expect(200);
  assert.equal(res.body.applications.length, 1);
  assert.equal(res.body.applications[0].applicantEmail, 'seeker@test.com');
  assert.equal(res.body.applications[0].applicantName, 'Sam Seeker');

  const filtered = await api.get(`/jobs/${jobId}/applications`).query({ status: 'Offered' }).set(recruiterAuth).expect(200);
  assert.equal(filtered.body.applications.length, 0);
  await api.get(`/jobs/${jobId}/applications`).query({ status: 'Not A Status' }).set(recruiterAuth).expect(400);
});

test('recruiter posting management: mine, edit, close/reopen, and ownership checks', async () => {
  const recruiterAuth = { Authorization: `Bearer ${recruiterToken}` };
  const seekerAuth = { Authorization: `Bearer ${seekerToken}` };

  await api.post('/auth/signup').send({ email: 'other-recruiter-2@test.com', password: 'Password123!', role: 'recruiter' }).expect(201);
  const otherRecruiterToken = (await api.post('/auth/login').send({ email: 'other-recruiter-2@test.com', password: 'Password123!' }).expect(200)).body.token;
  const otherRecruiterAuth = { Authorization: `Bearer ${otherRecruiterToken}` };

  await api.get('/jobs/mine').set(seekerAuth).expect(403);
  const mine = await api.get('/jobs/mine').set(recruiterAuth).expect(200);
  assert.equal(mine.body.jobs.length, 2);
  const backendJob = mine.body.jobs.find((j) => j.title === 'Backend Developer');
  assert.equal(backendJob.status, 'open');
  assert.equal(backendJob.applicationCount, 1);

  await api.put(`/jobs/${jobId}`).set(otherRecruiterAuth).send({ title: 'Hijack', description: 'x' }).expect(404);
  await api.put(`/jobs/${jobId}`).set(recruiterAuth).send({ title: '' }).expect(400);
  const edited = await api.put(`/jobs/${jobId}`).set(recruiterAuth)
    .send({ title: 'Backend Developer II', description: 'Updated role', location: 'Montreal', category: 'Engineering' })
    .expect(200);
  assert.equal(edited.body.job.title, 'Backend Developer II');

  await api.patch(`/jobs/${jobId}/status`).set(otherRecruiterAuth).send({ status: 'closed' }).expect(404);
  await api.patch(`/jobs/${jobId}/status`).set(recruiterAuth).send({ status: 'not-a-status' }).expect(400);
  const closed = await api.patch(`/jobs/${jobId}/status`).set(recruiterAuth).send({ status: 'closed' }).expect(200);
  assert.equal(closed.body.job.status, 'closed');

  const listed = await api.get('/jobs').expect(200);
  assert.ok(!listed.body.jobs.some((j) => j.id === jobId));

  await api.post('/applications').set(seekerAuth).send({ jobId }).expect(400);

  const reopened = await api.patch(`/jobs/${jobId}/status`).set(recruiterAuth).send({ status: 'open' }).expect(200);
  assert.equal(reopened.body.job.status, 'open');
});
