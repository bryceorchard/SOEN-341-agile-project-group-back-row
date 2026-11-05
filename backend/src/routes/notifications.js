import { Router } from 'express';
import { HttpError } from '../errors.js';
import { requireAuth } from '../middleware.js';

const toApi = (n) => ({
  id: n.id,
  type: n.type,
  title: n.title,
  message: n.message,
  link: n.link,
  jobId: n.job_id,
  applicationId: n.application_id,
  read: n.read_at !== null,
  readAt: n.read_at,
  createdAt: n.created_at,
});

export default function notificationRoutes(db) {
  const r = Router();
  r.use(requireAuth);

  // The current user's own notifications, newest first. ?unread=true shows only unread ones.
  r.get('/', (req, res) => {
    const clauses = ['user_id = @userId'];
    const params = { userId: req.user.id };
    if (req.query.unread === 'true') clauses.push('read_at IS NULL');

    const rows = db
      .prepare(`SELECT * FROM notifications WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC`)
      .all(params);
    res.json({ notifications: rows.map(toApi) });
  });

  r.get('/unread-count', (req, res) => {
    const { count } = db
      .prepare('SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND read_at IS NULL')
      .get(req.user.id);
    res.json({ count });
  });

  // Recipient only: mark all of the current user's unread notifications as read.
  r.patch('/read-all', (req, res) => {
    db.prepare("UPDATE notifications SET read_at = datetime('now') WHERE user_id = ? AND read_at IS NULL").run(req.user.id);
    res.json({ count: 0 });
  });

  // Recipient only: mark a single notification as read.
  r.patch('/:id/read', (req, res) => {
    const row = db.prepare('SELECT * FROM notifications WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!row) throw new HttpError(404, 'Notification not found');

    db.prepare("UPDATE notifications SET read_at = datetime('now') WHERE id = ?").run(row.id);
    res.json({ notification: toApi(db.prepare('SELECT * FROM notifications WHERE id = ?').get(row.id)) });
  });

  return r;
}
