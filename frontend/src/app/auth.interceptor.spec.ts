import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { API_BASE, AuthService } from './auth.service';

const TOKEN_KEY = 'cc_token';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let http: HttpTestingController;
  let logout: ReturnType<typeof vi.fn>;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    logout = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: { logout } },
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl');
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('attaches the stored token as a Bearer header', () => {
    localStorage.setItem(TOKEN_KEY, 'abc.def.ghi');

    httpClient.get(`${API_BASE}/profile`).subscribe();

    const req = http.expectOne(`${API_BASE}/profile`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc.def.ghi');
    req.flush({});
  });

  it('leaves requests to other hosts untouched', () => {
    httpClient.get('https://example.com/data').subscribe();

    const req = http.expectOne('https://example.com/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('logs out and redirects to /login on a 401 for an authenticated request', () => {
    localStorage.setItem(TOKEN_KEY, 'abc.def.ghi');

    httpClient.get(`${API_BASE}/profile`).subscribe({ error: () => {} });

    http.expectOne(`${API_BASE}/profile`).flush({ error: 'Invalid token' }, { status: 401, statusText: 'Unauthorized' });

    expect(logout).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('does not trigger auto-logout for a 401 with no token attached (e.g. a bad login attempt)', () => {
    httpClient.post(`${API_BASE}/auth/login`, { email: 'x', password: 'y' }).subscribe({ error: () => {} });

    http
      .expectOne(`${API_BASE}/auth/login`)
      .flush({ error: 'Invalid email or password' }, { status: 401, statusText: 'Unauthorized' });

    expect(logout).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
