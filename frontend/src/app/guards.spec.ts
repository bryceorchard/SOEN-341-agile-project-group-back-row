import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { authGuard, roleGuard } from './guards';
import { AuthService } from './auth.service';

function setup(authValue: Partial<AuthService>) {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: AuthService, useValue: authValue }],
  });
  return TestBed.inject(Router);
}

describe('authGuard', () => {
  it('allows navigation when logged in', () => {
    setup({ isLoggedIn: () => true });
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('redirects to /login when not logged in', () => {
    const router = setup({ isLoggedIn: () => false });
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(router.serializeUrl(result as any)).toBe('/login');
  });
});

describe('roleGuard', () => {
  it('redirects to /login when there is no user', () => {
    const router = setup({ getUser: () => null });
    const result = TestBed.runInInjectionContext(() => roleGuard('recruiter')({} as any, {} as any));
    expect(router.serializeUrl(result as any)).toBe('/login');
  });

  it('allows navigation when the role matches', () => {
    setup({ getUser: () => ({ id: 1, email: 'r@test.com', role: 'recruiter', createdAt: '' }) });
    const result = TestBed.runInInjectionContext(() => roleGuard('recruiter')({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('redirects a job seeker away from a recruiter-only route', () => {
    const router = setup({ getUser: () => ({ id: 1, email: 's@test.com', role: 'job_seeker', createdAt: '' }) });
    const result = TestBed.runInInjectionContext(() => roleGuard('recruiter')({} as any, {} as any));
    expect(router.serializeUrl(result as any)).toBe('/jobs');
  });

  it('redirects a recruiter away from a job-seeker-only route', () => {
    const router = setup({ getUser: () => ({ id: 1, email: 'r@test.com', role: 'recruiter', createdAt: '' }) });
    const result = TestBed.runInInjectionContext(() => roleGuard('job_seeker')({} as any, {} as any));
    expect(router.serializeUrl(result as any)).toBe('/recruiter/postings');
  });
});
