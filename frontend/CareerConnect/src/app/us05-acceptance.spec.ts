import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { JobDetail } from './job-detail.component';
import { API_BASE, AuthService, AuthUser } from './auth.service';

// Acceptance tests for US-05 (#92): submit applications through the platform.
// AT-2 (duplicate apply) is already covered in job-detail.component.spec.ts.

const JOB_ID = 7;
const JOB = {
  id: JOB_ID,
  title: 'Backend Developer',
  description: 'Work on the API',
  location: 'Montreal',
  category: 'Engineering',
  deadline: '2026-12-31',
  status: 'open',
  createdAt: '2026-10-01T12:00:00Z',
};
const RESUMES = [
  { id: 11, originalFilename: 'general-cv.pdf' },
  { id: 12, originalFilename: 'backend-cv.pdf' },
];
const SEEKER: AuthUser = { id: 1, email: 'seeker@test.com', role: 'job_seeker', createdAt: '' };

@Component({ template: 'login page' })
class StubLogin {}

describe('US-05 acceptance', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;
  let user: AuthUser | null;

  beforeEach(async () => {
    user = SEEKER;
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'jobs/:id', component: JobDetail },
          { path: 'login', component: StubLogin },
        ]),
        { provide: AuthService, useValue: { currentUser: () => user } },
      ],
    }).compileComponents();
  });

  afterEach(() => http.verify());

  async function openPage() {
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/jobs/${JOB_ID}`, JobDetail);
    http = TestBed.inject(HttpTestingController);
    http.expectOne(`${API_BASE}/jobs/${JOB_ID}`).flush({ job: JOB });
    if (user) {
      http.expectOne(`${API_BASE}/resumes`).flush({ resumes: RESUMES });
      http.expectOne(`${API_BASE}/applications`).flush({ applications: [] });
    }
    await render();
  }

  async function render() {
    harness.detectChanges();
    await harness.fixture.whenStable();
  }

  const page = () => harness.routeNativeElement as HTMLElement;

  async function pickResumeAndSubmit(resumeId: number) {
    const select = page().querySelector('select[formControlName="resumeId"]') as HTMLSelectElement;
    select.value = String(resumeId);
    select.dispatchEvent(new Event('change'));
    (page().querySelector('button[type="submit"]') as HTMLButtonElement).click();
  }

  it('US-05 AT-1: applying with a chosen resume shows a confirmation (title, date, "Applied", link) and the page switches to the applied state', async () => {
    await openPage();

    await pickResumeAndSubmit(12);
    const req = http.expectOne(`${API_BASE}/applications`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ jobId: JOB_ID, resumeId: '12' });
    req.flush(
      { application: { id: 3, jobId: JOB_ID, status: 'Applied', appliedAt: '2026-11-16 21:00:00' } },
      { status: 201, statusText: 'Created' },
    );
    await render();

    const confirmation = page().querySelector('.apply-confirmation') as HTMLElement;
    expect(confirmation.textContent).toContain('Application submitted');
    expect(confirmation.textContent).toContain('Backend Developer');
    expect(confirmation.textContent).toContain('Applied 2026-11-16');
    expect(confirmation.textContent?.replace(/\s+/g, ' ')).toContain('Application status: Applied');
    expect(confirmation.querySelector('a')?.getAttribute('href')).toBe('/applications');
    expect(page().querySelector('form')).toBeNull(); // the apply form is replaced by the applied state
  });

  it('US-05 AT-3: a logged-out user trying to apply is taken to the login page', async () => {
    user = null;
    await openPage();

    expect(page().querySelector('form')).toBeNull(); // no way to submit without an account
    (page().querySelector('.apply-card a') as HTMLAnchorElement).click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('US-05 AT-4: applying to a job that was removed is blocked with an error, and no confirmation is shown', async () => {
    await openPage();

    await pickResumeAndSubmit(11);
    http.expectOne(`${API_BASE}/applications`).flush({ error: 'Job not found' }, { status: 404, statusText: 'Not Found' });
    await render();

    expect(page().querySelector('.alert-error')?.textContent).toContain('Job not found');
    expect(page().querySelector('.apply-confirmation')).toBeNull();
    expect(page().textContent).not.toContain('Application submitted');
  });
});
