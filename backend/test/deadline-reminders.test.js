import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

const { default: Database } = await import('better-sqlite3');
const { migrate } = await import('../db/migrate.js');
const { createApp } = await import('../src/app.js');
const { generateDeadlineReminders, daysUntilDeadline } = await import('../src/deadline-reminders.js');

// A fixed "now": midday (server local time) on Mon 2026-11-16.
const NOW = new Date(2026, 10, 16, 12, 0, 0);

let db;
let recruiterId;
let seekerId;

function addUser(email, role) {
  return db.prepare("INSERT INTO users (email, password_hash, role) VALUES (?, 'x', ?)").run(email, role).lastInsertRowid;
}

function addJob({ deadline, status = 'open', archived = false, title = 'Backend Developer' }) {
  return db
    .prepare(
      `INSERT INTO jobs (recruiter_id, title, description, deadline, status, archived_at)
       VALUES (?, ?, 'desc', ?, ?, ?)`
    )
    .run(recruiterId, title, deadline, status, archived ? '2026-11-01 00:00:00' : null).lastInsertRowid;
}

function apply(jobId, userId = seekerId, status = 'Applied') {
  return db.prepare('INSERT INTO applications (user_id, job_id, status) VALUES (?, ?, ?)').run(userId, jobId, status).lastInsertRowid;
}

function reminders(userId) {
  return db
    .prepare("SELECT * FROM notifications WHERE user_id = ? AND type = 'deadline_reminder' ORDER BY id")
    .all(userId);
}

beforeEach(() => {
  db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  migrate(db);
  recruiterId = addUser('recruiter@test.com', 'recruiter');
  seekerId = addUser('seeker@test.com', 'job_seeker');
});

test('daysUntilDeadline counts calendar days, with the deadline day itself as 0', () => {
  assert.equal(daysUntilDeadline('2026-11-16', NOW), 0);
  assert.equal(daysUntilDeadline('2026-11-19', NOW), 3);
  assert.equal(daysUntilDeadline('2026-11-20', NOW), 4);
  assert.equal(daysUntilDeadline('2026-11-15', NOW), -1);
  // Late in the evening is still the same calendar day.
  assert.equal(daysUntilDeadline('2026-11-16', new Date(2026, 10, 16, 23, 30)), 0);
});

test('daysUntilDeadline returns null for a missing or unparseable deadline', () => {
  assert.equal(daysUntilDeadline(null, NOW), null);
  assert.equal(daysUntilDeadline('', NOW), null);
  assert.equal(daysUntilDeadline('next Friday', NOW), null);
});

test('inside the window: the recruiter and the applicant each get one reminder', () => {
  const jobId = addJob({ deadline: '2026-11-18' });
  const applicationId = apply(jobId);

  generateDeadlineReminders(db, NOW);

  const [recruiterReminder] = reminders(recruiterId);
  assert.equal(reminders(recruiterId).length, 1);
  assert.equal(recruiterReminder.job_id, jobId);
  assert.equal(recruiterReminder.link, `/recruiter/postings/${jobId}/applicants`);

  const [seekerReminder] = reminders(seekerId);
  assert.equal(reminders(seekerId).length, 1);
  assert.equal(seekerReminder.job_id, jobId);
  assert.equal(seekerReminder.application_id, applicationId);
  assert.equal(seekerReminder.link, '/applications');
});

test('window edges: the deadline day and 3 days out are included; 4 days out and past deadlines are not', () => {
  const today = addJob({ deadline: '2026-11-16', title: 'Today' });
  const inThree = addJob({ deadline: '2026-11-19', title: 'In three' });
  addJob({ deadline: '2026-11-20', title: 'In four' });
  addJob({ deadline: '2026-11-15', title: 'Yesterday' });

  generateDeadlineReminders(db, NOW);

  assert.deepEqual(reminders(recruiterId).map((n) => n.job_id), [today, inThree]);
});

test('the window size can be configured', () => {
  addJob({ deadline: '2026-11-20' });

  generateDeadlineReminders(db, NOW, 3);
  assert.equal(reminders(recruiterId).length, 0);

  generateDeadlineReminders(db, NOW, 4);
  assert.equal(reminders(recruiterId).length, 1);
});

test('no duplicates: generating again does not create a second reminder', () => {
  const jobId = addJob({ deadline: '2026-11-18' });
  apply(jobId);

  generateDeadlineReminders(db, NOW);
  generateDeadlineReminders(db, NOW);
  generateDeadlineReminders(db, new Date(2026, 10, 17, 9, 0));

  assert.equal(reminders(recruiterId).length, 1);
  assert.equal(reminders(seekerId).length, 1);
});

test('closed and archived postings are skipped', () => {
  const closed = addJob({ deadline: '2026-11-18', status: 'closed' });
  const archived = addJob({ deadline: '2026-11-18', archived: true });
  apply(closed);
  apply(archived, addUser('archived-applicant@test.com', 'job_seeker'));

  generateDeadlineReminders(db, NOW);

  assert.equal(reminders(recruiterId).length, 0);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM notifications WHERE type = 'deadline_reminder'").get().n, 0);
});

test('postings with no deadline or an unparseable deadline are skipped', () => {
  addJob({ deadline: null });
  addJob({ deadline: 'next Friday' });

  generateDeadlineReminders(db, NOW);

  assert.equal(reminders(recruiterId).length, 0);
});

test('Rejected and Offered applicants are skipped; other statuses are reminded', () => {
  const jobId = addJob({ deadline: '2026-11-18' });
  const statuses = ['Applied', 'Under Review', 'Interview', 'Offered', 'Rejected'];
  const ids = Object.fromEntries(
    statuses.map((status) => {
      const userId = addUser(`${status.replace(' ', '').toLowerCase()}@test.com`, 'job_seeker');
      apply(jobId, userId, status);
      return [status, userId];
    })
  );

  generateDeadlineReminders(db, NOW);

  for (const status of ['Applied', 'Under Review', 'Interview']) {
    assert.equal(reminders(ids[status]).length, 1, `${status} applicant should be reminded`);
  }
  for (const status of ['Offered', 'Rejected']) {
    assert.equal(reminders(ids[status]).length, 0, `${status} applicant should not be reminded`);
  }
});

test('reading notifications through the API generates due reminders for the recipient only', async () => {
  const api = request(createApp(db));
  await api.post('/auth/signup').send({ email: 'api-seeker@test.com', password: 'Password123!', role: 'job_seeker' }).expect(201);
  await api.post('/auth/signup').send({ email: 'api-recruiter@test.com', password: 'Password123!', role: 'recruiter' }).expect(201);
  const seekerToken = (await api.post('/auth/login').send({ email: 'api-seeker@test.com', password: 'Password123!' }).expect(200)).body.token;
  const recruiterToken = (await api.post('/auth/login').send({ email: 'api-recruiter@test.com', password: 'Password123!' }).expect(200)).body.token;

  // A deadline of today (real clock) is always inside the window.
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const jobId = (await api.post('/jobs').set('Authorization', `Bearer ${recruiterToken}`)
    .send({ title: 'Closing Today', description: 'desc', deadline: today }).expect(201)).body.job.id;
  await api.post('/applications').set('Authorization', `Bearer ${seekerToken}`).send({ jobId }).expect(201);

  const count = (await api.get('/notifications/unread-count').set('Authorization', `Bearer ${seekerToken}`).expect(200)).body.count;
  assert.equal(count, 1);

  const seekerNotifs = (await api.get('/notifications').set('Authorization', `Bearer ${seekerToken}`).expect(200)).body.notifications;
  assert.deepEqual(seekerNotifs.map((n) => n.type), ['deadline_reminder']);
  assert.equal(seekerNotifs[0].jobId, jobId);

  const recruiterTypes = (await api.get('/notifications').set('Authorization', `Bearer ${recruiterToken}`).expect(200))
    .body.notifications.map((n) => n.type);
  assert.deepEqual(recruiterTypes.sort(), ['deadline_reminder', 'new_application']);
});
