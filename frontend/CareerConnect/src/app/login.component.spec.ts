import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { Login } from './login.component';
import { API_BASE } from './auth.service';

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
