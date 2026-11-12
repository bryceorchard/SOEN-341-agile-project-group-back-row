// AI provider for US-10 resume feedback (#139). One OpenAI-compatible provider (Groq by
// default per docs/ai/us10-resume-feedback.md) plus the deterministic mock used when
// AI_API_KEY is unset — always the case in tests and CI, so no network call is ever made
// there. The real provider call shape mirrors scripts/eval-resume-feedback.js (#141),
// which exists only for the offline evaluation and is not reused here.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MOCK_REPLY = readFileSync(path.join(HERE, '../../test/fixtures/ai/sample-feedback.json'), 'utf8');
const MOCK_MODEL = 'mock';

const TIMEOUT_MS = 20_000;

export class ProviderUnavailableError extends Error {}

function config() {
  return {
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL ?? 'openai/gpt-oss-120b',
    baseUrl: (process.env.AI_BASE_URL ?? 'https://api.groq.com/openai/v1').replace(/\/$/, ''),
  };
}

// The model id that will be recorded with the next piece of feedback, without making a
// request. Used by the route to store what actually answered (or 'mock').
export function currentModelId() {
  const { apiKey, model } = config();
  return apiKey ? model : MOCK_MODEL;
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
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// Returns the provider's raw text reply to buildPrompt()'s output (prompt.js); the caller
// runs it through parseFeedback() (feedback-schema.js). Throws ProviderUnavailableError on
// a network failure, timeout or non-2xx response — the route maps that to 503.
export async function getFeedbackReply(prompt) {
  const cfg = config();
  if (!cfg.apiKey) return MOCK_REPLY;
  return callOpenAiCompatible(cfg, prompt);
}
