import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import request from 'supertest';

// Acceptance tests for US-10 Sprint 3 slice (#147): AI resume feedback error handling and
// access control (backend side). AT-1 and AT-2 are demonstrated by resume-feedback.test.js;
// AT-5 (privacy notice) is a frontend-only concern, shown in #140's UI.

const tmp = mkdtempSync(join(tmpdir(), 'cc-us10-'));
process.env.UPLOAD_DIR = join(tmp, 'uploads');
delete process.env.AI_API_KEY;
process.env.AI_PROVIDER = 'mock'; // the real provider module must stay on the deterministic mock

const { default: Database } = await import('better-sqlite3');
const { migrate } = await import('../db/migrate.js');
const { createApp } = await import('../src/app.js');
const { default: authRoutes } = await import('../src/routes/auth.js');
const { default: resumeRoutes } = await import('../src/routes/resumes.js');
const { default: resumeFeedbackRoutes } = await import('../src/routes/resume-feedback.js');
const { notFound, errorHandler } = await import('../src/middleware.js');
const { ProviderUnavailableError, MOCK_REPLY } = await import('../src/ai/provider.js');
const { resetRateLimitForTests } = await import('../src/ai/rate-limit.js');

const FIXTURES = fileURLToPath(new URL('./fixtures/resumes-real/', import.meta.url));
const samplePdf = readFileSync(join(FIXTURES, 'sample.pdf'));

function buildDiApp(db, overrides) {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRoutes(db));
  app.use('/resumes', resumeRoutes(db));
  app.use('/resumes', resumeFeedbackRoutes(db, overrides));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

function freshDb() {
  resetRateLimitForTests(); // a fresh :memory: db reuses small user ids; don't inherit another test's usage
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  migrate(db);
  return db;
}

const login = async (api, email) => {
  await api.post('/auth/signup').send({ email, password: 'Password123!', role: 'job_seeker' }).expect(201);
  return (await api.post('/auth/login').send({ email, password: 'Password123!' }).expect(200)).body.token;
};

after(() => rmSync(tmp, { recursive: true, force: true }));

test('US-10 AT-3: a resume with no extractable text gives a clear error and saves nothing', async () => {
  const db = freshDb();
  const api = request(createApp(db));
  const token = await login(api, 'at3-notext@test.com');

  const up = await api.post('/resumes').set('Authorization', `Bearer ${token}`)
    .attach('resume', Buffer.from('%PDF-1.4'), { filename: 'empty.pdf', contentType: 'application/pdf' }).expect(201);

  const res = await api.post(`/resumes/${up.body.resume.id}/feedback`).set('Authorization', `Bearer ${token}`).expect(422);
  assert.ok(res.body.error?.length > 0, 'a clear error message');

  const get = await api.get(`/resumes/${up.body.resume.id}/feedback`).set('Authorization', `Bearer ${token}`).expect(200);
  assert.equal(get.body.feedback, null, 'no empty or partial feedback saved');
  db.close();
});

test('US-10 AT-3: the AI service being unavailable gives a clear error and saves nothing', async () => {
  const db = freshDb();
  const api = request(buildDiApp(db, {
    extractText: async () => 'some resume text with enough letters to pass the minimum check',
    getFeedbackReply: async () => { throw new ProviderUnavailableError('simulated outage'); },
  }));
  const token = await login(api, 'at3-outage@test.com');
  const up = await api.post('/resumes').set('Authorization', `Bearer ${token}`)
    .attach('resume', samplePdf, { filename: 'sample.pdf', contentType: 'application/pdf' }).expect(201);

  const res = await api.post(`/resumes/${up.body.resume.id}/feedback`).set('Authorization', `Bearer ${token}`).expect(503);
  assert.ok(res.body.error?.length > 0, 'a clear error message');

  const get = await api.get(`/resumes/${up.body.resume.id}/feedback`).set('Authorization', `Bearer ${token}`).expect(200);
  assert.equal(get.body.feedback, null, 'no empty or partial feedback saved');
  db.close();
});

test('US-10 AT-4: a user who does not own the resume is refused, and no resume data ever reaches the AI service', async () => {
  const db = freshDb();
  let extractCalled = false;
  let providerCalled = false;
  const api = request(buildDiApp(db, {
    extractText: async () => { extractCalled = true; return 'resume text with enough letters to pass the minimum check'; },
    getFeedbackReply: async () => {
      providerCalled = true;
      return MOCK_REPLY;
    },
  }));

  const ownerToken = await login(api, 'at4-owner@test.com');
  const intruderToken = await login(api, 'at4-intruder@test.com');

  const up = await api.post('/resumes').set('Authorization', `Bearer ${ownerToken}`)
    .attach('resume', samplePdf, { filename: 'sample.pdf', contentType: 'application/pdf' }).expect(201);
  const resumeId = up.body.resume.id;

  await api.post(`/resumes/${resumeId}/feedback`).set('Authorization', `Bearer ${intruderToken}`).expect(404);
  await api.get(`/resumes/${resumeId}/feedback`).set('Authorization', `Bearer ${intruderToken}`).expect(404);
  await api.post(`/resumes/${resumeId}/feedback`).expect(401);
  await api.get(`/resumes/${resumeId}/feedback`).expect(401);

  assert.equal(extractCalled, false, "the resume's text was never extracted for an unauthorized request");
  assert.equal(providerCalled, false, 'the AI provider was never called for an unauthorized request');

  // Control: the owner's request does reach both, so the spies above are actually wired in.
  await api.post(`/resumes/${resumeId}/feedback`).set('Authorization', `Bearer ${ownerToken}`).expect(201);
  assert.equal(extractCalled, true);
  assert.equal(providerCalled, true);
  db.close();
});
