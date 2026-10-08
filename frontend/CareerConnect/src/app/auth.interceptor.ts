import { HttpInterceptorFn } from '@angular/common/http';
import { API_BASE } from './auth.service';

const TOKEN_KEY = 'cc_token';

// Attaches the saved JWT to every request we make to our own API, so protected routes
// (GET/PUT /profile, /resumes) work without each component handling headers itself.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_BASE)) return next(req);

  let token: string | null = null;
  try {
    token = localStorage.getItem(TOKEN_KEY);
  } catch {
    // ignore — request just goes out unauthenticated
  }

  if (!token) return next(req);

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
