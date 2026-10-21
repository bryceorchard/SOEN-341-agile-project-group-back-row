import { Router } from 'express';
import { HttpError } from '../errors.js';
import { requireAuth, requireRole } from '../middleware.js';

const JOB_STATUSES = ['open', 'closed'];
const APPLICATION_STATUSES = ['Applied', 'Under Review', 'Interview', 'Offered', 'Rejected'];

const toApi = (j) => ({
  id: j.id,
  recruiterId: j.recruiter_id,
  title: j.title,
  description: j.description,
  location: j.location,
  category: j.category,
  deadline: j.deadline,
  status: j.status,
  createdAt: j.created_at,
});

function validateJobBody(body) {
  const { title, description, location = null, category = null, deadline = null } = body ?? {};
  if (typeof title !== 'string' || !title.trim()) throw new HttpError(400, 'Title is required');
  if (typeof description !== 'string' || !description.trim()) throw new HttpError(400, 'Description is required');
  return { title: title.trim(), description: description.trim(), location, category, deadline };
}

export default function jobRoutes(db) {
  const r = Router();

  // Public: job seekers browse without an account. Closed postings never show up here.
  // Filters are all optional and AND together.
  r.get('/', (req, res) => {
    const { keyword, location, category } = req.query;
    const clauses = ["status = 'open'"];
    const params = {};

    if (typeof keyword === 'string' && keyword.trim()) {
      clauses.push('(title LIKE @keyword OR description LIKE @keyword)');
      params.keyword = `%${keyword.trim()}%`;
    }
    if (typeof location === 'string' && location.trim()) {
      clauses.push('location LIKE @location');
      params.location = `%${location.trim()}%`;
    }
    if (typeof category === 'string' && category.trim()) {
      clauses.push('category = @category');
      params.category = category.trim();
    }

    const rows = db.prepare(`SELECT * FROM jobs WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC`).all(params);
    res.json({ jobs: rows.map(toApi) });
  });

  // Recruiter only: their own postings (any status), with how many applications each has.
  // Registered before '/:id' so 'mine' isn't parsed as a job id.
  r.get('/mine', requireAuth, requireRole('recruiter'), (req, res) => {
    const rows = db
      .prepare(
        `SELECT j.*, COUNT(a.id) AS application_count
         FROM jobs j
         LEFT JOIN applications a ON a.job_id = j.id
         WHERE j.recruiter_id = ?
         GROUP BY j.id
         ORDER BY j.created_at DESC`
      )
      .all(req.user.id);
    res.json({ jobs: rows.map((j) => ({ ...toApi(j), applicationCount: j.application_count })) });
  });

  r.get('/:id', (req, res) => {
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
    if (!job) throw new HttpError(404, 'Job not found');
    res.json({ job: toApi(job) });
  });

  // Owning recruiter only: who applied to this posting. Optional ?status= filter.
  r.get('/:id/applications', requireAuth, requireRole('recruiter'), (req, res) => {
    const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND recruiter_id = ?').get(req.params.id, req.user.id);
    if (!job) throw new HttpError(404, 'Job not found');

    const { status } = req.query;
    if (status !== undefined && !APPLICATION_STATUSES.includes(status)) {
      throw new HttpError(400, `status must be one of: ${APPLICATION_STATUSES.join(', ')}`);
    }

    const clauses = ['a.job_id = @jobId'];
    const params = { jobId: job.id };
    if (status !== undefined) {
      clauses.push('a.status = @status');
      params.status = status;
    }

    const rows = db
      .prepare(
        `SELECT a.id, a.status, a.applied_at, a.resume_id,
                u.email AS applicant_email, p.full_name AS applicant_name, p.headline AS applicant_headline,
                res.original_filename AS resume_filename
         FROM applications a
         JOIN users u ON u.id = a.user_id
         LEFT JOIN profiles p ON p.user_id = a.user_id
         LEFT JOIN resumes res ON res.id = a.resume_id
         WHERE ${clauses.join(' AND ')}
         ORDER BY a.applied_at DESC`
      )
      .all(params);

    res.json({
      applications: rows.map((a) => ({
        id: a.id,
        applicantEmail: a.applicant_email,
        applicantName: a.applicant_name,
        applicantHeadline: a.applicant_headline,
        resumeId: a.resume_id,
        resumeFilename: a.resume_filename,
        status: a.status,
        appliedAt: a.applied_at,
      })),
    });
  });

  r.post('/', requireAuth, requireRole('recruiter'), (req, res) => {
    const { title, description, location, category, deadline } = validateJobBody(req.body);
    const { lastInsertRowid } = db
      .prepare('INSERT INTO jobs (recruiter_id, title, description, location, category, deadline) VALUES (?, ?, ?, ?, ?, ?)')
      .run(req.user.id, title, description, location, category, deadline);
    res.status(201).json({ job: toApi(db.prepare('SELECT * FROM jobs WHERE id = ?').get(lastInsertRowid)) });
  });

  // Owning recruiter only: edit a posting with the same validation as create.
  r.put('/:id', requireAuth, requireRole('recruiter'), (req, res) => {
    const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND recruiter_id = ?').get(req.params.id, req.user.id);
    if (!job) throw new HttpError(404, 'Job not found');

    const { title, description, location, category, deadline } = validateJobBody(req.body);
    db.prepare(
      "UPDATE jobs SET title = ?, description = ?, location = ?, category = ?, deadline = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(title, description, location, category, deadline, job.id);
    res.json({ job: toApi(db.prepare('SELECT * FROM jobs WHERE id = ?').get(job.id)) });
  });

  // Owning recruiter only: close or reopen a posting.
  r.patch('/:id/status', requireAuth, requireRole('recruiter'), (req, res) => {
    const { status } = req.body ?? {};
    if (!JOB_STATUSES.includes(status)) throw new HttpError(400, `status must be one of: ${JOB_STATUSES.join(', ')}`);

    const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND recruiter_id = ?').get(req.params.id, req.user.id);
    if (!job) throw new HttpError(404, 'Job not found');

    db.prepare("UPDATE jobs SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, job.id);
    res.json({ job: toApi(db.prepare('SELECT * FROM jobs WHERE id = ?').get(job.id)) });
  });

  return r;
}
