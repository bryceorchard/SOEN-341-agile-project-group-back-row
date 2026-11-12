import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Its own file so it gets its own process (node:test runs each file separately) and
// therefore a fresh src/ai/rate-limit.js module, with no other test's requests counted
// against this user.
const tmp = mkdtempSync(join(tmpdir(), 'cc-test-'));
process.env.UPLOAD_DIR = join(tmp, 'uploads');

const { default: Database } = await import('better-sqlite3');
const { migrate } = await import('../db/migrate.js');
const { createApp } = await import('../src/app.js');
const request = (await import('supertest')).default;

const db = new Database(':memory:');
db.pragma('foreign_keys = ON');
migrate(db);
const api = request(createApp(db));

let token, resumeId;

before(async () => {
  await api.post('/auth/signup').send({ email: 'limit@test.com', password: 'Password123!', role: 'job_seeker' }).expect(201);
  token = (await api.post('/auth/login').send({ email: 'limit@test.com', password: 'Password123!' }).expect(200)).body.token;
  const up = await api.post('/resumes').set('Authorization', `Bearer ${token}`)
    // No readable text, so every request is cheap (422, no provider call) but still counts
    // against the rate limit, which is checked before extraction.
    .attach('resume', Buffer.from('%PDF-1.4'), { filename: 'empty.pdf', contentType: 'application/pdf' }).expect(201);
  resumeId = up.body.resume.id;
});

test('a user is limited to a few feedback requests per minute', async () => {
  for (let i = 0; i < 5; i++) {
    const res = await api.post(`/resumes/${resumeId}/feedback`).set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 422); // no readable text; the point here is that it isn't 429 yet
  }
  const res = await api.post(`/resumes/${resumeId}/feedback`).set('Authorization', `Bearer ${token}`);
  assert.equal(res.status, 429);
});

test.after(() => rmSync(tmp, { recursive: true, force: true }));
