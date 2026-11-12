#!/usr/bin/env node
// Runs the US-10 evaluation set (test/fixtures/resumes/) through an AI provider with
// the real prompt and schema, validates each reply, runs the automatic checks, and
// writes the raw outputs plus REVIEW.md, a sheet for the hand review in #141.
// Never run in CI: it calls a paid or rate-limited external API.
//
//   npm run ai:eval -- --provider mock                 # no key; shows the sheet format
//   AI_API_KEY=... npm run ai:eval -- --provider groq
//   AI_API_KEY=... npm run ai:eval -- --provider anthropic --repeat 2
//   npm run ai:eval -- --provider groq --dry-run       # print the prompt, call nothing
//
// Options: --provider mock|groq|anthropic|openai|gemini|openai-compatible
//          --model <id> (or AI_MODEL)   --base-url <url> (or AI_BASE_URL; required for openai-compatible)
//          --only <text> (fixtures whose file name contains it)   --repeat <n> (default 1)
//          --temperature <n|none>   --json-mode schema|object   --out <dir>
//
// The provider calls here are deliberately minimal and exist only for evaluation; the
// app's provider module and mock belong to #139.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildPrompt, PROMPT_VERSION } from '../src/ai/prompt.js';
import { parseFeedback } from '../src/ai/feedback-schema.js';
import { runChecks, checkExpectations, comparePair } from '../src/ai/checks.js';

const BACKEND = fileURLToPath(new URL('..', import.meta.url));
const FIXTURES = path.join(BACKEND, 'test/fixtures/resumes');

const PROVIDERS = {
  mock: { model: 'sample-feedback' },
  groq: { model: 'openai/gpt-oss-120b', baseUrl: 'https://api.groq.com/openai/v1', temperature: 0.2 },
  anthropic: { model: 'claude-haiku-5-5', baseUrl: 'https://api.anthropic.com/v1' },
  openai: { model: 'gpt-5-mini', baseUrl: 'https://api.openai.com/v1' },
  gemini: { model: 'gemini-3.1-flash-lite', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai' },
  'openai-compatible': {},
};

function parseArgs(argv) {
  const args = { provider: 'mock', repeat: 1, jsonMode: 'schema' };
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i].replace(/^--/, '');
    if (key === 'dry-run') args.dryRun = true;
    else if (['provider', 'model', 'base-url', 'only', 'repeat', 'temperature', 'json-mode', 'out'].includes(key)) {
      args[key.replace(/-(\w)/g, (_, c) => c.toUpperCase())] = argv[++i];
    } else throw new Error(`Unknown option: ${argv[i]}`);
  }
  if (!PROVIDERS[args.provider]) throw new Error(`--provider must be one of: ${Object.keys(PROVIDERS).join(', ')}`);
  args.repeat = Math.max(1, Number(args.repeat) || 1);
  return args;
}

async function postJson(url, headers, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90_000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

// OpenAI Chat Completions shape: OpenAI, Groq, Gemini's OpenAI-compatible endpoint, Ollama, etc.
async function callOpenAiCompatible(cfg, prompt) {
  const body = {
    model: cfg.model,
    messages: [{ role: 'system', content: prompt.system }, { role: 'user', content: prompt.user }],
    response_format: cfg.jsonMode === 'object'
      ? { type: 'json_object' }
      : { type: 'json_schema', json_schema: { name: 'resume_feedback', strict: true, schema: prompt.schema } },
  };
  if (cfg.temperature !== undefined) body.temperature = cfg.temperature;
  const data = await postJson(`${cfg.baseUrl.replace(/\/$/, '')}/chat/completions`, { authorization: `Bearer ${cfg.apiKey}` }, body);
  const choice = data.choices?.[0];
  return {
    text: choice?.message?.content ?? '',
    stop: choice?.finish_reason,
    usage: { input: data.usage?.prompt_tokens, output: data.usage?.completion_tokens },
  };
}

// Anthropic Messages API with structured outputs (output_config.format).
async function callAnthropic(cfg, prompt) {
  const body = {
    model: cfg.model,
    max_tokens: 4000,
    system: prompt.system,
    messages: [{ role: 'user', content: prompt.user }],
    output_config: { format: { type: 'json_schema', schema: prompt.schema } },
  };
  if (cfg.temperature !== undefined) body.temperature = cfg.temperature;
  const data = await postJson(`${cfg.baseUrl.replace(/\/$/, '')}/messages`, { 'x-api-key': cfg.apiKey, 'anthropic-version': '2023-06-01' }, body);
  return {
    text: (data.content ?? []).filter((b) => b.type === 'text').map((b) => b.text).join(''),
    stop: data.stop_reason,
    usage: { input: data.usage?.input_tokens, output: data.usage?.output_tokens },
  };
}

async function callMock() {
  return { text: readFileSync(path.join(BACKEND, 'test/fixtures/ai/sample-feedback.json'), 'utf8'), stop: 'mock', usage: {} };
}

const call = (cfg, prompt) =>
  cfg.provider === 'mock' ? callMock() : cfg.provider === 'anthropic' ? callAnthropic(cfg, prompt) : callOpenAiCompatible(cfg, prompt);

// --- REVIEW.md ------------------------------------------------------------------------

const quote = (s) => String(s).replace(/\s*\n\s*/g, ' ');

function renderFeedback(fb) {
  const out = [`**Summary.** ${quote(fb.summary)}`, '', `**Is a resume:** ${fb.isResume}`, '', '**Strengths**'];
  for (const s of fb.strengths) out.push(`- ${quote(s.point)}  \n  _Evidence:_ "${quote(s.evidence)}"`);
  if (!fb.strengths.length) out.push('- (none)');
  out.push('', '**Improvements** (in the order the UI will show them)');
  for (const i of fb.improvements) {
    const about = i.excerpt ? `  \n  _About:_ "${quote(i.excerpt)}"` : '  \n  _About:_ (something missing)';
    out.push(`- **${i.priority}** · ${i.section}: ${quote(i.issue)}${about}  \n  _Suggestion:_ ${quote(i.suggestion)}`);
  }
  if (!fb.improvements.length) out.push('- (none)');
  out.push('', '**Suggested rewordings**');
  for (const r of fb.rewordings) {
    out.push(`- ${r.section}  \n  _Original:_ "${quote(r.original)}"  \n  _Suggested:_ "${quote(r.suggested)}"  \n  _Why:_ ${quote(r.reason)}`);
  }
  if (!fb.rewordings.length) out.push('- (none)');
  return out.join('\n');
}

const CHECKLIST = [
  'Accurate: every point matches what the resume actually says',
  'Specific: points name the actual bullet or section, not generic advice',
  'Actionable: the job seeker knows what to change',
  'Invents no experience: no new employers, skills, dates or numbers ([placeholders] are fine)',
  'No bias: nothing based on name, gender, age or background',
  'Fixture-specific "look for" items are met',
];

function renderReview(meta, results, pairs) {
  const lines = [
    `# US-10 evaluation run: ${meta.provider} / ${meta.model}`,
    '',
    meta.provider === 'mock'
      ? '> **Mock run.** Every fixture got the same hand-written sample reply (`test/fixtures/ai/sample-feedback.json`), so the flags below only show that the checks work. These are not model outputs.\n'
      : '',
    '| | |', '|---|---|',
    `| Date | ${meta.date} |`,
    `| Prompt version | \`${PROMPT_VERSION}\` |`,
    `| Provider / model | ${meta.provider} / \`${meta.model}\` |`,
    `| Temperature | ${meta.temperature ?? 'provider default'} |`,
    `| Output mode | ${meta.jsonMode === 'object' ? 'JSON mode, schema in the prompt' : 'structured output (JSON Schema enforced by the API)'} |`,
    `| Runs per fixture | ${meta.repeat} |`,
    `| Reviewer | |`,
    '',
    '## Results at a glance',
    '',
    '| Fixture | Kind | Schema valid | Latency | Tokens in/out | Strengths | Improvements H/M/L | Rewordings | Auto flags (fail/warn) |',
    '|---|---|---|---|---|---|---|---|---|',
  ];
  for (const r of results) {
    const fb = r.feedback;
    const n = (p) => fb ? fb.improvements.filter((i) => i.priority === p).length : '-';
    const fails = r.flags.filter((f) => f.severity === 'fail').length;
    const warns = r.flags.filter((f) => f.severity === 'warn').length;
    lines.push(`| ${r.label} | ${r.fixture.kind} | ${r.ok ? 'yes' : '**no**'} | ${r.latencyMs ?? '-'} ms | ${r.usage?.input ?? '-'}/${r.usage?.output ?? '-'} | ${fb ? fb.strengths.length : '-'} | ${n('high')}/${n('medium')}/${n('low')} | ${fb ? fb.rewordings.length : '-'} | ${fails}/${warns} |`);
  }
  lines.push('', 'Automatic checks: quotes must appear in the resume, rewordings must not add numbers, no contact details in the output, demographic words listed for a second look, plus the per-fixture rules in `manifest.json`. They catch mechanical failures only; the checklist below is the actual review.', '');

  lines.push('## Hand review', '');
  for (const r of results) {
    lines.push(`### ${r.label} (${r.fixture.kind})`, '', `**What it tests:** ${r.fixture.tests}`, '');
    if (r.fixture.targetRole) lines.push(`**Target role sent:** ${r.fixture.targetRole}`, '');
    lines.push('**Look for:**', ...r.fixture.lookFor.map((l) => `- ${l}`), '');
    if (r.error) lines.push(`**Call failed:** ${r.error}`, '');
    if (!r.ok && !r.error) lines.push(`**Reply failed validation:**`, ...r.errors.map((e) => `- ${e}`), '', '```', r.raw?.slice(0, 2000) ?? '', '```', '');
    lines.push('**Automatic flags:**', ...(r.flags.length ? r.flags.map((f) => `- ${f.severity.toUpperCase()} (${f.check}): ${f.detail}`) : ['- none']), '');
    if (r.feedback) lines.push('<details><summary>Feedback</summary>', '', renderFeedback(r.feedback), '', '</details>', '');
    lines.push('**Checklist:**', ...CHECKLIST.map((c) => `- [ ] ${c}`), '', '**Notes / problems found:**', '', '', '---', '');
  }

  if (pairs.length) {
    lines.push('## Bias pairs', '', 'Fixtures that differ only in name/gender cues. "Same fixture" rows show normal run-to-run variation; compare the "pair" rows against them.', '',
      '| Comparison | Strengths | High | Medium | Low | Rewordings | Sections only in A / B | Summary word overlap |', '|---|---|---|---|---|---|---|---|');
    for (const p of pairs) {
      const c = p.comparison;
      const fmt = ([a, b]) => (a === b ? `${a} = ${b}` : `**${a} vs ${b}**`);
      lines.push(`| ${p.kind}: ${p.a} vs ${p.b} | ${fmt(c.strengths)} | ${fmt(c.high)} | ${fmt(c.medium)} | ${fmt(c.low)} | ${fmt(c.rewordings)} | ${c.sectionsOnlyInA.join(', ') || '-'} / ${c.sectionsOnlyInB.join(', ') || '-'} | ${c.summaryWordOverlap} |`);
    }
    lines.push('', '**Verdict on bias:**', '');
  }

  lines.push(
    '## Prompt changes after this run', '',
    '| Change | Why (fixture / finding) | New prompt version |', '|---|---|---|', '| | | |', '',
    '## Open findings for Sprint 4', '', '- ', ''
  );
  return lines.join('\n');
}

// --- Main -------------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const defaults = PROVIDERS[args.provider];
  const temperature = args.temperature === 'none' ? undefined
    : args.temperature !== undefined ? Number(args.temperature) : defaults.temperature;
  const cfg = {
    provider: args.provider,
    model: args.model ?? process.env.AI_MODEL ?? defaults.model,
    baseUrl: args.baseUrl ?? process.env.AI_BASE_URL ?? defaults.baseUrl,
    apiKey: process.env.AI_API_KEY,
    temperature,
    jsonMode: args.jsonMode,
  };
  if (!cfg.model) throw new Error('Set --model or AI_MODEL');
  if (cfg.provider !== 'mock' && !args.dryRun && !cfg.apiKey) throw new Error('Set AI_API_KEY (never commit it)');
  if (cfg.provider !== 'mock' && !cfg.baseUrl) throw new Error('Set --base-url or AI_BASE_URL');

  const manifest = JSON.parse(readFileSync(path.join(FIXTURES, 'manifest.json'), 'utf8'));
  const fixtures = manifest.fixtures.filter((f) => !args.only || f.file.includes(args.only));
  if (!fixtures.length) throw new Error(`No fixture matches --only ${args.only}`);

  if (args.dryRun) {
    const p = buildPrompt(readFileSync(path.join(FIXTURES, fixtures[0].file), 'utf8'), { targetRole: fixtures[0].targetRole, schemaInPrompt: cfg.jsonMode === 'object' });
    const approxTokens = Math.round((p.system.length + p.user.length + JSON.stringify(p.schema).length) / 4);
    console.log(`--- system (${p.system.length} chars) ---\n${p.system}\n\n--- user: ${fixtures[0].file} ---\n${p.user}\n`);
    console.log(`About ${approxTokens} input tokens for this fixture, schema included. Nothing was sent.`);
    return;
  }

  const date = new Date().toISOString();
  const slug = cfg.model.replace(/[^\w.-]+/g, '_');
  const outDir = path.resolve(args.out ?? path.join(BACKEND, 'eval-output', `${date.slice(0, 16).replace(/[:T]/g, '-')}-${cfg.provider}-${slug}`));
  mkdirSync(outDir, { recursive: true });

  const results = [];
  for (const fixture of fixtures) {
    const resumeRaw = readFileSync(path.join(FIXTURES, fixture.file), 'utf8');
    const prompt = buildPrompt(resumeRaw, { targetRole: fixture.targetRole, schemaInPrompt: cfg.jsonMode === 'object' });
    for (let run = 1; run <= args.repeat; run++) {
      const label = `${fixture.file.replace(/\.txt$/, '')}${args.repeat > 1 ? ` #${run}` : ''}`;
      const r = { label, fixture, run, flags: [], errors: [] };
      const started = Date.now();
      try {
        const reply = await call(cfg, prompt);
        r.latencyMs = Date.now() - started;
        r.raw = reply.text;
        r.stop = reply.stop;
        r.usage = reply.usage;
        const parsed = parseFeedback(reply.text);
        r.ok = parsed.ok;
        if (parsed.ok) {
          r.feedback = parsed.feedback;
          r.flags = [...runChecks(parsed.feedback, prompt.resume.text), ...checkExpectations(parsed.feedback, fixture.expect)];
        } else r.errors = parsed.errors;
      } catch (err) {
        r.ok = false;
        r.error = err.message;
      }
      results.push(r);
      const status = r.error ? `ERROR ${r.error.slice(0, 120)}` : r.ok ? `ok, ${r.flags.length} flag(s)` : `INVALID ${r.errors[0]}`;
      console.log(`${label.padEnd(44)} ${status}`);
      writeFileSync(
        path.join(outDir, `${label.replace(/ #/, '.run')}.json`),
        JSON.stringify({
          fixture: fixture.file, run, provider: cfg.provider, model: cfg.model, promptVersion: PROMPT_VERSION, temperature,
          latencyMs: r.latencyMs, usage: r.usage, stopReason: r.stop, error: r.error, valid: r.ok, errors: r.errors,
          flags: r.flags, feedback: r.feedback, raw: r.raw,
        }, null, 2) + '\n'
      );
    }
  }

  // Bias pairs: each pair across runs, plus same-fixture comparisons as a baseline.
  const pairs = [];
  const valid = (file) => results.filter((r) => r.fixture.file === file && r.feedback);
  const seen = new Set();
  for (const f of fixtures.filter((x) => x.pairWith)) {
    const key = [f.file, f.pairWith].sort().join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    const [a, b] = [valid(f.file), valid(f.pairWith)];
    for (const side of [a, b]) {
      for (let i = 1; i < side.length; i++) pairs.push({ kind: 'same fixture', a: side[0].label, b: side[i].label, comparison: comparePair(side[0].feedback, side[i].feedback) });
    }
    for (let i = 0; i < Math.min(a.length, b.length); i++) pairs.push({ kind: 'pair', a: a[i].label, b: b[i].label, comparison: comparePair(a[i].feedback, b[i].feedback) });
  }

  const meta = { provider: cfg.provider, model: cfg.model, date, temperature, jsonMode: cfg.jsonMode, repeat: args.repeat };
  writeFileSync(path.join(outDir, 'REVIEW.md'), renderReview(meta, results, pairs));
  const valids = results.filter((r) => r.ok).length;
  console.log(`\n${valids}/${results.length} replies schema-valid. Review sheet: ${path.join(outDir, 'REVIEW.md')}`);
  console.log('After reviewing, copy REVIEW.md to AI-log/Bryce/md/ (see docs/ai/us10-resume-feedback.md).');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
