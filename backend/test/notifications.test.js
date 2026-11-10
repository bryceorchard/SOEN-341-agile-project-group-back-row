import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

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

let seekerToken;
let recruiterToken;
let otherSeekerToken;
let jobId;

test('setup: a job seeker, a recruiter, and an unrelated job seeker', async () => {
  await api.post('/auth/signup').send({ email: 'seeker@test.com', password: 'Password123!', role: 'job_seeker' }).expect(201);
  await api.post('/auth/signup').send({ email: 'recruiter@test.com', password: 'Password123!', role: 'recruiter' }).expect(201);
  await api.post('/auth/signup').send({ email: 'other-seeker@test.com', password: 'Password123!', role: 'job_seeker' }).expect(201);
  seekerToken = (await api.post('/auth/login').send({ email: 'seeker@test.com', password: 'Password123!' }).expect(200)).body.token;
  recruiterToken = (await api.post('/auth/login').send({ email: 'recruiter@test.com', password: 'Password123!' }).expect(200)).body.token;
  otherSeekerToken = (await api.post('/auth/login').send({ email: 'other-seeker@test.com', password: 'Password123!' }).expect(200)).body.token;

  const job = (await api.post('/jobs').set('Authorization', `Bearer ${recruiterToken}`)
    .send({ title: 'Backend Developer', description: 'Work on the API' }).expect(201)).body.job;
  jobId = job.id;
});

test('applying creates exactly one new_application notification for the recruiter', async () => {
  const seekerAuth = { Authorization: `Bearer ${seekerToken}` };
  const recruiterAuth = { Authorization: `Bearer ${recruiterToken}` };

  await api.get('/notifications/unread-count').set(recruiterAuth).expect(200).then((r) => assert.equal(r.body.count, 0));

  await api.post('/applications').set(seekerAuth).send({ jobId }).expect(201);

  const recruiterNotifs = (await api.get('/notifications').set(recruiterAuth).expect(200)).body.notifications;
  assert.equal(recruiterNotifs.length, 1);
  assert.equal(recruiterNotifs[0].type, 'new_application');
  assert.equal(recruiterNotifs[0].read, false);
  assert.match(recruiterNotifs[0].message, /seeker@test\.com applied to Backend Developer/);
  assert.equal(recruiterNotifs[0].link, `/recruiter/postings/${jobId}/applicants`);

  // The seeker shouldn't get a notification for their own application.
  const seekerNotifs = (await api.get('/notifications').set(seekerAuth).expect(200)).body.notifications;
  assert.equal(seekerNotifs.length, 0);

  const count = (await api.get('/notifications/unread-count').set(recruiterAuth).expect(200)).body.count;
  assert.equal(count, 1);
});

test('a status change notifies the applicant: interview_invite for Interview, status_update otherwise', async () => {
  const seekerAuth = { Authorization: `Bearer ${seekerToken}` };
  const recruiterAuth = { Authorization: `Bearer ${recruiterToken}` };

  const applicationId = (await api.get('/applications').set(seekerAuth).expect(200)).body.applications[0].id;

  await api.patch(`/applications/${applicationId}`).set(recruiterAuth).send({ status: 'Under Review' }).expect(200);
  let seekerNotifs = (await api.get('/notifications').set(seekerAuth).expect(200)).body.notifications;
  assert.equal(seekerNotifs.length, 1);
  assert.equal(seekerNotifs[0].type, 'status_update');
  assert.match(seekerNotifs[0].message, /now "Under Review"/);

  await api.patch(`/applications/${applicationId}`).set(recruiterAuth).send({ status: 'Interview' }).expect(200);
  seekerNotifs = (await api.get('/notifications').set(seekerAuth).expect(200)).body.notifications;
  assert.equal(seekerNotifs.length, 2);
  // Newest first, even though both were created within the same second.
  assert.deepEqual(seekerNotifs.map((n) => n.type), ['interview_invite', 'status_update']);
  assert.match(seekerNotifs[0].message, /invited to interview for Backend Developer/);

  // Re-saving the status it already has doesn't notify again.
  await api.patch(`/applications/${applicationId}`).set(recruiterAuth).send({ status: 'Interview' }).expect(200);
  seekerNotifs = (await api.get('/notifications').set(seekerAuth).expect(200)).body.notifications;
  assert.equal(seekerNotifs.length, 2);
});

test('notifications are only visible and markable by their recipient', async () => {
  const seekerAuth = { Authorization: `Bearer ${seekerToken}` };
  const otherSeekerAuth = { Authorization: `Bearer ${otherSeekerToken}` };

  const notifId = (await api.get('/notifications').set(seekerAuth).expect(200)).body.notifications[0].id;

  await api.get('/notifications').set(otherSeekerAuth).expect(200).then((r) => assert.equal(r.body.notifications.length, 0));
  await api.patch(`/notifications/${notifId}/read`).set(otherSeekerAuth).expect(404);
});

test('?unread=true filters, PATCH /:id/read marks one, and PATCH /read-all clears the rest', async () => {
  const seekerAuth = { Authorization: `Bearer ${seekerToken}` };

  const all = (await api.get('/notifications').set(seekerAuth).expect(200)).body.notifications;
  assert.equal(all.length, 2);
  assert.ok(all.every((n) => !n.read));

  const unreadBefore = (await api.get('/notifications').query({ unread: 'true' }).set(seekerAuth).expect(200)).body.notifications;
  assert.equal(unreadBefore.length, 2);

  const marked = (await api.patch(`/notifications/${all[0].id}/read`).set(seekerAuth).expect(200)).body.notification;
  assert.equal(marked.read, true);
  assert.ok(marked.readAt);

  const unreadAfterOne = (await api.get('/notifications').query({ unread: 'true' }).set(seekerAuth).expect(200)).body.notifications;
  assert.equal(unreadAfterOne.length, 1);
  assert.equal((await api.get('/notifications/unread-count').set(seekerAuth).expect(200)).body.count, 1);

  await api.patch('/notifications/read-all').set(seekerAuth).expect(200);

  assert.equal((await api.get('/notifications/unread-count').set(seekerAuth).expect(200)).body.count, 0);
  const unreadAfterAll = (await api.get('/notifications').query({ unread: 'true' }).set(seekerAuth).expect(200)).body.notifications;
  assert.equal(unreadAfterAll.length, 0);
});

test('all routes require auth', async () => {
  await api.get('/notifications').expect(401);
  await api.get('/notifications/unread-count').expect(401);
  await api.patch('/notifications/1/read').expect(401);
  await api.patch('/notifications/read-all').expect(401);
});
