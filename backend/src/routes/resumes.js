import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { UPLOAD_DIR, MAX_RESUME_BYTES, ALLOWED_RESUME_TYPES } from '../config.js';
import { HttpError } from '../errors.js';
import { requireAuth } from '../middleware.js';

const toApi = (r) => ({ id: r.id, originalFilename: r.original_filename, fileType: r.file_type, uploadedAt: r.uploaded_at });

// RFC 6266 Content-Disposition: an ASCII-only `filename` fallback plus a UTF-8 `filename*`
// (RFC 5987). Node rejects header values with characters above U+00FF (e.g. ’ or 履), so the
// original name can't be placed in the header as-is.
function contentDisposition(name) {
  const ascii = name.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '');
  const encoded = encodeURIComponent(name).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  return `inline; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

export default function resumeRoutes(db) {
  mkdirSync(UPLOAD_DIR, { recursive: true });

  const upload = multer({
    storage: multer.diskStorage({
      destination: UPLOAD_DIR,
      filename: (_req, file, cb) => cb(null, randomUUID() + ALLOWED_RESUME_TYPES[file.mimetype]),
    }),
    limits: { fileSize: MAX_RESUME_BYTES, files: 1 },
    // Browsers send filenames as UTF-8; multer's default (latin1) would garble "Résumé.pdf".
    defParamCharset: 'utf8',
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

  // Streams the stored file. Allowed for the owner, or a recruiter who owns a job
  // this resume was submitted to; everyone else (and any other resume) gets 404.
  r.get('/:id/file', (req, res) => {
    const row = db.prepare('SELECT * FROM resumes WHERE id = ?').get(req.params.id);
    if (!row) throw new HttpError(404, 'Resume not found');

    const isOwner = row.user_id === req.user.id;
    const isRecruiterOfApplicant = !isOwner && db
      .prepare(
        `SELECT 1 FROM applications a JOIN jobs j ON j.id = a.job_id
         WHERE a.resume_id = ? AND j.recruiter_id = ?`
      )
      .get(row.id, req.user.id);
    if (!isOwner && !isRecruiterOfApplicant) throw new HttpError(404, 'Resume not found');
    if (!existsSync(row.file_path)) throw new HttpError(404, 'Resume file not found');

    res.setHeader('Content-Disposition', contentDisposition(row.original_filename));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.type(row.file_type);
    res.sendFile(row.file_path);
  });

  // Replace the file on an existing resume record; the old file on disk is removed.
  r.put('/:id', upload.single('resume'), (req, res) => {
    const row = db.prepare('SELECT * FROM resumes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!row) throw new HttpError(404, 'Resume not found');
    if (!req.file) throw new HttpError(400, 'No file uploaded (multipart field name: "resume")');

    db.prepare(
      "UPDATE resumes SET file_path = ?, original_filename = ?, file_type = ?, uploaded_at = datetime('now') WHERE id = ?"
    ).run(req.file.path, req.file.originalname, req.file.mimetype, row.id);
    rmSync(row.file_path, { force: true });

    res.json({ resume: toApi(db.prepare('SELECT * FROM resumes WHERE id = ?').get(row.id)) });
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
