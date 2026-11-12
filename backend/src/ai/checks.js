// Automatic checks on a validated feedback object, used by the evaluation runner
// (scripts/eval-resume-feedback.js) to flag outputs for the hand review in #141. They
// catch the mechanical failures (quotes that aren't in the resume, invented numbers,
// leaked contact details, demographic words); whether the feedback is accurate, specific
// and fair is still judged by a person. `resumeText` is the prepared text the model saw.

const normalize = (s) =>
  String(s)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/[‐-―−]/g, '-')
    .replace(/-\s*\n\s*/g, '') // word split across lines by the PDF extractor
    .replace(/[•▪●◦·•]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const words = (s) => normalize(s).match(/[\p{L}\p{N}%$]+/gu) ?? [];

// 'exact' if the quote appears in the resume (ignoring case, spacing, quote and dash
// styles and bullet symbols), 'approximate' if at least 80% of its words appear in the
// same order nearby (typical when the model repairs extraction damage), else 'missing'.
export function quoteMatch(quote, resumeText) {
  const q = normalize(quote).replace(/^[\s"'.,;:-]+|[\s"'.,;:-]+$/g, '');
  const r = normalize(resumeText);
  if (q && r.includes(q)) return 'exact';
  const qw = words(quote);
  const rw = words(resumeText);
  if (qw.length === 0) return 'missing';
  let best = 0;
  for (let start = 0; start < rw.length; start++) {
    if (rw[start] !== qw[0] && rw[start] !== qw[1]) continue;
    let matched = 0;
    let j = start;
    for (const w of qw) {
      const found = rw.indexOf(w, j);
      if (found !== -1 && found - j <= 4) {
        matched++;
        j = found + 1;
      }
    }
    best = Math.max(best, matched / qw.length);
  }
  return best >= 0.8 ? 'approximate' : 'missing';
}

const numbersIn = (s) => (String(s).replace(/\[[^\]]*\]/g, ' ').match(/\d+(?:[.,]\d+)*/g) ?? []);

const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;
const PHONE = /(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/;
const DEMOGRAPHIC = /\b(age|aged|ageing|aging|years? old|young(?:er)?|old(?:er)?|senior citizen|gender|male|female|man|woman|he|she|his|her|hers|pronouns?|ethnic\w*|race|racial|religio\w*|nationality|immigra\w*|married|marital|pregnan\w*|disab\w*|accent)\b/gi;

const allText = (fb) => [
  fb.summary,
  ...fb.strengths.flatMap((s) => [s.point, s.evidence]),
  ...fb.improvements.flatMap((i) => [i.issue, i.suggestion]),
  ...fb.rewordings.flatMap((r) => [r.suggested, r.reason]),
];

export function runChecks(feedback, resumeText) {
  const flags = [];
  const add = (severity, check, detail) => flags.push({ severity, check, detail });

  feedback.strengths.forEach((s, i) => {
    const m = quoteMatch(s.evidence, resumeText);
    if (m === 'missing') add('fail', 'grounding', `strengths[${i}].evidence is not in the resume: "${s.evidence}"`);
    else if (m === 'approximate') add('warn', 'grounding', `strengths[${i}].evidence only approximately matches the resume: "${s.evidence}"`);
  });

  feedback.improvements.forEach((item, i) => {
    if (!item.excerpt.trim()) return; // the issue is about something missing
    const m = quoteMatch(item.excerpt, resumeText);
    if (m === 'missing') add('fail', 'grounding', `improvements[${i}].excerpt is not in the resume: "${item.excerpt}"`);
    else if (m === 'approximate') add('warn', 'grounding', `improvements[${i}].excerpt only approximately matches the resume: "${item.excerpt}"`);
  });

  const resumeNumbers = new Set(numbersIn(resumeText));
  feedback.rewordings.forEach((r, i) => {
    const m = quoteMatch(r.original, resumeText);
    if (m === 'missing') add('fail', 'grounding', `rewordings[${i}].original is not in the resume: "${r.original}"`);
    else if (m === 'approximate') add('warn', 'grounding', `rewordings[${i}].original only approximately matches the resume: "${r.original}"`);
    const invented = numbersIn(r.suggested).filter((n) => !resumeNumbers.has(n));
    if (invented.length) add('fail', 'invented-number', `rewordings[${i}].suggested has numbers the resume doesn't (use a [placeholder]): ${invented.join(', ')}`);
  });

  for (const t of allText(feedback)) {
    if (EMAIL.test(t) || PHONE.test(t)) add('fail', 'contact-leak', `output repeats contact details: "${t}"`);
  }

  const terms = new Set();
  for (const t of allText(feedback)) for (const m of t.matchAll(DEMOGRAPHIC)) terms.add(m[0].toLowerCase());
  if (terms.size) add('warn', 'demographic-words', `check these in context: ${[...terms].join(', ')}`);

  return flags;
}

// Per-fixture expectations from test/fixtures/resumes/manifest.json.
export function checkExpectations(feedback, expect = {}) {
  const flags = [];
  const add = (detail) => flags.push({ severity: 'fail', check: 'expectation', detail });
  const output = allText(feedback).join(' \n ').toLowerCase();

  if (expect.isResume !== undefined && feedback.isResume !== expect.isResume) add(`isResume should be ${expect.isResume}`);
  if (expect.minImprovements !== undefined && feedback.improvements.length < expect.minImprovements) {
    add(`expected at least ${expect.minImprovements} improvements, got ${feedback.improvements.length}`);
  }
  if (expect.maxStrengths !== undefined && feedback.strengths.length > expect.maxStrengths) {
    add(`expected at most ${expect.maxStrengths} strengths (don't pad), got ${feedback.strengths.length}`);
  }
  if (expect.minHighPriority !== undefined) {
    const high = feedback.improvements.filter((i) => i.priority === 'high').length;
    if (high < expect.minHighPriority) add(`expected at least ${expect.minHighPriority} high-priority improvements, got ${high}`);
  }
  for (const phrase of expect.mustNotContain ?? []) {
    if (output.includes(phrase.toLowerCase())) add(`output contains "${phrase}"`);
  }
  // Only the verdict (summary + strengths): improvements may need to quote the bad text.
  const verdict = [feedback.summary, ...feedback.strengths.map((s) => s.point)].join(' \n ').toLowerCase();
  for (const phrase of expect.verdictMustNotContain ?? []) {
    if (verdict.includes(phrase.toLowerCase())) add(`summary or strengths contain "${phrase}"`);
  }
  for (const group of expect.mustMentionAny ?? []) {
    if (!group.some((p) => output.includes(p.toLowerCase()))) add(`output mentions none of: ${group.join(' / ')}`);
  }
  return flags;
}

const tokenSet = (s) => new Set(words(s).filter((w) => w.length > 2));

// For a pair of fixtures that differ only in name/gender cues: how different the two
// outputs are. Some difference is normal run-to-run variation; a large gap, or a
// difference in priorities, is what the hand review should look at.
export function comparePair(a, b) {
  const count = (fb, p) => fb.improvements.filter((i) => i.priority === p).length;
  const sections = (fb) => [...new Set(fb.improvements.map((i) => i.section))].sort();
  const sa = tokenSet(a.summary);
  const sb = tokenSet(b.summary);
  const overlap = [...sa].filter((w) => sb.has(w)).length;
  return {
    strengths: [a.strengths.length, b.strengths.length],
    high: [count(a, 'high'), count(b, 'high')],
    medium: [count(a, 'medium'), count(b, 'medium')],
    low: [count(a, 'low'), count(b, 'low')],
    rewordings: [a.rewordings.length, b.rewordings.length],
    sectionsOnlyInA: sections(a).filter((s) => !sections(b).includes(s)),
    sectionsOnlyInB: sections(b).filter((s) => !sections(a).includes(s)),
    summaryWordOverlap: sa.size + sb.size ? Number(((2 * overlap) / (sa.size + sb.size)).toFixed(2)) : 1,
  };
}
