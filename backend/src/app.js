import express from 'express';
import cors from 'cors';
import { CORS_ORIGIN } from './config.js';
import { notFound, errorHandler } from './middleware.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import resumeRoutes from './routes/resumes.js';

export function createApp(db) {
  const app = express();
  app.use(cors({ origin: CORS_ORIGIN }));
  app.use(express.json());
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/auth', authRoutes(db));
  app.use('/profile', profileRoutes(db));
  app.use('/resumes', resumeRoutes(db));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
