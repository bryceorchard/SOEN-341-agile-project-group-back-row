import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_BASE, AuthService } from './auth.service';

const TOKEN_KEY = 'cc_token';

// Attaches the saved JWT to every request we make to our own API, so protected routes
// (GET/PUT /profile, /resumes) work without each component handling headers itself.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_BASE)) return next(req);

  const auth = inject(AuthService);
  const router = inject(Router);

  let token: string | null = null;
  try {
    token = localStorage.getItem(TOKEN_KEY);
  } catch {
    // ignore — request just goes out unauthenticated
  }

  const authedReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authedReq).pipe(
    catchError((err: unknown) => {
      // An expired/invalid token means the session is dead — clear it and bounce to login
      // rather than leaving the user stuck on a page full of failed requests.
      if (err instanceof HttpErrorResponse && err.status === 401 && token) {
        auth.logout();
        router.navigateByUrl('/login');
      }
      return throwError(() => err);
    }),
  );
};
