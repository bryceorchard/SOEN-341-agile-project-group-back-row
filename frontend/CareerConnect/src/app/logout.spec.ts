import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { AuthService } from './auth.service';
import { authGuard } from './guards';

// Empty stand-in pages, so these tests only check navigation and not page content.
@Component({ template: 'login page' })
class StubLogin {}
@Component({ template: 'profile page' })
class StubProfile {}
@Component({ template: 'jobs page' })
class StubJobs {}

describe('US-01 Logout', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideRouter([
          { path: 'login', component: StubLogin },
          { path: 'profile', component: StubProfile, canActivate: [authGuard] },
          { path: 'jobs', component: StubJobs },
        ]),
      ],
    }).compileComponents();
  });

  afterEach(() => localStorage.clear());

  it('US-01 AT-6: clicking Logout returns the user to the login page and clears their session', async () => {
    localStorage.setItem('cc_token', 'test-token');
    localStorage.setItem('cc_user', JSON.stringify({ id: 1, email: 'ada@test.com', role: 'job_seeker', createdAt: '' }));

    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);
    await router.navigateByUrl('/profile');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toBe('/profile');

    (fixture.nativeElement.querySelector('button.nav-logout') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(router.url).toBe('/login');
    expect(localStorage.getItem('cc_token')).toBeNull();
    expect(TestBed.inject(AuthService).currentUser()).toBeNull();
  });

  it('US-01 AT-6: visiting /profile while logged out redirects to /login', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/profile');

    expect(TestBed.inject(Router).url).toBe('/login');
  });
});
