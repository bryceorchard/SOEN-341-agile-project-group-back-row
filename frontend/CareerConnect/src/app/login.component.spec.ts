import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { Login } from './login.component';
import { API_BASE } from './auth.service';

@Component({ template: '' })
class Blank {}

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let page: Login;
  let http: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'jobs', component: Blank },
          { path: 'recruiter/postings', component: Blank },
        ]),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Login);
    page = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    await render();
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  async function render() {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function text(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  function registerButton(): HTMLButtonElement {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Register',
    ) as HTMLButtonElement;
  }

  function errors(): string[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.alert-error')).map(
      (e) => e.textContent?.trim() ?? '',
    );
  }

  // Type into the real inputs (like a user) so the form controls and the view both update.
  function fillIn(email: string, password: string) {
    const [emailInput, passwordInput] = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('input'),
    ) as HTMLInputElement[];
    emailInput.value = email;
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = password;
    passwordInput.dispatchEvent(new Event('input'));
  }

  describe('server responses', () => {
    it('shows "Wrong email or password" on a 401 from login', async () => {
      fillIn('seeker@example.com', 'wrong-password');
      page.login();
      http
        .expectOne(`${API_BASE}/auth/login`)
        .flush({ error: 'Invalid email or password' }, { status: 401, statusText: 'Unauthorized' });
      await render();

      expect(text()).toContain('Wrong email or password');
    });

    it('shows "Email already registered" on a 409 from signup', async () => {
      fillIn('taken@example.com', 'Password123!');
      page.register();
      http
        .expectOne(`${API_BASE}/auth/signup`)
        .flush({ error: 'Email already registered' }, { status: 409, statusText: 'Conflict' });
      await render();

      expect(text()).toContain('Email already registered');
    });

    it("shows the backend's own message on a 400 from signup", async () => {
      fillIn('new@example.com', 'Password123!');
      page.register();
      http
        .expectOne(`${API_BASE}/auth/signup`)
        .flush({ error: 'role must be job_seeker or recruiter' }, { status: 400, statusText: 'Bad Request' });
      await render();

      expect(text()).toContain('role must be job_seeker or recruiter');
      expect(text()).not.toContain('Something went wrong');
    });

    it("shows the backend's own message on a 400 from login", async () => {
      fillIn('seeker@example.com', 'x');
      page.login();
      http
        .expectOne(`${API_BASE}/auth/login`)
        .flush({ error: 'email and password are required' }, { status: 400, statusText: 'Bad Request' });
      await render();

      expect(text()).toContain('email and password are required');
    });
  });

  describe('client-side validation', () => {
    it('blocks registration with an invalid email and sends nothing', async () => {
      fillIn('not-an-email', 'Password123!');
      await render();

      expect(registerButton().disabled).toBe(true);
      expect(errors()).toContain('Enter a valid email address');
      page.register();
      http.expectNone(`${API_BASE}/auth/signup`);
    });

    it('blocks registration with a password under 8 characters and sends nothing', async () => {
      fillIn('new@example.com', 'short');
      await render();

      expect(registerButton().disabled).toBe(true);
      expect(errors()).toContain('Password must be at least 8 characters');
      page.register();
      http.expectNone(`${API_BASE}/auth/signup`);
    });

    it('enables Register and signs up with the chosen role when the input is valid', async () => {
      fillIn('new@example.com', 'Password123!');
      (Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === 'Recruiter',
      ) as HTMLButtonElement).click();
      await render();

      expect(registerButton().disabled).toBe(false);
      page.register();
      const req = http.expectOne(`${API_BASE}/auth/signup`);
      expect(req.request.body).toEqual({ email: 'new@example.com', password: 'Password123!', role: 'recruiter' });
      req.flush({ user: { id: 9, email: 'new@example.com', role: 'recruiter', createdAt: '' } }, { status: 201, statusText: 'Created' });
      http
        .expectOne(`${API_BASE}/auth/login`)
        .flush({ token: 't', user: { id: 9, email: 'new@example.com', role: 'recruiter', createdAt: '' } });
      await fixture.whenStable();

      expect(TestBed.inject(Router).url).toBe('/recruiter/postings');
    });
  });
});
