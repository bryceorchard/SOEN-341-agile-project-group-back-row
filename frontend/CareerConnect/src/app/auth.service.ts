import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

// Where the backend API lives. In dev, backend/ runs on :3000 (see backend/src/config.js);
// Angular's dev server runs on :4200, which is the default CORS_ORIGIN it allows.
export const API_BASE = 'http://localhost:3000';

export interface AuthUser {
  id: number;
  email: string;
  role: 'job_seeker' | 'recruiter';
  createdAt: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

const TOKEN_KEY = 'cc_token';
const USER_KEY = 'cc_user';

// JWT in one sentence: on login the backend signs a token proving who you are; we save it
// and attach it as "Authorization: Bearer <token>" on every request after that (see
// auth.interceptor.ts), instead of sending the password again on every call.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_BASE}/auth/login`, { email, password })
      .pipe(tap((res) => this.storeSession(res)));
  }

  register(email: string, password: string, role: AuthUser['role'] = 'job_seeker'): Observable<LoginResponse> {
    return new Observable<LoginResponse>((subscriber) => {
      this.http.post(`${API_BASE}/auth/signup`, { email, password, role }).subscribe({
        // Signup doesn't return a token, so log in right after to get one.
        next: () => this.login(email, password).subscribe(subscriber),
        error: (err) => subscriber.error(err),
      });
    });
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  getUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private storeSession(res: LoginResponse): void {
    try {
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    } catch {
      // localStorage unavailable (e.g. private mode) — session just won't persist across reloads.
    }
  }
}
