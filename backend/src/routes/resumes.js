import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdirSync, rmSync } from 'node:fs';
import { UPLOAD_DIR, MAX_RESUME_BYTES, ALLOWED_RESUME_TYPES } from '../config.js';
import { HttpError } from '../errors.js';
import { requireAuth } from '../middleware.js';

const toApi = (r) => ({ id: r.id, originalFilename: r.original_filename, fileType: r.file_type, uploadedAt: r.uploaded_at });

export default function resumeRoutes(db) {
  mkdirSync(UPLOAD_DIR, { recursive: true });

  const upload = multer({
    storage: multer.diskStorage({
      destination: UPLOAD_DIR,
      filename: (_req, file, cb) => cb(null, randomUUID() + ALLOWED_RESUME_TYPES[file.mimetype]),
    }),
    limits: { fileSize: MAX_RESUME_BYTES, files: 1 },
    fileFilter: (_req, file, cb) =>
      ALLOWED_RESUME_TYPES[file.mimetype]
        ? cb(null, true)
        : cb(new HttpError(400, 'Resume must be a PDF, DOC or DOCX file')),
  });

  const r = Router();
  r.use(requireAuth);

  r.post('/', upload.single('resume'), (req, res) => {
    if (!req.file) throw new HttpError(400, 'No file uploaded (multipart field name: "resume")');
    const { lastInsertRowid } = db
      .prepare('INSERT INTO resumes (user_id, file_path, original_filename, file_type) VALUES (?, ?, ?, ?)')
      .run(req.user.id, req.file.path, req.file.originalname, req.file.mimetype);
    res.status(201).json({ resume: toApi(db.prepare('SELECT * FROM resumes WHERE id = ?').get(lastInsertRowid)) });
  });

  r.get('/', (req, res) => {
    const rows = db.prepare('SELECT * FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC, id DESC').all(req.user.id);
    res.json({ resumes: rows.map(toApi) });
  });

  r.delete('/:id', (req, res) => {
    const row = db.prepare('SELECT * FROM resumes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!row) throw new HttpError(404, 'Resume not found');
    db.prepare('DELETE FROM resumes WHERE id = ?').run(row.id);
    rmSync(row.file_path, { force: true });
    res.status(204).end();
  });

  return r;
}
