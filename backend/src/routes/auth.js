import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config.js';
import { HttpError } from '../errors.js';
import { requireAuth } from '../middleware.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ['job_seeker', 'recruiter'];

const publicUser = (u) => ({ id: u.id, email: u.email, role: u.role, createdAt: u.created_at });

export default function authRoutes(db) {
  const r = Router();

  r.post('/signup', (req, res) => {
    const { email, password, role = 'job_seeker' } = req.body ?? {};
    if (typeof email !== 'string' || !EMAIL_RE.test(email)) throw new HttpError(400, 'Valid email is required');
    if (typeof password !== 'string' || password.length < 8) throw new HttpError(400, 'Password must be at least 8 characters');
    if (!ROLES.includes(role)) throw new HttpError(400, `Role must be one of: ${ROLES.join(', ')}`);

    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) throw new HttpError(409, 'Email already registered');

    const hash = bcrypt.hashSync(password, 10);
    const create = db.transaction(() => {
      const { lastInsertRowid } = db
        .prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)')
        .run(email, hash, role);
      db.prepare('INSERT INTO profiles (user_id) VALUES (?)').run(lastInsertRowid);
      return db.prepare('SELECT * FROM users WHERE id = ?').get(lastInsertRowid);
    });
    res.status(201).json({ user: publicUser(create()) });
  });

  r.post('/login', (req, res) => {
    const { email, password } = req.body ?? {};
    if (typeof email !== 'string' || typeof password !== 'string') throw new HttpError(400, 'Email and password are required');
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) throw new HttpError(401, 'Invalid email or password');
    const token = jwt.sign({ role: user.role }, JWT_SECRET, { subject: String(user.id), expiresIn: JWT_EXPIRES_IN });
    res.json({ token, user: publicUser(user) });
  });

  // Tokens are stateless; logout is a client-side token discard.
  r.post('/logout', requireAuth, (_req, res) => res.status(204).end());

  r.get('/me', requireAuth, (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) throw new HttpError(401, 'User no longer exists');
    res.json({ user: publicUser(user) });
  });

  return r;
}
