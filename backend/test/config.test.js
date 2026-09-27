import { test } from 'node:test';
import assert from 'node:assert/strict';

// Regression guard: UPLOAD_DIR must be a real filesystem path, not a
// percent-encoded URL pathname. `new URL(...).pathname` leaves "%20" etc.
// in place, so a project path containing a space resolved to the wrong dir.
test('UPLOAD_DIR default is decoded, not a percent-encoded URL path', async () => {
  delete process.env.UPLOAD_DIR;
  const { UPLOAD_DIR } = await import('../src/config.js');
  assert.ok(!UPLOAD_DIR.includes('%'), `UPLOAD_DIR should be decoded, got: ${UPLOAD_DIR}`);
});
