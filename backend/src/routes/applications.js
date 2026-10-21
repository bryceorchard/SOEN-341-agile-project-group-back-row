import { Router } from 'express';
import { HttpError } from '../errors.js';
import { requireAuth, requireRole } from '../middleware.js';

const STATUSES = ['Applied', 'Under Review', 'Interview', 'Offered', 'Rejected'];

const toApi = (a) => ({
  id: a.id,
  jobId: a.job_id,
  jobTitle: a.job_title,
  jobLocation: a.job_location,
  jobCategory: a.job_category,
  jobDeadline: a.job_deadline,
  resumeId: a.resume_id,
  resumeFilename: a.resume_filename ?? null,
  status: a.status,
  appliedAt: a.applied_at,
  updatedAt: a.updated_at,
});

const SELECT_ONE = `
  SELECT a.*, j.title AS job_title, j.location AS job_location, j.category AS job_category, j.deadline AS job_deadline,
         r.original_filename AS resume_filename
  FROM applications a
  JOIN jobs j ON j.id = a.job_id
  LEFT JOIN resumes r ON r.id = a.resume_id
  WHERE a.id = ?
`;

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

    const row = db.prepare(SELECT_ONE).get(lastInsertRowid);
    res.status(201).json({ application: toApi(row) });
  });

  // The current user's own applications, most recent first. Optional ?status= filter.
  r.get('/', (req, res) => {
    const { status } = req.query;
    if (status !== undefined && !STATUSES.includes(status)) {
      throw new HttpError(400, `status must be one of: ${STATUSES.join(', ')}`);
    }

    const clauses = ['a.user_id = @userId'];
    const params = { userId: req.user.id };
    if (status !== undefined) {
      clauses.push('a.status = @status');
      params.status = status;
    }

    const rows = db
      .prepare(
        `SELECT a.*, j.title AS job_title, j.location AS job_location, j.category AS job_category, j.deadline AS job_deadline,
                r.original_filename AS resume_filename
         FROM applications a
         JOIN jobs j ON j.id = a.job_id
         LEFT JOIN resumes r ON r.id = a.resume_id
         WHERE ${clauses.join(' AND ')}
         ORDER BY a.applied_at DESC`
      )
      .all(params);
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
    const updated = db.prepare(SELECT_ONE).get(row.id);
    res.json({ application: toApi(updated) });
  });

  return r;
}
