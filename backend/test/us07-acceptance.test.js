import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';

// Acceptance tests for US-07 (#145): job seeker notifications and deadline reminders (backend side).
// Notification types, recipient checks and reminder rules are also covered in notifications.test.js
// and deadline-reminders.test.js.

const tmp = mkdtempSync(join(tmpdir(), 'cc-us07-'));
process.env.UPLOAD_DIR = join(tmp, 'uploads');

const { default: Database } = await import('better-sqlite3');
const { migrate } = await import('../db/migrate.js');
const { createApp } = await import('../src/app.js');

let api;
let recruiter;
let seeker;
let otherSeeker;

async function login(email, role) {
  const creds = { email, password: 'Password123!', role };
  await api.post('/auth/signup').send(creds).expect(201);
  const token = (await api.post('/auth/login').send(creds).expect(200)).body.token;
  return { Authorization: `Bearer ${token}` };
}

const unreadCount = async (auth) => (await api.get('/notifications/unread-count').set(auth).expect(200)).body.count;
const notifications = async (auth) => (await api.get('/notifications').set(auth).expect(200)).body.notifications;

// Today's date in the server's local time, so the posting's deadline is always inside the reminder window.
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function applyToNewJob(title, extra = {}) {
  const jobId = (await api.post('/jobs').set(recruiter).send({ title, description: 'Do the work', ...extra }).expect(201)).body.job.id;
  const applicationId = (await api.post('/applications').set(seeker).send({ jobId }).expect(201)).body.application.id;
  return { jobId, applicationId };
}

before(async () => {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  migrate(db);
  api = request(createApp(db));
  recruiter = await login('us07-recruiter@test.com', 'recruiter');
  seeker = await login('us07-seeker@test.com', 'job_seeker');
  otherSeeker = await login('us07-other@test.com', 'job_seeker');
});
after(() => rmSync(tmp, { recursive: true, force: true }));

test("US-07 AT-1: a status change raises the job seeker's unread count, and reading the notification lowers it again", async () => {
  const { applicationId } = await applyToNewJob('Backend Developer');
  const before = await unreadCount(seeker);

  await api.patch(`/applications/${applicationId}`).set(recruiter).send({ status: 'Under Review' }).expect(200);
  assert.equal(await unreadCount(seeker), before + 1);

  const [newest] = await notifications(seeker);
  assert.equal(newest.applicationId, applicationId);
  assert.equal(newest.read, false);
  assert.ok(newest.link, 'the notification links to the application');

  const read = (await api.patch(`/notifications/${newest.id}/read`).set(seeker).expect(200)).body.notification;
  assert.equal(read.read, true);
  assert.equal(await unreadCount(seeker), before);
});

test('US-07 AT-2: moving an application to Interview creates a distinct interview invitation', async () => {
  const { applicationId } = await applyToNewJob('QA Analyst');
  await api.patch(`/applications/${applicationId}`).set(recruiter).send({ status: 'Interview' }).expect(200);

  const [newest] = await notifications(seeker);
  assert.equal(newest.type, 'interview_invite');
  assert.match(newest.title, /^Interview invite/);
  assert.equal(newest.applicationId, applicationId);
});

test('US-07 AT-3: a deadline within 3 days gives exactly one reminder for that posting, even after reloading', async () => {
  const { jobId } = await applyToNewJob('Closing Soon', { deadline: today() });

  for (let reload = 0; reload < 3; reload++) await notifications(seeker); // the job seeker keeps coming back
  await unreadCount(seeker);

  const reminders = (await notifications(seeker)).filter((n) => n.type === 'deadline_reminder' && n.jobId === jobId);
  assert.equal(reminders.length, 1);
});

test('US-07 AT-4: mark all as read resets the unread count to zero and the notifications stay in the history as read', async () => {
  const before = await notifications(seeker);
  assert.ok(before.some((n) => !n.read), 'there are unread notifications to start with');

  await api.patch('/notifications/read-all').set(seeker).expect(200);

  assert.equal(await unreadCount(seeker), 0);
  const after = await notifications(seeker);
  assert.deepEqual(after.map((n) => n.id), before.map((n) => n.id)); // nothing removed
  assert.ok(after.every((n) => n.read && n.readAt), 'all marked read');
});

test("US-07 AT-5: another user cannot see or mark someone else's notifications, and gets no notification data back", async () => {
  const { applicationId } = await applyToNewJob('Data Analyst');
  await api.patch(`/applications/${applicationId}`).set(recruiter).send({ status: 'Offered' }).expect(200);
  const [target] = await notifications(seeker);
  assert.equal(target.read, false);

  assert.ok(!(await notifications(otherSeeker)).some((n) => n.id === target.id), "not in the other user's list");
  const refused = await api.patch(`/notifications/${target.id}/read`).set(otherSeeker).expect(404);
  assert.deepEqual(Object.keys(refused.body), ['error']);

  // The other user's "mark all as read" only touches their own notifications.
  await api.patch('/notifications/read-all').set(otherSeeker).expect(200);
  assert.equal((await notifications(seeker)).find((n) => n.id === target.id).read, false);
});
