import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService, API_BASE } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('stores the token, user, and currentUser signal on login', () => {
    const user = { id: 1, email: 'seeker@test.com', role: 'job_seeker' as const, createdAt: '2026-01-01' };

    service.login('seeker@test.com', 'Password123!').subscribe();
    http.expectOne(`${API_BASE}/auth/login`).flush({ token: 'abc.def.ghi', user });

    expect(service.getToken()).toBe('abc.def.ghi');
    expect(service.getUser()).toEqual(user);
    expect(service.currentUser()).toEqual(user);
    expect(service.isLoggedIn()).toBe(true);
  });

  it('clears the session on logout', () => {
    const user = { id: 1, email: 'seeker@test.com', role: 'job_seeker' as const, createdAt: '2026-01-01' };
    service.login('seeker@test.com', 'Password123!').subscribe();
    http.expectOne(`${API_BASE}/auth/login`).flush({ token: 'abc.def.ghi', user });

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.getUser()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });
});
