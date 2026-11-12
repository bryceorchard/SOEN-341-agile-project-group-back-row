// Response contract for US-10 AI resume feedback (#141), final as of 2026-11-11. The
// provider is asked to reply with JSON matching FEEDBACK_SCHEMA; the backend (#139)
// validates every reply with parseFeedback() before storing it, and the UI (#140) renders
// the same fields. See docs/ai/us10-resume-feedback.md for what each field means, the API
// response that wraps it, and how to display it.

// `section` = the part of the resume a point is about. "profile" is the summary or
// objective at the top of a resume; "experience" includes volunteering; "skills" includes
// languages and certifications; "formatting" covers layout, length and consistency.
export const SECTIONS = ['contact', 'profile', 'experience', 'education', 'skills', 'projects', 'formatting', 'other'];
export const PRIORITIES = ['high', 'medium', 'low'];

const text = (maxLength, description) => ({ type: 'string', minLength: 1, maxLength, description });
const sectionField = { type: 'string', enum: SECTIONS, description: 'The part of the resume this is about.' };

// Property order matters: structured-output decoding generates fields in schema order, so
// the lists come first and `summary` last, written after the model has worked through the
// details it summarises. normalizeFeedback() puts `summary` back first for storage.
export const FEEDBACK_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['isResume', 'strengths', 'improvements', 'rewordings', 'summary'],
  properties: {
    isResume: {
      type: 'boolean',
      description: 'false if the text is not a resume or CV; then the three lists are empty.',
    },
    strengths: {
      type: 'array',
      maxItems: 5,
      description: 'Real strengths only, most notable first.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['point', 'evidence'],
        properties: {
          point: text(300, 'The strength, in one sentence.'),
          evidence: text(300, 'A short excerpt copied exactly from the resume that shows it.'),
        },
      },
    },
    improvements: {
      type: 'array',
      maxItems: 8,
      description: 'Most important first.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['section', 'priority', 'excerpt', 'issue', 'suggestion'],
        properties: {
          section: sectionField,
          priority: {
            type: 'string',
            enum: PRIORITIES,
            description: 'high: likely to get the resume passed over or misread; medium: noticeably weakens it; low: polish.',
          },
          excerpt: {
            type: 'string',
            maxLength: 300,
            description: 'The resume text this is about, copied exactly; an empty string if the issue is something missing.',
          },
          issue: text(300, 'What is wrong or missing, pointing at the specific part of the resume.'),
          suggestion: text(400, 'What to do about it, concretely.'),
        },
      },
    },
    rewordings: {
      type: 'array',
      maxItems: 5,
      description: 'Rewrites of the weakest bullets or sentences; may be empty.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['section', 'original', 'suggested', 'reason'],
        properties: {
          section: sectionField,
          original: text(400, 'One bullet or sentence copied exactly from the resume.'),
          suggested: text(400, 'The rewrite, keeping the same facts; [placeholders] for numbers the resume does not give.'),
          reason: text(300, 'Why the rewrite is better.'),
        },
      },
    },
    summary: text(800, 'Written last: 2-4 sentences on the overall state of the resume and the most important fix from the lists above, addressed to the job seeker as "you".'),
  },
};

// Keywords our validator enforces but some providers' structured-output modes reject
// (Anthropic and OpenAI strict mode don't accept all of them), so they are stripped
// from the copy sent to the provider. Everything is still checked on the way back.
const LOCAL_ONLY_KEYWORDS = ['minLength', 'maxLength', 'minItems', 'maxItems'];

export function providerSchema(schema = FEEDBACK_SCHEMA) {
  if (Array.isArray(schema)) return schema.map((s) => providerSchema(s));
  if (schema === null || typeof schema !== 'object') return schema;
  return Object.fromEntries(
    Object.entries(schema)
      .filter(([key]) => !LOCAL_ONLY_KEYWORDS.includes(key))
      .map(([key, value]) => [key, key === 'enum' || key === 'required' ? [...value] : providerSchema(value)])
  );
}

// A small JSON Schema validator for the subset FEEDBACK_SCHEMA uses (type, properties,
// required, additionalProperties: false, items, enum, min/max length and items), so the
// backend needs no extra dependency. Returns a list of "path: problem" strings.
function check(schema, value, path, errors) {
  const at = path || '(root)';
  const actual = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
  if (schema.type && actual !== schema.type) {
    errors.push(`${at}: expected ${schema.type}, got ${actual}`);
    return;
  }
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${at}: must be one of ${schema.enum.join(', ')}`);
  }
  if (actual === 'string') {
    if (schema.minLength !== undefined && value.trim().length < schema.minLength) errors.push(`${at}: must not be empty`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength) errors.push(`${at}: longer than ${schema.maxLength} characters`);
  }
  if (actual === 'array') {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${at}: needs at least ${schema.minItems} items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${at}: more than ${schema.maxItems} items`);
    if (schema.items) value.forEach((item, i) => check(schema.items, item, `${path}[${i}]`, errors));
  }
  if (actual === 'object') {
    for (const key of schema.required ?? []) {
      if (!(key in value)) errors.push(`${path ? `${path}.` : ''}${key}: missing`);
    }
    for (const [key, item] of Object.entries(value)) {
      const child = schema.properties?.[key];
      if (child) check(child, item, path ? `${path}.${key}` : key, errors);
      else if (schema.additionalProperties === false) errors.push(`${path ? `${path}.` : ''}${key}: unexpected field`);
    }
  }
}

export function validateFeedback(value) {
  const errors = [];
  check(FEEDBACK_SCHEMA, value, '', errors);
  if (errors.length === 0 && value.isResume) {
    // A real resume always has something to say on both sides.
    if (value.strengths.length === 0) errors.push('strengths: needs at least 1 item when isResume is true');
    if (value.improvements.length === 0) errors.push('improvements: needs at least 1 item when isResume is true');
  }
  return { valid: errors.length === 0, errors };
}

const PRIORITY_ORDER = Object.fromEntries(PRIORITIES.map((p, i) => [p, i]));

// Trims every string, orders improvements high -> medium -> low (stable, so the model's
// order is kept within a priority), and puts the fields in display order with `summary`
// first. Only call on a value that passed validation.
export function normalizeFeedback(value) {
  const trimAll = (v) =>
    typeof v === 'string' ? v.trim()
      : Array.isArray(v) ? v.map(trimAll)
        : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, trimAll(x)]))
          : v;
  const out = trimAll(value);
  const improvements = out.improvements
    .map((item, i) => ({ item, i }))
    .sort((a, b) => PRIORITY_ORDER[a.item.priority] - PRIORITY_ORDER[b.item.priority] || a.i - b.i)
    .map(({ item }) => item);
  return {
    isResume: out.isResume,
    summary: out.summary,
    strengths: out.strengths,
    improvements,
    rewordings: out.rewordings,
  };
}

// Parses the provider's raw text reply. Tolerates a ```json fence (some providers add one
// in plain JSON mode). Returns { ok: true, feedback } or { ok: false, errors }.
export function parseFeedback(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') return { ok: false, errors: ['empty reply'] };
  const unfenced = raw.trim().replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/i, '$1');
  let value;
  try {
    value = JSON.parse(unfenced);
  } catch (err) {
    return { ok: false, errors: [`not valid JSON: ${err.message}`] };
  }
  const { valid, errors } = validateFeedback(value);
  return valid ? { ok: true, feedback: normalizeFeedback(value) } : { ok: false, errors };
}
