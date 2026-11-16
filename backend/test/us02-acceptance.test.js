import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readdirSync, statSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';

// Temporary upload folder, deleted after the tests
const tmp = mkdtempSync(join(tmpdir(), 'cc-us02-'));
const UPLOAD_DIR = join(tmp, 'uploads');
process.env.UPLOAD_DIR = UPLOAD_DIR;

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

// Helper: create a user, log in, return the auth header
async function signupAndLogin(email) {
  const creds = { email, password: 'Password123!' };
  await api.post('/auth/signup').send(creds).expect(201);
  const res = await api.post('/auth/login').send(creds).expect(200);
  return { Authorization: `Bearer ${res.body.token}` };
}

// Every file currently stored in the upload folder (searching subfolders too)
function storedFiles() {
  if (!existsSync(UPLOAD_DIR)) return [];
  return readdirSync(UPLOAD_DIR, { recursive: true })
    .map((name) => join(UPLOAD_DIR, String(name)))
    .filter((path) => statSync(path).isFile());
}

const pdf = (text) => Buffer.from(`%PDF-1.4 ${text}`);
const asPdf = (filename) => ({ filename, contentType: 'application/pdf' });

async function upload(auth, filename, content) {
  const res = await api.post('/resumes').set(auth).attach('resume', content, asPdf(filename)).expect(201);
  return res.body.resume.id;
}

async function listNames(auth) {
  const res = await api.get('/resumes').set(auth).expect(200);
  return res.body.resumes.map((r) => r.originalFilename);
}

test('US-02 AT-3: replacing a resume keeps the same entry with the new filename, and the old file is gone', async () => {
  const auth = await signupAndLogin('replace@test.com');
  const id = await upload(auth, 'old-cv.pdf', pdf('OLD CONTENT'));

  await api.put(`/resumes/${id}`).set(auth).attach('resume', pdf('NEW CONTENT'), asPdf('new-cv.pdf')).expect(200);

  const list = (await api.get('/resumes').set(auth).expect(200)).body.resumes;
  assert.equal(list.length, 1);
  assert.equal(list[0].id, id); // same entry
  assert.equal(list[0].originalFilename, 'new-cv.pdf');

  const file = await api.get(`/resumes/${id}/file`).set(auth).buffer(true).expect(200);
  assert.match(file.body.toString(), /NEW CONTENT/); // old content can no longer be opened
});

test('US-02 AT-4: viewing a resume returns the file with its original filename', async () => {
  const auth = await signupAndLogin('view@test.com');
  const id = await upload(auth, 'my-resume.pdf', pdf('VIEW ME'));

  const res = await api.get(`/resumes/${id}/file`).set(auth).buffer(true).expect(200);
  assert.match(res.body.toString(), /VIEW ME/);
  assert.match(res.headers['content-disposition'] ?? '', /my-resume\.pdf/);
});

test("US-02 AT-4: another job seeker opening someone else's resume file gets a 404", async () => {
  const owner = await signupAndLogin('owner@test.com');
  const other = await signupAndLogin('other@test.com');
  const id = await upload(owner, 'private.pdf', pdf('PRIVATE'));

  await api.get(`/resumes/${id}/file`).set(other).expect(404);
});

test('US-02 AT-5: an invalid file type or a file over 5 MB is rejected and the resume list stays unchanged', async () => {
  const auth = await signupAndLogin('invalid@test.com');
  const id = await upload(auth, 'keep.pdf', pdf('KEEP'));
  const tooBig = Buffer.concat([pdf(''), Buffer.alloc(5 * 1024 * 1024 + 1)]);

  // Upload: wrong type, then too big
  await api.post('/resumes').set(auth).attach('resume', Buffer.from('PNG'), { filename: 'photo.png', contentType: 'image/png' }).expect(400);
  const bigUpload = await api.post('/resumes').set(auth).attach('resume', tooBig, asPdf('huge.pdf'));
  assert.ok(bigUpload.status >= 400 && bigUpload.status < 500, `expected a 4xx error, got ${bigUpload.status}`);

  // Replace: wrong type, then too big
  await api.put(`/resumes/${id}`).set(auth).attach('resume', Buffer.from('PNG'), { filename: 'photo.png', contentType: 'image/png' }).expect(400);
  const bigReplace = await api.put(`/resumes/${id}`).set(auth).attach('resume', tooBig, asPdf('huge.pdf'));
  assert.ok(bigReplace.status >= 400 && bigReplace.status < 500, `expected a 4xx error, got ${bigReplace.status}`);

  assert.deepEqual(await listNames(auth), ['keep.pdf']);
  const file = await api.get(`/resumes/${id}/file`).set(auth).buffer(true).expect(200);
  assert.match(file.body.toString(), /KEEP/);
});

test('US-02 AT-6: deleting a resume removes it from the list and permanently deletes the stored file', async () => {
  const auth = await signupAndLogin('delete@test.com');
  const filesBefore = storedFiles().length;
  const id = await upload(auth, 'delete-me.pdf', pdf('DELETE ME'));
  assert.equal(storedFiles().length, filesBefore + 1);

  await api.delete(`/resumes/${id}`).set(auth).expect(204);

  assert.deepEqual(await listNames(auth), []);
  await api.get(`/resumes/${id}/file`).set(auth).expect(404);
  assert.equal(storedFiles().length, filesBefore); // the file is gone from disk too
});
