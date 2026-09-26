import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
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

const creds = { email: 'a@test.com', password: 'Password123!' };
let token;

test('signup validates input and rejects duplicates', async () => {
  await api.post('/auth/signup').send({ email: 'bad', password: 'Password123!' }).expect(400);
  await api.post('/auth/signup').send({ ...creds, password: 'short' }).expect(400);
  await api.post('/auth/signup').send({ ...creds, role: 'admin' }).expect(400);
  const res = await api.post('/auth/signup').send(creds).expect(201);
  assert.equal(res.body.user.email, creds.email);
  assert.equal(res.body.user.password_hash, undefined);
  await api.post('/auth/signup').send({ ...creds, email: 'A@test.com' }).expect(409);
});

test('login rejects bad credentials and returns a token', async () => {
  await api.post('/auth/login').send({ ...creds, password: 'wrongpass1' }).expect(401);
  const res = await api.post('/auth/login').send(creds).expect(200);
  token = res.body.token;
  assert.ok(token);
});

test('protected routes reject unauthenticated requests', async () => {
  await api.get('/auth/me').expect(401);
  await api.get('/profile').expect(401);
  await api.get('/resumes').expect(401);
  await api.get('/profile').set('Authorization', 'Bearer garbage').expect(401);
});

test('signup -> login -> me', async () => {
  const res = await api.get('/auth/me').set('Authorization', `Bearer ${token}`).expect(200);
  assert.equal(res.body.user.email, creds.email);
});

test('profile get/update', async () => {
  const auth = { Authorization: `Bearer ${token}` };
  await api.put('/profile').set(auth).send({}).expect(400);
  const res = await api.put('/profile').set(auth).send({ fullName: 'Ada L', headline: 'Dev' }).expect(200);
  assert.equal(res.body.profile.fullName, 'Ada L');
  const got = await api.get('/profile').set(auth).expect(200);
  assert.equal(got.body.profile.headline, 'Dev');
});

test('resume upload validates type, lists, and deletes', async () => {
  const auth = { Authorization: `Bearer ${token}` };
  await api.post('/resumes').set(auth).expect(400);
  await api.post('/resumes').set(auth).attach('resume', Buffer.from('x'), { filename: 'a.txt', contentType: 'text/plain' }).expect(400);
  const up = await api.post('/resumes').set(auth)
    .attach('resume', Buffer.from('%PDF-1.4'), { filename: 'cv.pdf', contentType: 'application/pdf' }).expect(201);
  const id = up.body.resume.id;
  const list = await api.get('/resumes').set(auth).expect(200);
  assert.equal(list.body.resumes.length, 1);
  await api.delete(`/resumes/${id}`).set(auth).expect(204);
  await api.delete(`/resumes/${id}`).set(auth).expect(404);
  assert.equal((await api.get('/resumes').set(auth)).body.resumes.length, 0);
  assert.equal(existsSync(join(tmp, 'uploads')), true);
});
