import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Unit tests for src/ai/provider.js (#139). The real OpenAI-compatible call is exercised
// against a stubbed globalThis.fetch, so the error mapping (non-2xx, timeout, network
// failure, a reply that isn't JSON) is tested without any network access.
const { getFeedbackReply, currentModelId, ProviderUnavailableError, MOCK_REPLY } = await import('../src/ai/provider.js');
const { parseFeedback } = await import('../src/ai/feedback-schema.js');

const prompt = { system: 'sys', user: 'usr', schema: { type: 'object' } };
const realFetch = globalThis.fetch;
const savedEnv = { ...process.env };
let calls;

function stubFetch(impl) {
  calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return impl(url, init);
  };
}

beforeEach(() => {
  delete process.env.AI_PROVIDER;
  delete process.env.AI_MODEL;
  delete process.env.AI_BASE_URL;
  process.env.AI_API_KEY = 'test-key';
  stubFetch(() => { throw new Error('fetch should not have been called'); });
});

afterEach(() => {
  globalThis.fetch = realFetch;
  process.env = { ...savedEnv };
});

test('AI_PROVIDER=mock returns the fixed reply without calling out, even with a key set', async () => {
  process.env.AI_PROVIDER = 'mock';
  assert.equal(await getFeedbackReply(prompt), MOCK_REPLY);
  assert.equal(calls.length, 0);
  assert.equal(currentModelId(), 'mock');
});

test('the mock reply is valid feedback and matches the #141 sample fixture', () => {
  assert.equal(parseFeedback(MOCK_REPLY).ok, true);
  const fixture = readFileSync(new URL('./fixtures/ai/sample-feedback.json', import.meta.url), 'utf8');
  assert.deepEqual(JSON.parse(MOCK_REPLY), JSON.parse(fixture));
});

test('no key and no AI_PROVIDER=mock is ProviderUnavailableError, never the mock', async () => {
  delete process.env.AI_API_KEY;
  await assert.rejects(() => getFeedbackReply(prompt), ProviderUnavailableError);
  assert.equal(calls.length, 0);
});

test('a successful call sends the prompt, model and key, and returns the message content', async () => {
  process.env.AI_MODEL = 'some/model';
  process.env.AI_BASE_URL = 'https://ai.example.test/v1/';
  stubFetch(() => new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":1}' } }] }), { status: 200 }));

  assert.equal(await getFeedbackReply(prompt), '{"ok":1}');
  assert.equal(currentModelId(), 'some/model');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://ai.example.test/v1/chat/completions');
  assert.equal(calls[0].init.headers.authorization, 'Bearer test-key');
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.model, 'some/model');
  assert.deepEqual(body.messages, [{ role: 'system', content: 'sys' }, { role: 'user', content: 'usr' }]);
  assert.deepEqual(body.response_format.json_schema.schema, prompt.schema);
});

test('a non-2xx response is ProviderUnavailableError', async () => {
  stubFetch(() => new Response('rate limited', { status: 429 }));
  await assert.rejects(() => getFeedbackReply(prompt), (err) => err instanceof ProviderUnavailableError && /HTTP 429/.test(err.message));
});

test('a timeout is ProviderUnavailableError', async () => {
  stubFetch(() => { throw new DOMException('The operation was aborted due to timeout', 'TimeoutError'); });
  await assert.rejects(() => getFeedbackReply(prompt), ProviderUnavailableError);
});

test('a network failure is ProviderUnavailableError', async () => {
  stubFetch(() => { throw new TypeError('fetch failed'); });
  await assert.rejects(() => getFeedbackReply(prompt), ProviderUnavailableError);
});

test('a 2xx whose body is not JSON comes back as text that parseFeedback rejects (route: 502, not 500)', async () => {
  stubFetch(() => new Response('<html>gateway hiccup</html>', { status: 200 }));
  const reply = await getFeedbackReply(prompt);
  assert.equal(parseFeedback(reply).ok, false);
});

test('a 2xx with no choices comes back empty, which parseFeedback rejects', async () => {
  stubFetch(() => new Response(JSON.stringify({ choices: [] }), { status: 200 }));
  const reply = await getFeedbackReply(prompt);
  assert.equal(reply, '');
  assert.equal(parseFeedback(reply).ok, false);
});
