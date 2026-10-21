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

test('GET /jobs/categories returns the distinct categories, not a job id lookup', async () => {
  const res = await api.get('/jobs/categories').expect(200);
  assert.deepEqual(res.body.categories, ['Engineering', 'QA']);
});

test('a job seeker applies, cannot double-apply, sees their applications', async () => {
  const auth = { Authorization: `Bearer ${seekerToken}` };
  const applied = await api.post('/applications').set(auth).send({ jobId }).expect(201);
  assert.equal(applied.body.application.status, 'Applied');

  await api.post('/applications').set(auth).send({ jobId }).expect(409);
  await api.post('/applications').set(auth).send({ jobId: 99999 }).expect(404);

  const mine = await api.get('/applications').set(auth).expect(200);
  assert.equal(mine.body.applications.length, 1);
  const app = mine.body.applications[0];
  assert.equal(app.jobTitle, 'Backend Developer');
  assert.equal(app.jobLocation, 'Montreal');
  assert.equal(app.jobCategory, 'Engineering');
  assert.equal(app.jobStatus, 'open');
  assert.equal(app.resumeFilename, null);
});

test('GET /applications?status filters, and rejects an invalid status', async () => {
  const auth = { Authorization: `Bearer ${seekerToken}` };

  const applied = await api.get('/applications').query({ status: 'Applied' }).set(auth).expect(200);
  assert.equal(applied.body.applications.length, 1);

  const offered = await api.get('/applications').query({ status: 'Offered' }).set(auth).expect(200);
  assert.equal(offered.body.applications.length, 0);

  await api.get('/applications').query({ status: 'Not A Status' }).set(auth).expect(400);
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

test('applications carry the attached resume filename in POST, GET, and PATCH responses', async () => {
  const recruiterAuth = { Authorization: `Bearer ${recruiterToken}` };
  const seekerAuth = { Authorization: `Bearer ${seekerToken}` };

  const job = (await api.post('/jobs').set(recruiterAuth)
    .send({ title: 'Frontend Developer', description: 'Build the UI', location: 'Toronto', category: 'Engineering', deadline: '2026-12-01' })
    .expect(201)).body.job;
  const resume = (await api.post('/resumes').set(seekerAuth)
    .attach('resume', Buffer.from('%PDF-1.4 cv'), { filename: 'cv-frontend.pdf', contentType: 'application/pdf' })
    .expect(201)).body.resume;

  const created = (await api.post('/applications').set(seekerAuth).send({ jobId: job.id, resumeId: resume.id }).expect(201)).body.application;
  assert.equal(created.resumeId, resume.id);
  assert.equal(created.resumeFilename, 'cv-frontend.pdf');
  assert.equal(created.jobLocation, 'Toronto');
  assert.equal(created.jobDeadline, '2026-12-01');

  const listed = (await api.get('/applications').set(seekerAuth).expect(200)).body.applications.find((a) => a.id === created.id);
  assert.equal(listed.resumeFilename, 'cv-frontend.pdf');

  const updated = (await api.patch(`/applications/${created.id}`).set(recruiterAuth).send({ status: 'Under Review' }).expect(200)).body.application;
  assert.equal(updated.resumeFilename, 'cv-frontend.pdf');
  assert.deepEqual(Object.keys(updated).sort(), Object.keys(created).sort());

  // Deleting the resume keeps the application; the resume fields fall back to null.
  await api.delete(`/resumes/${resume.id}`).set(seekerAuth).expect(204);
  const afterDelete = (await api.get('/applications').set(seekerAuth).expect(200)).body.applications.find((a) => a.id === created.id);
  assert.equal(afterDelete.resumeId, null);
  assert.equal(afterDelete.resumeFilename, null);
});

test('applications show jobStatus, so a closed posting is visible to the applicant', async () => {
  const recruiterAuth = { Authorization: `Bearer ${recruiterToken}` };
  const seekerAuth = { Authorization: `Bearer ${seekerToken}` };

  const job = (await api.post('/jobs').set(recruiterAuth)
    .send({ title: 'Data Analyst', description: 'Crunch numbers', location: 'Ottawa', category: 'Data' })
    .expect(201)).body.job;

  const created = (await api.post('/applications').set(seekerAuth).send({ jobId: job.id }).expect(201)).body.application;
  assert.equal(created.jobStatus, 'open');

  await api.patch(`/jobs/${job.id}/status`).set(recruiterAuth).send({ status: 'closed' }).expect(200);

  const listed = (await api.get('/applications').set(seekerAuth).expect(200)).body.applications.find((a) => a.id === created.id);
  assert.equal(listed.jobStatus, 'closed');
  assert.equal(listed.status, 'Applied'); // closing the posting doesn't change the application's own status

  const updated = (await api.patch(`/applications/${created.id}`).set(recruiterAuth).send({ status: 'Rejected' }).expect(200)).body.application;
  assert.equal(updated.jobStatus, 'closed');
});

test('GET /jobs/categories only lists categories that have open postings', async () => {
  const recruiterAuth = { Authorization: `Bearer ${recruiterToken}` };
  const legal = (await api.post('/jobs').set(recruiterAuth)
    .send({ title: 'Paralegal', description: 'Review contracts', category: 'Legal' }).expect(201)).body.job;

  let categories = (await api.get('/jobs/categories').expect(200)).body.categories;
  assert.ok(categories.includes('Legal'));

  await api.patch(`/jobs/${legal.id}/status`).set(recruiterAuth).send({ status: 'closed' }).expect(200);
  categories = (await api.get('/jobs/categories').expect(200)).body.categories;
  assert.ok(!categories.includes('Legal'), 'a category whose only posting is closed should disappear');

  await api.patch(`/jobs/${legal.id}/status`).set(recruiterAuth).send({ status: 'open' }).expect(200);
  categories = (await api.get('/jobs/categories').expect(200)).body.categories;
  assert.ok(categories.includes('Legal'));
});

test('optional job fields are trimmed, blanks become null, and non-strings are rejected', async () => {
  const recruiterAuth = { Authorization: `Bearer ${recruiterToken}` };
  const job = (await api.post('/jobs').set(recruiterAuth)
    .send({ title: 'Office Manager', description: 'Run the office', location: '  Laval ', category: ' Operations  ', deadline: '' })
    .expect(201)).body.job;
  assert.equal(job.location, 'Laval');
  assert.equal(job.category, 'Operations');
  assert.equal(job.deadline, null);

  const filtered = (await api.get('/jobs').query({ category: 'Operations' }).expect(200)).body.jobs;
  assert.ok(filtered.some((j) => j.id === job.id));
  const categories = (await api.get('/jobs/categories').expect(200)).body.categories;
  assert.ok(categories.includes('Operations') && !categories.some((c) => c !== c.trim()));

  await api.post('/jobs').set(recruiterAuth).send({ title: 'X', description: 'Y', category: 123 }).expect(400);
  await api.put(`/jobs/${job.id}`).set(recruiterAuth).send({ title: 'X', description: 'Y', location: { city: 'Laval' } }).expect(400);
});
