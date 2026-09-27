import { fileURLToPath } from 'node:url';

export const PORT = Number(process.env.PORT ?? 3000);
export const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-only-secret-change-me';
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'dev-only-secret-change-me') {
  throw new Error('JWT_SECRET must be set to a non-default value in production');
}
export const JWT_EXPIRES_IN = '1d';
export const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:4200';
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? fileURLToPath(new URL('../uploads', import.meta.url));
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export const ALLOWED_RESUME_TYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};
