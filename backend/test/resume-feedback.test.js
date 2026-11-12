import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import request from 'supertest';

const tmp = mkdtempSync(join(tmpdir(), 'cc-test-'));
process.env.UPLOAD_DIR = join(tmp, 'uploads');
delete process.env.AI_API_KEY; // the real provider must stay on the deterministic mock

const { default: Database } = await import('better-sqlite3');
const { migrate } = await import('../db/migrate.js');
const { createApp } = await import('../src/app.js');
const { default: authRoutes } = await import('../src/routes/auth.js');
const { default: resumeRoutes } = await import('../src/routes/resumes.js');
const { default: resumeFeedbackRoutes } = await import('../src/routes/resume-feedback.js');
const { notFound, errorHandler } = await import('../src/middleware.js');
const { ProviderUnavailableError } = await import('../src/ai/provider.js');
const { resetRateLimitForTests } = await import('../src/ai/rate-limit.js');

const FIXTURES = fileURLToPath(new URL('./fixtures/resumes-real/', import.meta.url));
const samplePdf = readFileSync(join(FIXTURES, 'sample.pdf'));

// A second app wired with injectable extraction/provider functions, so the error paths
// (invalid reply, provider outage, not-a-resume) can be tested deterministically with no
// real file parsing and no network call.
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

let db;
let realApi;
after(() => rmSync(tmp, { recursive: true, force: true }));
before(() => {
  db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  migrate(db);
  realApi = request(createApp(db));
});

const login = async (api, email) => {
  await api.post('/auth/signup').send({ email, password: 'Password123!', role: 'job_seeker' }).expect(201);
  return (await api.post('/auth/login').send({ email, password: 'Password123!' }).expect(200)).body.token;
};

let token, otherToken, resumeId;

test('setup: a job seeker, an unrelated job seeker, and an uploaded resume', async () => {
  token = await login(realApi, 'fb@test.com');
  otherToken = await login(realApi, 'fb-other@test.com');

  const up = await realApi.post('/resumes').set('Authorization', `Bearer ${token}`)
    .attach('resume', samplePdf, { filename: 'sample.pdf', contentType: 'application/pdf' }).expect(201);
  resumeId = up.body.resume.id;
});

test('feedback routes require auth', async () => {
  await realApi.post(`/resumes/${resumeId}/feedback`).expect(401);
  await realApi.get(`/resumes/${resumeId}/feedback`).expect(401);
});

test('GET before any feedback has been generated returns null', async () => {
  const res = await realApi.get(`/resumes/${resumeId}/feedback`).set('Authorization', `Bearer ${token}`).expect(200);
  assert.equal(res.body.feedback, null);
});

test("another user gets 404 on someone else's resume, and a missing resume is 404", async () => {
  await realApi.post(`/resumes/${resumeId}/feedback`).set('Authorization', `Bearer ${otherToken}`).expect(404);
  await realApi.get(`/resumes/${resumeId}/feedback`).set('Authorization', `Bearer ${otherToken}`).expect(404);
  await realApi.post('/resumes/999999/feedback').set('Authorization', `Bearer ${token}`).expect(404);
});

test('real extraction + the mock provider: feedback is generated, schema-valid and stored', async () => {
  const res = await realApi.post(`/resumes/${resumeId}/feedback`).set('Authorization', `Bearer ${token}`).expect(201);
  const fb = res.body.feedback;
  assert.equal(fb.resumeId, resumeId);
  assert.equal(fb.model, 'mock');
  assert.equal(fb.promptVersion, 'resume-feedback-v1');
  assert.equal(fb.isResume, true);
  assert.ok(fb.summary.length > 0);
  assert.ok(Array.isArray(fb.strengths) && fb.strengths.length > 0);
  assert.ok(Array.isArray(fb.improvements) && fb.improvements.length > 0);
  assert.ok(Array.isArray(fb.rewordings));

  const get = await realApi.get(`/resumes/${resumeId}/feedback`).set('Authorization', `Bearer ${token}`).expect(200);
  assert.deepEqual(get.body.feedback, fb);
});

test('a resume with no readable text is 422 and nothing is saved', async () => {
  const up = await realApi.post('/resumes').set('Authorization', `Bearer ${token}`)
    .attach('resume', Buffer.from('%PDF-1.4'), { filename: 'empty.pdf', contentType: 'application/pdf' }).expect(201);
  const emptyId = up.body.resume.id;

  await realApi.post(`/resumes/${emptyId}/feedback`).set('Authorization', `Bearer ${token}`).expect(422);
  const get = await realApi.get(`/resumes/${emptyId}/feedback`).set('Authorization', `Bearer ${token}`).expect(200);
  assert.equal(get.body.feedback, null);
});

// --- injected provider: error paths and replacement -----------------------------------

let diDb, diApi, diToken, diResumeId;

test('setup: a second app with an injectable provider, for the error paths', async () => {
  resetRateLimitForTests(); // a fresh :memory: db reuses small user ids; don't inherit realApi's usage
  diDb = new Database(':memory:');
  diDb.pragma('foreign_keys = ON');
  migrate(diDb);

  let reply = JSON.stringify({ not: 'valid' });
  diApi = request(buildDiApp(diDb, {
    extractText: async () => 'some resume text with enough letters to pass the minimum check',
    getFeedbackReply: async () => reply,
  }));
  diApi._setReply = (v) => { reply = v; }; // eslint-disable-line no-underscore-dangle

  diToken = await login(diApi, 'di@test.com');
  const up = await diApi.post('/resumes').set('Authorization', `Bearer ${diToken}`)
    .attach('resume', samplePdf, { filename: 'sample.pdf', contentType: 'application/pdf' }).expect(201);
  diResumeId = up.body.resume.id;
});

test('an invalid provider reply is 502 and nothing is saved', async () => {
  await diApi.post(`/resumes/${diResumeId}/feedback`).set('Authorization', `Bearer ${diToken}`).expect(502);
  const get = await diApi.get(`/resumes/${diResumeId}/feedback`).set('Authorization', `Bearer ${diToken}`).expect(200);
  assert.equal(get.body.feedback, null);
});

test('isResume: false is 422 and nothing is saved', async () => {
  diApi._setReply(JSON.stringify({ isResume: false, strengths: [], improvements: [], rewordings: [], summary: "This text isn't a resume." }));
  await diApi.post(`/resumes/${diResumeId}/feedback`).set('Authorization', `Bearer ${diToken}`).expect(422);
  const get = await diApi.get(`/resumes/${diResumeId}/feedback`).set('Authorization', `Bearer ${diToken}`).expect(200);
  assert.equal(get.body.feedback, null);
});

test('a provider outage is 503 and nothing is saved', async () => {
  resetRateLimitForTests(); // isolate this db's reused user id from diDb's usage above
  const outageDb = new Database(':memory:');
  outageDb.pragma('foreign_keys = ON');
  migrate(outageDb);
  const outageApi = request(buildDiApp(outageDb, {
    extractText: async () => 'some resume text with enough letters to pass the minimum check',
    getFeedbackReply: async () => { throw new ProviderUnavailableError('boom'); },
  }));
  const outageToken = await login(outageApi, 'outage@test.com');
  const up = await outageApi.post('/resumes').set('Authorization', `Bearer ${outageToken}`)
    .attach('resume', samplePdf, { filename: 'sample.pdf', contentType: 'application/pdf' }).expect(201);
  const outageResumeId = up.body.resume.id;

  await outageApi.post(`/resumes/${outageResumeId}/feedback`).set('Authorization', `Bearer ${outageToken}`).expect(503);
  const get = await outageApi.get(`/resumes/${outageResumeId}/feedback`).set('Authorization', `Bearer ${outageToken}`).expect(200);
  assert.equal(get.body.feedback, null);
});

test('a second POST replaces the stored feedback rather than adding a row', async () => {
  const sample = JSON.parse(readFileSync(join(FIXTURES, '..', 'ai', 'sample-feedback.json'), 'utf8'));
  diApi._setReply(JSON.stringify(sample));
  const first = await diApi.post(`/resumes/${diResumeId}/feedback`).set('Authorization', `Bearer ${diToken}`).expect(201);
  assert.equal(first.body.feedback.summary, sample.summary);

  diApi._setReply(JSON.stringify({ ...sample, summary: 'A different, regenerated summary.' }));
  const second = await diApi.post(`/resumes/${diResumeId}/feedback`).set('Authorization', `Bearer ${diToken}`).expect(201);
  assert.equal(second.body.feedback.summary, 'A different, regenerated summary.');

  const count = diDb.prepare('SELECT COUNT(*) AS n FROM resume_feedback WHERE resume_id = ?').get(diResumeId).n;
  assert.equal(count, 1);

  const get = await diApi.get(`/resumes/${diResumeId}/feedback`).set('Authorization', `Bearer ${diToken}`).expect(200);
  assert.equal(get.body.feedback.summary, 'A different, regenerated summary.');
});

after(() => { db?.close(); diDb?.close(); });
