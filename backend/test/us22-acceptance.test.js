import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';

// Acceptance tests for US-22 (#146): recruiter notifications for new applications (backend side).
// Also covered in notifications.test.js and deadline-reminders.test.js.

const tmp = mkdtempSync(join(tmpdir(), 'cc-us22-'));
process.env.UPLOAD_DIR = join(tmp, 'uploads');

const { default: Database } = await import('better-sqlite3');
const { migrate } = await import('../db/migrate.js');
const { createApp } = await import('../src/app.js');

let api;

async function login(email, role) {
  const creds = { email, password: 'Password123!', role };
  await api.post('/auth/signup').send(creds).expect(201);
  const token = (await api.post('/auth/login').send(creds).expect(200)).body.token;
  return { Authorization: `Bearer ${token}` };
}

const notifications = async (auth) => (await api.get('/notifications').set(auth).expect(200)).body.notifications;
const unreadCount = async (auth) => (await api.get('/notifications/unread-count').set(auth).expect(200)).body.count;

// Today's date in the server's local time, so the deadline is always inside the reminder window.
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

before(() => {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  migrate(db);
  api = request(createApp(db));
});
after(() => rmSync(tmp, { recursive: true, force: true }));

test('US-22 AT-1: a new application gives the recruiter an unread notification naming the job and the applicant, linking to the applicant list', async () => {
  const recruiter = await login('us22-recruiter1@test.com', 'recruiter');
  const seeker = await login('us22-seeker@test.com', 'job_seeker');
  await api.put('/profile').set(seeker).send({ fullName: 'Ada Lovelace' }).expect(200);
  const jobId = (await api.post('/jobs').set(recruiter).send({ title: 'Backend Developer', description: 'API work' }).expect(201)).body.job.id;
  assert.equal(await unreadCount(recruiter), 0);

  const applicationId = (await api.post('/applications').set(seeker).send({ jobId }).expect(201)).body.application.id;

  assert.equal(await unreadCount(recruiter), 1);
  const [notification] = await notifications(recruiter);
  assert.equal(notification.type, 'new_application');
  assert.equal(notification.read, false);
  assert.match(notification.title, /Backend Developer/);
  assert.match(notification.message, /Ada Lovelace applied to Backend Developer/);
  assert.equal(notification.jobId, jobId);
  assert.equal(notification.applicationId, applicationId);
  assert.equal(notification.link, `/recruiter/postings/${jobId}/applicants`);
});

test('US-22 AT-2: a posting closing within 3 days gives its recruiter exactly one "closing soon" reminder, even after reloading', async () => {
  const recruiter = await login('us22-recruiter2@test.com', 'recruiter');
  const jobId = (await api.post('/jobs').set(recruiter).send({ title: 'Closing Soon', description: 'x', deadline: today() }).expect(201)).body.job.id;

  for (let reload = 0; reload < 3; reload++) await notifications(recruiter);
  await unreadCount(recruiter);

  const reminders = (await notifications(recruiter)).filter((n) => n.type === 'deadline_reminder' && n.jobId === jobId);
  assert.equal(reminders.length, 1);
  assert.equal(reminders[0].title, 'Posting closing soon');
  assert.match(reminders[0].message, /Closing Soon closes on/);
  assert.equal(reminders[0].link, `/recruiter/postings/${jobId}/applicants`);
});

test('US-22 AT-3: a recruiter with no notifications gets an empty history and a zero count', async () => {
  const recruiter = await login('us22-recruiter3@test.com', 'recruiter');

  assert.deepEqual(await notifications(recruiter), []);
  assert.equal(await unreadCount(recruiter), 0);
});
