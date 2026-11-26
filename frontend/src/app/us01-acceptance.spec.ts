import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { Login } from './login.component';
import { API_BASE } from './auth.service';
import { Profile } from './profile.component';

// Acceptance tests for US-01 (#88), AT-3 to AT-5. AT-6 is in logout.spec.ts.
// These sit next to the existing login/profile specs instead of replacing them.

describe('US-01 Registration (Login page)', () => {
  let fixture: ComponentFixture<Login>;
  let http: HttpTestingController;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  const el = () => fixture.nativeElement as HTMLElement;

  function type(placeholder: string, value: string) {
    const input = el().querySelector(`input[placeholder="${placeholder}"]`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function button(text: string): HTMLButtonElement {
    return Array.from(el().querySelectorAll('button')).find((b) => b.textContent!.trim() === text)!;
  }

  // Signup returns the new user, then the page logs in automatically to get a token.
  function answerSignupAndLogin(email: string, role: 'job_seeker' | 'recruiter') {
    const signup = http.expectOne(`${API_BASE}/auth/signup`);
    expect(signup.request.body).toEqual({ email, password: 'Password123', role });
    signup.flush({ user: { id: 1, email, role, createdAt: '' } });

    const login = http.expectOne(`${API_BASE}/auth/login`);
    login.flush({ token: 'test-token', user: { id: 1, email, role, createdAt: '' } });
  }

  it('US-01 AT-3: registering as a Recruiter creates a recruiter account and lands on the recruiter home page', () => {
    type('you@example.com', 'rec@test.com');
    type('••••••••', 'Password123');
    button('Recruiter').click();
    button('Register').click();

    answerSignupAndLogin('rec@test.com', 'recruiter');

    expect(navigate).toHaveBeenCalledWith('/recruiter/postings');
    expect(localStorage.getItem('cc_token')).toBe('test-token');
  });

  it('US-01 AT-3: registering as a Job Seeker creates a job seeker account and lands on the job seeker home page', () => {
    type('you@example.com', 'seek@test.com');
    type('••••••••', 'Password123');
    button('Job seeker').click();
    button('Register').click();

    answerSignupAndLogin('seek@test.com', 'job_seeker');

    expect(navigate).toHaveBeenCalledWith('/jobs');
  });

  it('US-01 AT-4: an invalid email shows a validation message and no account is created', () => {
    type('you@example.com', 'not-an-email');
    type('••••••••', 'Password123');

    expect(el().textContent).toContain('Enter a valid email address');
    expect(button('Register').disabled).toBe(true);

    fixture.componentInstance.register(); // even if forced, nothing is sent
    // http.verify() in afterEach fails the test if any signup request was made
  });

  it('US-01 AT-4: a password shorter than 8 characters shows a validation message and no account is created', () => {
    type('you@example.com', 'seek@test.com');
    type('••••••••', 'short');

    expect(el().textContent).toContain('Password must be at least 8 characters');
    expect(button('Register').disabled).toBe(true);

    fixture.componentInstance.register();
  });
});

const SAVED = {
  fullName: 'Ada Lovelace',
  headline: 'Backend developer',
  location: 'Montreal, QC',
  phone: '514-555-0100',
  bio: 'Likes engines.',
};

describe('US-01 Manage profile (Profile page)', () => {
  let fixture: ComponentFixture<Profile>;
  let http: HttpTestingController;

  // Opens the profile page as a logged-in job seeker and answers its startup requests.
  async function openProfile(profile: Partial<typeof SAVED> = {}) {
    fixture = TestBed.createComponent(Profile);
    fixture.detectChanges();
    http.expectOne(`${API_BASE}/resumes`).flush({ resumes: [] });
    http.expectOne(`${API_BASE}/profile`).flush({ profile: { fullName: null, headline: null, location: null, phone: null, bio: null, ...profile } });
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const field = (name: string) =>
    el().querySelector(`[formControlName="${name}"]`) as HTMLInputElement | HTMLTextAreaElement;

  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('cc_token', 'test-token');
    localStorage.setItem('cc_user', JSON.stringify({ id: 1, email: 'ada@test.com', role: 'job_seeker', createdAt: '' }));

    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('US-01 AT-5: editing all profile fields and saving sends them to the backend and shows a success message', async () => {
    await openProfile();

    for (const [name, value] of Object.entries(SAVED)) {
      const input = field(name);
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    (el().querySelector('form button[type="submit"]') as HTMLButtonElement).click();

    const save = http.expectOne(`${API_BASE}/profile`);
    expect(save.request.method).toBe('PUT');
    expect(save.request.body).toEqual(SAVED);
    save.flush({ profile: SAVED });
    fixture.detectChanges();

    expect(el().querySelector('.alert-success')?.textContent).toContain('Saved.');
  });

  it('US-01 AT-5: after reloading, the saved profile values are shown in the form', async () => {
    await openProfile(SAVED);

    for (const [name, value] of Object.entries(SAVED)) {
      expect(field(name).value).toBe(value);
    }
  });
});
