import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const { extractResumeText } = await import('../src/ai/extract-text.js');

const FIXTURES = fileURLToPath(new URL('./fixtures/resumes-real/', import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), 'cc-extract-test-'));

function writeTmp(name, buffer) {
  const p = join(tmp, name);
  writeFileSync(p, buffer);
  return p;
}

test('extracts real text from a PDF', async () => {
  const text = await extractResumeText(join(FIXTURES, 'sample.pdf'), 'application/pdf');
  assert.match(text, /Hello Resume Extraction Test/);
});

test('extracts real text from a DOCX', async () => {
  const text = await extractResumeText(join(FIXTURES, 'sample.docx'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  assert.match(text, /ALEX TREMBLAY/);
});

test('extracts real text from a legacy DOC', async () => {
  const text = await extractResumeText(join(FIXTURES, 'sample.doc'), 'application/msword');
  assert.match(text, /ALEX TREMBLAY/);
});

test('an unsupported mime type throws', async () => {
  const path = writeTmp('x.txt', Buffer.from('hello'));
  await assert.rejects(() => extractResumeText(path, 'text/plain'));
});

test('a corrupt PDF returns empty text instead of throwing', async () => {
  const path = writeTmp('bad.pdf', Buffer.from('%PDF-1.4 not actually a pdf'));
  const text = await extractResumeText(path, 'application/pdf');
  assert.equal(text, '');
});

test('a corrupt DOCX returns empty text instead of throwing', async () => {
  const path = writeTmp('bad.docx', Buffer.from('not a zip file'));
  const text = await extractResumeText(path, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  assert.equal(text, '');
});

test('a corrupt DOC returns empty text instead of throwing', async () => {
  const path = writeTmp('bad.doc', Buffer.from('not a real doc'));
  const text = await extractResumeText(path, 'application/msword');
  assert.equal(text, '');
});

test.after(() => rmSync(tmp, { recursive: true, force: true }));
