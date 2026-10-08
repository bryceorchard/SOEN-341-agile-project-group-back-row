import { Router } from 'express';
import { HttpError } from '../errors.js';
import { requireAuth, requireRole } from '../middleware.js';

const toApi = (j) => ({
  id: j.id,
  recruiterId: j.recruiter_id,
  title: j.title,
  description: j.description,
  location: j.location,
  category: j.category,
  deadline: j.deadline,
  createdAt: j.created_at,
});

export default function jobRoutes(db) {
  const r = Router();

  // Public: job seekers browse without an account. Filters are all optional and AND together.
  r.get('/', (req, res) => {
    const { keyword, location, category } = req.query;
    const clauses = [];
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

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = db.prepare(`SELECT * FROM jobs ${where} ORDER BY created_at DESC`).all(params);
    res.json({ jobs: rows.map(toApi) });
  });

  r.get('/:id', (req, res) => {
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
    if (!job) throw new HttpError(404, 'Job not found');
    res.json({ job: toApi(job) });
  });

  r.post('/', requireAuth, requireRole('recruiter'), (req, res) => {
    const { title, description, location = null, category = null, deadline = null } = req.body ?? {};
    if (typeof title !== 'string' || !title.trim()) throw new HttpError(400, 'Title is required');
    if (typeof description !== 'string' || !description.trim()) throw new HttpError(400, 'Description is required');

    const { lastInsertRowid } = db
      .prepare('INSERT INTO jobs (recruiter_id, title, description, location, category, deadline) VALUES (?, ?, ?, ?, ?, ?)')
      .run(req.user.id, title.trim(), description.trim(), location, category, deadline);
    res.status(201).json({ job: toApi(db.prepare('SELECT * FROM jobs WHERE id = ?').get(lastInsertRowid)) });
  });

  return r;
}
