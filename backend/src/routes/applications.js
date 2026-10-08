import { Router } from 'express';
import { HttpError } from '../errors.js';
import { requireAuth, requireRole } from '../middleware.js';

const STATUSES = ['Applied', 'Under Review', 'Interview', 'Offered', 'Rejected'];

const toApi = (a) => ({
  id: a.id,
  jobId: a.job_id,
  jobTitle: a.job_title,
  resumeId: a.resume_id,
  status: a.status,
  appliedAt: a.applied_at,
  updatedAt: a.updated_at,
});

export default function applicationRoutes(db) {
  const r = Router();
  r.use(requireAuth);

  r.post('/', (req, res) => {
    const { jobId, resumeId = null } = req.body ?? {};
    if (!Number.isInteger(jobId)) throw new HttpError(400, 'jobId is required');

    if (!db.prepare('SELECT 1 FROM jobs WHERE id = ?').get(jobId)) throw new HttpError(404, 'Job not found');

    if (resumeId !== null) {
      const resume = db.prepare('SELECT 1 FROM resumes WHERE id = ? AND user_id = ?').get(resumeId, req.user.id);
      if (!resume) throw new HttpError(400, 'resumeId does not belong to you');
    }

    if (db.prepare('SELECT 1 FROM applications WHERE user_id = ? AND job_id = ?').get(req.user.id, jobId)) {
      throw new HttpError(409, 'You already applied to this job');
    }

    const { lastInsertRowid } = db
      .prepare('INSERT INTO applications (user_id, job_id, resume_id) VALUES (?, ?, ?)')
      .run(req.user.id, jobId, resumeId);

    const row = db
      .prepare('SELECT a.*, j.title AS job_title FROM applications a JOIN jobs j ON j.id = a.job_id WHERE a.id = ?')
      .get(lastInsertRowid);
    res.status(201).json({ application: toApi(row) });
  });

  // The current user's own applications, most recent first.
  r.get('/', (req, res) => {
    const rows = db
      .prepare(
        `SELECT a.*, j.title AS job_title FROM applications a
         JOIN jobs j ON j.id = a.job_id
         WHERE a.user_id = ?
         ORDER BY a.applied_at DESC`
      )
      .all(req.user.id);
    res.json({ applications: rows.map(toApi) });
  });

  // Recruiters update the status of applications to jobs they posted.
  r.patch('/:id', requireRole('recruiter'), (req, res) => {
    const { status } = req.body ?? {};
    if (!STATUSES.includes(status)) throw new HttpError(400, `status must be one of: ${STATUSES.join(', ')}`);

    const row = db
      .prepare(
        `SELECT a.* FROM applications a JOIN jobs j ON j.id = a.job_id
         WHERE a.id = ? AND j.recruiter_id = ?`
      )
      .get(req.params.id, req.user.id);
    if (!row) throw new HttpError(404, 'Application not found');

    db.prepare("UPDATE applications SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, row.id);
    const updated = db
      .prepare('SELECT a.*, j.title AS job_title FROM applications a JOIN jobs j ON j.id = a.job_id WHERE a.id = ?')
      .get(row.id);
    res.json({ application: toApi(updated) });
  });

  return r;
}
