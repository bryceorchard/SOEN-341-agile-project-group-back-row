import { Router } from 'express';
import { HttpError } from '../errors.js';
import { requireAuth, requireRole } from '../middleware.js';
import { notify } from '../notify.js';
import { STATUSES, computeStats } from '../application-stats.js';

const toApi = (a) => ({
  id: a.id,
  jobId: a.job_id,
  jobTitle: a.job_title,
  jobLocation: a.job_location,
  jobCategory: a.job_category,
  jobDeadline: a.job_deadline,
  jobStatus: a.job_status,
  resumeId: a.resume_id,
  resumeFilename: a.resume_filename ?? null,
  status: a.status,
  appliedAt: a.applied_at,
  updatedAt: a.updated_at,
});

const SELECT_ONE = `
  SELECT a.*, j.title AS job_title, j.location AS job_location, j.category AS job_category, j.deadline AS job_deadline, j.status AS job_status,
         r.original_filename AS resume_filename
  FROM applications a
  JOIN jobs j ON j.id = a.job_id
  LEFT JOIN resumes r ON r.id = a.resume_id
  WHERE a.id = ?
`;

// Writes one application_status_history row (#134). Every status an application gets goes
// through here: the first one from POST /applications, the rest from changeStatus().
export function recordStatus(db, applicationId, status, changedBy) {
  db.prepare('INSERT INTO application_status_history (application_id, status, changed_by) VALUES (?, ?, ?)').run(
    applicationId,
    status,
    changedBy
  );
}

// The one status-change helper (#134, #136): updates the application, records the change in
// its history and notifies the applicant. Re-saving the status it already has does nothing
// beyond touching updated_at, so it adds no history row and sends no notification.
export function changeStatus(db, application, status, changedBy) {
  db.prepare("UPDATE applications SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, application.id);
  const updated = db.prepare(SELECT_ONE).get(application.id);
  if (application.status === status) return updated;

  recordStatus(db, application.id, status, changedBy);
  notify(db, {
    userId: updated.user_id,
    type: status === 'Interview' ? 'interview_invite' : 'status_update',
    title: status === 'Interview' ? `Interview invite: ${updated.job_title}` : `Application update: ${updated.job_title}`,
    message:
      status === 'Interview'
        ? `You've been invited to interview for ${updated.job_title}.`
        : `Your application for ${updated.job_title} is now "${status}".`,
    link: '/applications',
    jobId: updated.job_id,
    applicationId: updated.id,
  });
  return updated;
}

export default function applicationRoutes(db) {
  const r = Router();
  r.use(requireAuth);

  r.post('/', (req, res) => {
    const { jobId, resumeId = null } = req.body ?? {};
    if (!Number.isInteger(jobId)) throw new HttpError(400, 'jobId is required');

    const job = db.prepare('SELECT title, recruiter_id, status, archived_at FROM jobs WHERE id = ?').get(jobId);
    if (!job) throw new HttpError(404, 'Job not found');
    if (job.archived_at) throw new HttpError(400, 'This job posting is no longer accepting applications');
    if (job.status === 'closed') throw new HttpError(400, 'This job posting is closed');

    if (resumeId !== null) {
      const resume = db.prepare('SELECT 1 FROM resumes WHERE id = ? AND user_id = ?').get(resumeId, req.user.id);
      if (!resume) throw new HttpError(400, 'resumeId does not belong to you');
    }

    if (db.prepare('SELECT 1 FROM applications WHERE user_id = ? AND job_id = ?').get(req.user.id, jobId)) {
      throw new HttpError(409, 'You already applied to this job');
    }

    const applicationId = db.transaction(() => {
      const { lastInsertRowid } = db
        .prepare('INSERT INTO applications (user_id, job_id, resume_id) VALUES (?, ?, ?)')
        .run(req.user.id, jobId, resumeId);
      recordStatus(db, lastInsertRowid, 'Applied', req.user.id);

      const applicant = db
        .prepare('SELECT u.email, p.full_name FROM users u LEFT JOIN profiles p ON p.user_id = u.id WHERE u.id = ?')
        .get(req.user.id);
      notify(db, {
        userId: job.recruiter_id,
        type: 'new_application',
        title: `New application for ${job.title}`,
        message: `${applicant.full_name || applicant.email} applied to ${job.title}.`,
        link: `/recruiter/postings/${jobId}/applicants`,
        jobId,
        applicationId: lastInsertRowid,
      });
      return lastInsertRowid;
    })();

    const row = db.prepare(SELECT_ONE).get(applicationId);
    res.status(201).json({ application: toApi(row) });
  });

  // US-21 analytics over the current user's own applications. See computeStats() for the fields.
  r.get('/stats', (req, res) => {
    const rows = db
      .prepare(
        `SELECT a.status, a.applied_at AS appliedAt,
                EXISTS (SELECT 1 FROM application_status_history h
                        WHERE h.application_id = a.id AND h.status <> 'Applied') AS responded,
                (j.status = 'open' AND j.archived_at IS NULL) AS jobOpen
         FROM applications a
         JOIN jobs j ON j.id = a.job_id
         WHERE a.user_id = ?`
      )
      .all(req.user.id)
      .map((r) => ({ ...r, responded: Boolean(r.responded), jobOpen: Boolean(r.jobOpen) }));
    res.json({ stats: computeStats(rows) });
  });

  // An application's status changes, oldest first. Visible to the applicant and to the
  // recruiter who owns the posting; 404 for everyone else, as for other applications routes.
  r.get('/:id/history', (req, res) => {
    const application = db
      .prepare('SELECT a.id, a.user_id, j.recruiter_id FROM applications a JOIN jobs j ON j.id = a.job_id WHERE a.id = ?')
      .get(req.params.id);
    if (!application || ![application.user_id, application.recruiter_id].includes(req.user.id)) {
      throw new HttpError(404, 'Application not found');
    }

    const history = db
      .prepare(
        `SELECT status, changed_at, changed_by FROM application_status_history
         WHERE application_id = ? ORDER BY changed_at, id`
      )
      .all(application.id)
      .map((h) => ({
        status: h.status,
        changedAt: h.changed_at,
        // Who made the change, relative to this application; null where unknown (backfilled rows).
        changedBy: h.changed_by === null ? null : h.changed_by === application.user_id ? 'applicant' : 'recruiter',
      }));
    res.json({ history });
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
        `SELECT a.*, j.title AS job_title, j.location AS job_location, j.category AS job_category, j.deadline AS job_deadline, j.status AS job_status,
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

    const updated = db.transaction(() => changeStatus(db, row, status, req.user.id))();

    res.json({ application: toApi(updated) });
  });

  return r;
}
