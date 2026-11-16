// #134 (US-21): application status history, GET /applications/stats, GET /applications/:id/history.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

const { default: Database } = await import('better-sqlite3');
const { migrate } = await import('../db/migrate.js');
const { createApp } = await import('../src/app.js');
const { computeStats } = await import('../src/application-stats.js');

// --- computeStats on known data, with a fixed "now" ---------------------------------------

// Wednesday 2026-11-18, so the current week starts Monday 2026-11-16.
const NOW = new Date('2026-11-18T12:00:00Z');
const KNOWN = [
  { status: 'Applied', appliedAt: '2026-11-17 09:00:00', responded: false, jobOpen: true },
  { status: 'Under Review', appliedAt: '2026-11-12 09:00:00', responded: true, jobOpen: true },
  { status: 'Interview', appliedAt: '2026-11-05 10:00:00', responded: true, jobOpen: false },
  { status: 'Rejected', appliedAt: '2026-10-20 10:00:00', responded: true, jobOpen: false },
  // Moved past Applied and back again: still counts as a response. Too old for any window.
  { status: 'Applied', appliedAt: '2026-09-01 10:00:00', responded: true, jobOpen: false },
];

test('computeStats: counts and percentages per status', () => {
  const s = computeStats(KNOWN, NOW);
  assert.equal(s.total, 5);
  assert.deepEqual(s.byStatus, [
    { status: 'Applied', count: 2, percent: 40 },
    { status: 'Under Review', count: 1, percent: 20 },
    { status: 'Interview', count: 1, percent: 20 },
    { status: 'Offered', count: 0, percent: 0 },
    { status: 'Rejected', count: 1, percent: 20 },
  ]);
  assert.equal(s.byStatus.reduce((n, b) => n + b.count, 0), s.total);
});

test('computeStats: activity metrics, response rate and open vs closed postings', () => {
  const s = computeStats(KNOWN, NOW);
  assert.equal(s.submittedLast7Days, 2);
  assert.equal(s.submittedLast30Days, 4);
  assert.equal(s.responded, 4);
  assert.equal(s.responseRate, 80);
  assert.deepEqual(s.postings, { open: 2, closed: 3 });
});

test('computeStats: 8 Monday-start weeks, oldest first, ending with the current week', () => {
  const s = computeStats(KNOWN, NOW);
  assert.deepEqual(s.perWeek, [
    { weekStart: '2026-09-28', count: 0 },
    { weekStart: '2026-10-05', count: 0 },
    { weekStart: '2026-10-12', count: 0 },
    { weekStart: '2026-10-19', count: 1 },
    { weekStart: '2026-10-26', count: 0 },
    { weekStart: '2026-11-02', count: 1 },
    { weekStart: '2026-11-09', count: 1 },
    { weekStart: '2026-11-16', count: 1 },
  ]);

  // On a Sunday the current week still started the Monday before.
  const sunday = computeStats(KNOWN, new Date('2026-11-22T23:00:00Z'));
  assert.equal(sunday.perWeek.at(-1).weekStart, '2026-11-16');
});

test('computeStats: the 7-day window excludes an application exactly 7 days old', () => {
  const s = computeStats([{ status: 'Applied', appliedAt: '2026-11-11 12:00:00', responded: false, jobOpen: true }], NOW);
  assert.equal(s.submittedLast7Days, 0);
  assert.equal(s.submittedLast30Days, 1);
});

test('computeStats: no applications gives zeros, not NaN', () => {
  const s = computeStats([], NOW);
  assert.equal(s.total, 0);
  assert.equal(s.responseRate, 0);
  assert.ok(s.byStatus.every((b) => b.count === 0 && b.percent === 0));
  assert.equal(s.perWeek.length, 8);
  assert.ok(s.perWeek.every((w) => w.count === 0));
  assert.deepEqual(s.postings, { open: 0, closed: 0 });
});

// --- API ------------------------------------------------------------------------------

let api;
let db;
before(() => {
  db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  migrate(db);
  api = request(createApp(db));
});

const auth = (token) => ({ Authorization: `Bearer ${token}` });
async function login(email, role) {
  await api.post('/auth/signup').send({ email, password: 'Password123!', role }).expect(201);
  return (await api.post('/auth/login').send({ email, password: 'Password123!' }).expect(200)).body.token;
}

let seeker;
let otherSeeker;
let recruiter;
let otherRecruiter;
const jobIds = [];
const applicationIds = [];

test('setup: two job seekers, two recruiters, three postings', async () => {
  seeker = await login('seeker@test.com', 'job_seeker');
  otherSeeker = await login('other-seeker@test.com', 'job_seeker');
  recruiter = await login('recruiter@test.com', 'recruiter');
  otherRecruiter = await login('other-recruiter@test.com', 'recruiter');
  for (const title of ['Backend Developer', 'QA Analyst', 'Data Engineer']) {
    jobIds.push((await api.post('/jobs').set(auth(recruiter)).send({ title, description: 'x' }).expect(201)).body.job.id);
  }
});

test('applying writes one Applied history row, by the applicant', async () => {
  for (const jobId of jobIds) {
    applicationIds.push((await api.post('/applications').set(auth(seeker)).send({ jobId }).expect(201)).body.application.id);
  }
  const { history } = (await api.get(`/applications/${applicationIds[0]}/history`).set(auth(seeker)).expect(200)).body;
  assert.equal(history.length, 1);
  assert.equal(history[0].status, 'Applied');
  assert.equal(history[0].changedBy, 'applicant');
  assert.match(history[0].changedAt, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
});

test('each real status change adds a history row; re-saving the same status does not', async () => {
  const id = applicationIds[0];
  await api.patch(`/applications/${id}`).set(auth(recruiter)).send({ status: 'Under Review' }).expect(200);
  await api.patch(`/applications/${id}`).set(auth(recruiter)).send({ status: 'Interview' }).expect(200);
  await api.patch(`/applications/${id}`).set(auth(recruiter)).send({ status: 'Interview' }).expect(200);

  const { history } = (await api.get(`/applications/${id}/history`).set(auth(seeker)).expect(200)).body;
  assert.deepEqual(history.map((h) => h.status), ['Applied', 'Under Review', 'Interview']);
  assert.deepEqual(history.map((h) => h.changedBy), ['applicant', 'recruiter', 'recruiter']);

  // The status change still notifies once per real change (#136 goes through the same helper).
  const notifs = (await api.get('/notifications').set(auth(seeker)).expect(200)).body.notifications;
  assert.deepEqual(notifs.map((n) => n.type), ['interview_invite', 'status_update']);
});

test('a failed status update writes no history row', async () => {
  const id = applicationIds[1];
  await api.patch(`/applications/${id}`).set(auth(otherRecruiter)).send({ status: 'Offered' }).expect(404);
  await api.patch(`/applications/${id}`).set(auth(recruiter)).send({ status: 'Hired' }).expect(400);
  const { history } = (await api.get(`/applications/${id}/history`).set(auth(seeker)).expect(200)).body;
  assert.deepEqual(history.map((h) => h.status), ['Applied']);
});

test('history: the owning recruiter can read it; other users get 404; no token gets 401', async () => {
  const id = applicationIds[0];
  const { history } = (await api.get(`/applications/${id}/history`).set(auth(recruiter)).expect(200)).body;
  assert.equal(history.length, 3);

  for (const token of [otherSeeker, otherRecruiter]) {
    const res = await api.get(`/applications/${id}/history`).set(auth(token)).expect(404);
    assert.equal(res.body.history, undefined);
  }
  await api.get(`/applications/${id}/history`).expect(401);
  await api.get('/applications/99999/history').set(auth(seeker)).expect(404);
});

test('GET /applications/stats reflects the job seeker\'s own applications', async () => {
  // Spread the three applications out: 3, 10 and 40 days ago, and close the third posting.
  const setAppliedAt = db.prepare("UPDATE applications SET applied_at = datetime('now', ?) WHERE id = ?");
  setAppliedAt.run('-3 days', applicationIds[0]);
  setAppliedAt.run('-10 days', applicationIds[1]);
  setAppliedAt.run('-40 days', applicationIds[2]);
  await api.patch(`/jobs/${jobIds[2]}/status`).set(auth(recruiter)).send({ status: 'closed' }).expect(200);

  const { stats } = (await api.get('/applications/stats').set(auth(seeker)).expect(200)).body;
  assert.equal(stats.total, 3);
  assert.deepEqual(
    Object.fromEntries(stats.byStatus.map((b) => [b.status, [b.count, b.percent]])),
    { Applied: [2, 66.7], 'Under Review': [0, 0], Interview: [1, 33.3], Offered: [0, 0], Rejected: [0, 0] }
  );
  assert.equal(stats.submittedLast7Days, 1);
  assert.equal(stats.submittedLast30Days, 2);
  assert.equal(stats.responded, 1);
  assert.equal(stats.responseRate, 33.3);
  assert.deepEqual(stats.postings, { open: 2, closed: 1 });
  assert.equal(stats.perWeek.length, 8);
  assert.equal(stats.perWeek.reduce((n, w) => n + w.count, 0), 3);
  assert.ok(stats.perWeek.every((w) => new Date(`${w.weekStart}T00:00:00Z`).getUTCDay() === 1));
});

test('GET /applications/stats only counts the caller\'s applications', async () => {
  const { stats } = (await api.get('/applications/stats').set(auth(otherSeeker)).expect(200)).body;
  assert.equal(stats.total, 0);
  assert.equal(stats.responseRate, 0);
  await api.get('/applications/stats').expect(401);
});

test('migrate backfills one history row per application that has none, and only once', async () => {
  // An application from before #134: inserted directly, no history.
  const legacyJob = jobIds[1];
  const { lastInsertRowid: legacyId } = db
    .prepare(
      "INSERT INTO applications (user_id, job_id, status, applied_at, updated_at) VALUES ((SELECT id FROM users WHERE email = 'other-seeker@test.com'), ?, 'Interview', '2026-10-01 09:00:00', '2026-10-08 15:30:00')"
    )
    .run(legacyJob);
  const historyRows = () => db.prepare('SELECT COUNT(*) AS n FROM application_status_history').get().n;
  const before = historyRows();

  migrate(db);
  assert.equal(historyRows(), before + 1);
  const { history } = (await api.get(`/applications/${legacyId}/history`).set(auth(otherSeeker)).expect(200)).body;
  assert.deepEqual(history, [{ status: 'Interview', changedAt: '2026-10-08 15:30:00', changedBy: null }]);

  migrate(db);
  assert.equal(historyRows(), before + 1);

  // An Applied one is dated by applied_at.
  const { lastInsertRowid: appliedId } = db
    .prepare(
      "INSERT INTO applications (user_id, job_id, status, applied_at, updated_at) VALUES ((SELECT id FROM users WHERE email = 'other-seeker@test.com'), ?, 'Applied', '2026-10-02 09:00:00', '2026-10-05 09:00:00')"
    )
    .run(jobIds[0]);
  migrate(db);
  const row = db.prepare('SELECT status, changed_at FROM application_status_history WHERE application_id = ?').get(appliedId);
  assert.deepEqual(row, { status: 'Applied', changed_at: '2026-10-02 09:00:00' });
});
