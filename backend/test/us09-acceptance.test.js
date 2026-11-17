import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';

// Acceptance tests for US-09 (#95): recruiter views and filters applications (backend side).

const tmp = mkdtempSync(join(tmpdir(), 'cc-us09-'));
process.env.UPLOAD_DIR = join(tmp, 'uploads');

const { default: Database } = await import('better-sqlite3');
const { migrate } = await import('../db/migrate.js');
const { createApp } = await import('../src/app.js');

let api;
let recruiter;
let otherRecruiter;
let ada;
let grace;
let jobId;
let adaApplicationId;
let graceApplicationId;

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

  recruiter = await login('us09-recruiter@test.com', 'recruiter');
  otherRecruiter = await login('us09-other@test.com', 'recruiter');
  ada = await login('us09-ada@test.com', 'job_seeker');
  grace = await login('us09-grace@test.com', 'job_seeker');

  jobId = (await api.post('/jobs').set(recruiter).send({ title: 'Backend Developer', description: 'API work' }).expect(201)).body.job.id;

  await api.put('/profile').set(ada).send({ fullName: 'Ada Lovelace', headline: 'Backend dev' }).expect(200);
  const resumeId = (
    await api.post('/resumes').set(ada).attach('resume', Buffer.from('%PDF-1.4'), { filename: 'ada-cv.pdf', contentType: 'application/pdf' }).expect(201)
  ).body.resume.id;
  adaApplicationId = (await api.post('/applications').set(ada).send({ jobId, resumeId }).expect(201)).body.application.id;
  graceApplicationId = (await api.post('/applications').set(grace).send({ jobId }).expect(201)).body.application.id;
});
after(() => rmSync(tmp, { recursive: true, force: true }));

const listFor = (auth, query = {}) => api.get(`/jobs/${jobId}/applications`).query(query).set(auth);

test("US-09 AT-1: the posting's applications include each applicant's email, name, headline, applied date, status and resume filename", async () => {
  const { applications } = (await listFor(recruiter).expect(200)).body;
  const adaRow = applications.find((a) => a.id === adaApplicationId);

  assert.equal(applications.length, 2);
  assert.equal(adaRow.applicantEmail, 'us09-ada@test.com');
  assert.equal(adaRow.applicantName, 'Ada Lovelace');
  assert.equal(adaRow.applicantHeadline, 'Backend dev');
  assert.ok(adaRow.appliedAt, 'applied date included');
  assert.equal(adaRow.status, 'Applied');
  assert.equal(adaRow.resumeFilename, 'ada-cv.pdf');
});

test('US-09 AT-2: setting a status to "Under Review" updates the dashboard and the job seeker\'s My applications', async () => {
  const { application } = (await api.patch(`/applications/${adaApplicationId}`).set(recruiter).send({ status: 'Under Review' }).expect(200)).body;
  assert.equal(application.status, 'Under Review');

  const onDashboard = (await listFor(recruiter).expect(200)).body.applications.find((a) => a.id === adaApplicationId);
  assert.equal(onDashboard.status, 'Under Review');

  const [mine] = (await api.get('/applications').set(ada).expect(200)).body.applications;
  assert.equal(mine.status, 'Under Review');
});

test('US-09 AT-3: filtering by status returns only the applications with that status', async () => {
  const underReview = (await listFor(recruiter, { status: 'Under Review' }).expect(200)).body.applications;
  assert.deepEqual(underReview.map((a) => a.id), [adaApplicationId]);

  const applied = (await listFor(recruiter, { status: 'Applied' }).expect(200)).body.applications;
  assert.deepEqual(applied.map((a) => a.id), [graceApplicationId]);
});

test("US-09 AT-4: a recruiter asking for another recruiter's posting's applications is refused with no data", async () => {
  const res = await listFor(otherRecruiter).expect(404);
  assert.equal(res.body.applications, undefined);
  assert.ok(res.body.error, 'an error message is returned');

  await api.patch(`/applications/${graceApplicationId}`).set(otherRecruiter).send({ status: 'Rejected' }).expect(404);
});

test('US-09 AT-5: a job seeker is refused access to the applications endpoint', async () => {
  const res = await listFor(ada).expect(403);
  assert.equal(res.body.applications, undefined);
  assert.ok(res.body.error, 'an error message is returned');

  await api.patch(`/applications/${graceApplicationId}`).set(ada).send({ status: 'Offered' }).expect(403);
});
