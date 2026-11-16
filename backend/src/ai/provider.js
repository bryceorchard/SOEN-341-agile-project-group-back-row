// AI provider for US-10 resume feedback (#139). One OpenAI-compatible provider (Groq by
// default per docs/ai/us10-resume-feedback.md) plus a deterministic mock. The mock is only
// used when asked for with AI_PROVIDER=mock (the tests set it; developers without a key can
// too). With no key and no AI_PROVIDER=mock the provider refuses, so a deployment that is
// missing its key returns 503 instead of storing the same canned feedback for every user.
// The real provider call shape mirrors scripts/eval-resume-feedback.js (#141), which
// exists only for the offline evaluation and is not reused here.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// A copy of test/fixtures/ai/sample-feedback.json (#141), kept under src/ so the app
// never reads from the test folder.
export const MOCK_REPLY = readFileSync(path.join(HERE, 'mock-feedback.json'), 'utf8');
const MOCK_MODEL = 'mock';

const TIMEOUT_MS = 20_000;

export class ProviderUnavailableError extends Error {}

function config() {
  return {
    useMock: process.env.AI_PROVIDER === 'mock',
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL ?? 'openai/gpt-oss-120b',
    baseUrl: (process.env.AI_BASE_URL ?? 'https://api.groq.com/openai/v1').replace(/\/$/, ''),
  };
}

// The model id that will be recorded with the next piece of feedback, without making a
// request. Used by the route to store what actually answered (or 'mock').
export function currentModelId() {
  const { useMock, model } = config();
  return useMock ? MOCK_MODEL : model;
}

async function callOpenAiCompatible({ apiKey, model, baseUrl }, prompt) {
  let res;
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: prompt.system }, { role: 'user', content: prompt.user }],
        response_format: { type: 'json_schema', json_schema: { name: 'resume_feedback', strict: true, schema: prompt.schema } },
        temperature: 0.2,
        // gpt-oss reasons before answering, and the reasoning counts toward the completion
        // limit. Without these, long replies were cut off and Groq returned HTTP 400
        // json_validate_failed (#141 evaluation, 2026-11-16). Input plus the limit must stay
        // under the free plan's 8,000 tokens a minute.
        reasoning_effort: 'low',
        max_completion_tokens: 5000,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    throw new ProviderUnavailableError(`AI service request failed: ${err.message}`);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ProviderUnavailableError(`AI service returned HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  // A 2xx whose body isn't the expected JSON envelope is an invalid reply, not an outage:
  // hand the raw body back so parseFeedback() rejects it and the route answers 502.
  let body;
  try {
    body = await res.text();
  } catch (err) {
    throw new ProviderUnavailableError(`AI service response could not be read: ${err.message}`);
  }
  try {
    return JSON.parse(body).choices?.[0]?.message?.content ?? '';
  } catch {
    return body;
  }
}

// Returns the provider's raw text reply to buildPrompt()'s output (prompt.js); the caller
// runs it through parseFeedback() (feedback-schema.js). Throws ProviderUnavailableError on
// a network failure, timeout or non-2xx response, or when no provider is configured — the
// route maps that to 503.
export async function getFeedbackReply(prompt) {
  const cfg = config();
  if (cfg.useMock) return MOCK_REPLY;
  if (!cfg.apiKey) {
    throw new ProviderUnavailableError('AI_API_KEY is not set (use AI_PROVIDER=mock for the fixed sample reply)');
  }
  return callOpenAiCompatible(cfg, prompt);
}
