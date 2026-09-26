export const PORT = Number(process.env.PORT ?? 3000);
export const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-only-secret-change-me';
export const JWT_EXPIRES_IN = '1d';
export const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:4200';
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? new URL('../uploads', import.meta.url).pathname;
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export const ALLOWED_RESUME_TYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};
