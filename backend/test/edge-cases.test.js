import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';

// Temporary folder for uploads, deleted after the tests
const tmp = mkdtempSync(join(tmpdir(), 'cc-edge-'));
process.env.UPLOAD_DIR = join(tmp, 'uploads');

const { default: Database } = await import('better-sqlite3');
const { migrate } = await import('../db/migrate.js');
const { createApp } = await import('../src/app.js');

let api;
before(() => {
  const db = new Database(':memory:'); // fresh in-memory database
  db.pragma('foreign_keys = ON');
  migrate(db);
  api = request(createApp(db));
});
after(() => rmSync(tmp, { recursive: true, force: true }));

// Helper: create a user, log in, return the auth header
async function signupAndLogin(email) {
  const creds = { email, password: 'Password123!' };
  await api.post('/auth/signup').send(creds).expect(201);
  const res = await api.post('/auth/login').send(creds).expect(200);
  return { Authorization: `Bearer ${res.body.token}` };
}

const pdf = { filename: 'cv.pdf', contentType: 'application/pdf' };

test('login with an unknown email is rejected', async () => {
  await api.post('/auth/login')
    .send({ email: 'nobody@test.com', password: 'Password123!' })
    .expect(401);
});

test('signup with missing fields is rejected', async () => {
  await api.post('/auth/signup').send({}).expect(400);
  await api.post('/auth/signup').send({ email: 'x@test.com' }).expect(400);
});

test('resume upload requires login', async () => {
  await api.post('/resumes').expect(401);
});

test("users cannot see or delete each other's resumes", async () => {
  const alice = await signupAndLogin('alice@test.com');
  const bob = await signupAndLogin('bob@test.com');

  const up = await api.post('/resumes').set(alice)
    .attach('resume', Buffer.from('%PDF-1.4'), pdf).expect(201);
  const id = up.body.resume.id;

  const bobList = await api.get('/resumes').set(bob).expect(200);
  assert.equal(bobList.body.resumes.length, 0); // Bob sees nothing

  await api.delete(`/resumes/${id}`).set(bob).expect(404); // Bob can't delete it

  const aliceList = await api.get('/resumes').set(alice).expect(200);
  assert.equal(aliceList.body.resumes.length, 1); // Alice's resume is still there
});

test("users cannot see each other's profiles", async () => {
  const carol = await signupAndLogin('carol@test.com');
  const dave = await signupAndLogin('dave@test.com');

  await api.put('/profile').set(carol).send({ fullName: 'Carol C' }).expect(200);

  const res = await api.get('/profile').set(dave);
  assert.notEqual(res.body.profile?.fullName, 'Carol C'); // Dave doesn't see Carol's name
});
