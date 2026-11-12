import { Router } from 'express';
import { HttpError } from '../errors.js';
import { requireAuth } from '../middleware.js';
import { extractResumeText } from '../ai/extract-text.js';
import { buildPrompt, PROMPT_VERSION } from '../ai/prompt.js';
import { parseFeedback } from '../ai/feedback-schema.js';
import { getFeedbackReply as defaultGetFeedbackReply, currentModelId, ProviderUnavailableError } from '../ai/provider.js';
import { allowRequest } from '../ai/rate-limit.js';

const toApi = (row) => {
  const feedback = JSON.parse(row.feedback);
  return {
    resumeId: row.resume_id,
    createdAt: row.created_at,
    model: row.model,
    promptVersion: row.prompt_version,
    isResume: feedback.isResume,
    summary: feedback.summary,
    strengths: feedback.strengths,
    improvements: feedback.improvements,
    rewordings: feedback.rewordings,
  };
};

// `extractText`/`getFeedbackReply` are injectable so tests can exercise every error path
// (empty text, invalid reply, provider outage) without a real file or network call; the
// real AI provider already refuses to call out when AI_API_KEY is unset (provider.js).
export default function resumeFeedbackRoutes(db, { extractText = extractResumeText, getFeedbackReply = defaultGetFeedbackReply } = {}) {
  const r = Router();
  r.use(requireAuth);

  const ownResume = (req) => {
    const row = db.prepare('SELECT * FROM resumes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!row) throw new HttpError(404, 'Resume not found');
    return row;
  };

  r.post('/:id/feedback', async (req, res) => {
    const resume = ownResume(req);

    if (!allowRequest(req.user.id)) {
      throw new HttpError(429, 'Too many feedback requests. Please wait a minute and try again.');
    }

    const rawText = await extractText(resume.file_path, resume.file_type);
    const prompt = buildPrompt(rawText);
    if (prompt.resume.isEmpty) {
      throw new HttpError(422, "This resume doesn't contain any readable text");
    }

    let reply;
    try {
      reply = await getFeedbackReply(prompt);
    } catch (err) {
      if (err instanceof ProviderUnavailableError) {
        throw new HttpError(503, 'The AI service is unavailable right now. Please try again later.');
      }
      throw err;
    }

    const parsed = parseFeedback(reply);
    if (!parsed.ok) {
      console.error('AI resume feedback failed validation:', parsed.errors);
      throw new HttpError(502, 'The AI service returned an unexpected reply');
    }
    if (!parsed.feedback.isResume) {
      throw new HttpError(422, "This file doesn't look like a resume");
    }

    db.prepare(
      `INSERT INTO resume_feedback (resume_id, feedback, model, prompt_version)
       VALUES (@resumeId, @feedback, @model, @promptVersion)
       ON CONFLICT(resume_id) DO UPDATE SET
         feedback = @feedback, model = @model, prompt_version = @promptVersion, created_at = datetime('now')`
    ).run({
      resumeId: resume.id,
      feedback: JSON.stringify(parsed.feedback),
      model: currentModelId(),
      promptVersion: PROMPT_VERSION,
    });

    const row = db.prepare('SELECT * FROM resume_feedback WHERE resume_id = ?').get(resume.id);
    res.status(201).json({ feedback: toApi(row) });
  });

  r.get('/:id/feedback', (req, res) => {
    const resume = ownResume(req);
    const row = db.prepare('SELECT * FROM resume_feedback WHERE resume_id = ?').get(resume.id);
    res.json({ feedback: row ? toApi(row) : null });
  });

  return r;
}
