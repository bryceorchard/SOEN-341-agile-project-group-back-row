import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { JobDetail } from './job-detail.component';
import { API_BASE, AuthService, AuthUser } from './auth.service';

// Acceptance tests for US-20 (#91): view job details. AT-2 and AT-4 are already covered
// in job-detail.component.spec.ts; these cover AT-1 and the rest of AT-3.

const JOB_ID = 7;
const JOB = {
  id: JOB_ID,
  title: 'Backend Developer',
  description: 'Work on the API.\nWrite tests.\n\nMontreal office, hybrid.',
  location: 'Montreal',
  category: 'Engineering',
  deadline: '2026-12-31',
  status: 'open',
  createdAt: '2026-10-01T12:00:00Z',
};

const SEEKER: AuthUser = { id: 1, email: 'seeker@test.com', role: 'job_seeker', createdAt: '' };
const RECRUITER: AuthUser = { id: 2, email: 'recruiter@test.com', role: 'recruiter', createdAt: '' };

describe('US-20 acceptance', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;
  let user: AuthUser | null;

  beforeEach(async () => {
    user = null;
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'jobs/:id', component: JobDetail }]),
        { provide: AuthService, useValue: { currentUser: () => user } },
      ],
    }).compileComponents();
  });

  afterEach(() => http.verify());

  // Opens the job page (optionally with the search filters the user came from) and answers its requests.
  async function openPage(query = '') {
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/jobs/${JOB_ID}${query}`, JobDetail);
    http = TestBed.inject(HttpTestingController);
    http.expectOne(`${API_BASE}/jobs/${JOB_ID}`).flush({ job: JOB });
    if (user?.role === 'job_seeker') {
      http.expectOne(`${API_BASE}/resumes`).flush({ resumes: [] });
      http.expectOne(`${API_BASE}/applications`).flush({ applications: [] });
    }
    harness.detectChanges();
    await harness.fixture.whenStable();
  }

  const page = () => harness.routeNativeElement as HTMLElement;
  const text = (selector: string) => page().querySelector(selector)?.textContent?.trim() ?? '';
  const buttons = () => Array.from(page().querySelectorAll('button')).map((b) => b.textContent!.trim());

  it('US-20 AT-1: shows the title, full description with its line breaks, location, category, deadline and posted date', async () => {
    await openPage();

    expect(text('h1')).toBe('Backend Developer');
    const description = page().querySelector('.job-description') as HTMLElement;
    expect(description.textContent).toBe(JOB.description); // full text, line breaks included
    expect(getComputedStyle(description).whiteSpace).toBe('pre-line'); // the line breaks are displayed
    expect(page().textContent).toContain('Montreal');
    expect(text('.badge')).toBe('Engineering');
    expect(text('.job-deadline')).toBe('Apply by 2026-12-31');
    expect(text('.job-posted')).toBe('Posted Oct 1, 2026');
  });

  it('US-20 AT-1: the back link returns to the same filtered search the user came from', async () => {
    await openPage('?keyword=backend&location=Montreal&category=Engineering');

    const back = page().querySelector('a.back-link') as HTMLAnchorElement;
    expect(back.getAttribute('href')).toBe('/jobs?keyword=backend&location=Montreal&category=Engineering');
  });

  it('US-20 AT-3: a logged-in job seeker sees the apply form', async () => {
    user = SEEKER;
    await openPage();

    expect(text('.apply-card h2')).toBe('Apply to this job');
    expect(buttons()).toContain('Submit application');
  });

  it('US-20 AT-3: a logged-out user sees no apply form, only a link to log in', async () => {
    await openPage();

    expect(page().querySelector('form')).toBeNull();
    expect(buttons()).not.toContain('Submit application');
    const login = page().querySelector('.apply-card a') as HTMLAnchorElement;
    expect(login.getAttribute('href')).toBe('/login');
    expect(text('.apply-card')).toContain('to apply');
  });

  it('US-20 AT-3: a recruiter does not see the apply form or a login prompt at all', async () => {
    user = RECRUITER;
    await openPage();

    expect(page().querySelector('.apply-card')).toBeNull();
    expect(page().querySelector('form')).toBeNull();
    expect(buttons()).not.toContain('Submit application');
  });
});
