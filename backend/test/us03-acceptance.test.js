import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';

// Acceptance tests for US-03 (#90): search and filter job postings (backend side).

const tmp = mkdtempSync(join(tmpdir(), 'cc-us03-'));
process.env.UPLOAD_DIR = join(tmp, 'uploads');

const { default: Database } = await import('better-sqlite3');
const { migrate } = await import('../db/migrate.js');
const { createApp } = await import('../src/app.js');

let api;
let db;
before(async () => {
  db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  migrate(db);
  api = request(createApp(db));

  const creds = { email: 'us03-recruiter@test.com', password: 'Password123!', role: 'recruiter' };
  await api.post('/auth/signup').send(creds).expect(201);
  const token = (await api.post('/auth/login').send(creds).expect(200)).body.token;

  // Posted oldest first. Each gets a distinct creation time below, so "newest first" is unambiguous.
  const postings = [
    { title: 'Backend Developer', description: 'Node and SQL', location: 'Montreal', category: 'Engineering', deadline: '2026-12-01' },
    { title: 'Frontend Developer', description: 'Angular UI work', location: 'Toronto', category: 'Engineering', deadline: '2026-12-05' },
    { title: 'Backend Intern', description: 'Help the API team', location: 'Montreal', category: 'Internship', deadline: '2026-12-10' },
    { title: 'Product Designer', description: 'Design the backend admin screens', location: 'Montreal', category: 'Design', deadline: '2026-12-15' },
  ];
  for (const [i, job] of postings.entries()) {
    const res = await api.post('/jobs').set('Authorization', `Bearer ${token}`).send(job).expect(201);
    db.prepare('UPDATE jobs SET created_at = ? WHERE id = ?').run(`2026-11-0${i + 1} 12:00:00`, res.body.job.id);
  }
});
after(() => rmSync(tmp, { recursive: true, force: true }));

const titles = (res) => res.body.jobs.map((j) => j.title);

test('US-03 AT-1: the job list returns every open posting with title, location, category and deadline, newest first', async () => {
  const res = await api.get('/jobs').expect(200);

  assert.deepEqual(titles(res), ['Product Designer', 'Backend Intern', 'Frontend Developer', 'Backend Developer']);
  const newest = res.body.jobs[0];
  assert.equal(newest.location, 'Montreal');
  assert.equal(newest.category, 'Design');
  assert.equal(newest.deadline, '2026-12-15');
});

test('US-03 AT-2: keyword, location and category together only return postings that match all three', async () => {
  // "backend" alone matches 3 postings (two titles, one description); adding Montreal + Engineering leaves one.
  assert.equal(titles(await api.get('/jobs').query({ keyword: 'backend' }).expect(200)).length, 3);

  const res = await api.get('/jobs').query({ keyword: 'backend', location: 'Montreal', category: 'Engineering' }).expect(200);
  assert.deepEqual(titles(res), ['Backend Developer']);
});

test('US-03 AT-3: filters that match nothing return an empty list (the page then shows "No jobs match your search")', async () => {
  const res = await api.get('/jobs').query({ keyword: 'backend', location: 'Toronto', category: 'Design' }).expect(200);
  assert.deepEqual(res.body.jobs, []);
});
