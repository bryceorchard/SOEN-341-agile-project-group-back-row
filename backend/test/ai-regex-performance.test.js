// Regression tests for the static analysis D7 fixes (SonarQube javascript:S8786): text
// handling in src/ai must stay linear on long adversarial input, and keep the old results.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasEmail, replaceEmails } from '../src/ai/email.js';
import { prepareResumeText } from '../src/ai/prompt.js';
import { parseFeedback } from '../src/ai/feedback-schema.js';
import { quoteMatch, runChecks } from '../src/ai/checks.js';
import { readFileSync } from 'node:fs';

const N = 30000; // each old regex took 65–500+ ms on inputs this size; the fence one never finished
const fast = (label, fn) => {
  const start = performance.now();
  fn();
  const ms = performance.now() - start;
  assert.ok(ms < 100, `${label} took ${ms.toFixed(0)} ms`);
};

test('email scan finds the same addresses as the old regex, including glued ones', () => {
  assert.equal(hasEmail('reach me at first.last+cv@mail.example.ca today'), true);
  assert.equal(hasEmail('no address here, just a@b'), false);
  assert.equal(replaceEmails('a@b.co,c@d.org', '[E]'), '[E],[E]');
  // The old regex matched "x@y.z" and then "+w@v.u" right after it.
  assert.equal(replaceEmails('x@y.z+w@v.u', '[E]'), '[E][E]');
});

test('prepareResumeText still removes tags, emails and trailing spaces', () => {
  const { text } = prepareResumeText('Jo <resume >\nme@site.ca   \nok  \n</ resume x>end');
  assert.equal(text, 'Jo [removed tag]\n[email removed for privacy]\nok\n[removed tag]end');
});

test('parseFeedback still strips a ```json fence', () => {
  const sample = readFileSync(new URL('./fixtures/ai/sample-feedback.json', import.meta.url), 'utf8');
  const fenced = parseFeedback('```json\n' + sample + '\n```');
  assert.equal(fenced.ok, true);
  assert.deepEqual(fenced, parseFeedback(sample));
});

test('AI text handling stays linear on long adversarial input', () => {
  fast('hasEmail on a long word', () => hasEmail('a'.repeat(N)));
  fast('prepareResumeText on a long word', () => prepareResumeText('a'.repeat(N)));
  fast('prepareResumeText on unclosed <resume tags', () => prepareResumeText('<resume'.repeat(N / 7)));
  fast('prepareResumeText on a long run of spaces', () => prepareResumeText(' '.repeat(N) + 'x'));
  fast('parseFeedback on an unclosed fence', () => parseFeedback('```' + ' '.repeat(N) + 'x'));
  fast('quoteMatch on a quote full of inner punctuation', () => quoteMatch('a' + ' '.repeat(N) + 'a', 'resume text'));
  const fb = JSON.parse(readFileSync(new URL('./fixtures/ai/sample-feedback.json', import.meta.url), 'utf8'));
  fast('runChecks on unclosed brackets', () => runChecks({ ...fb, summary: '['.repeat(N) }, 'resume text'));
});
