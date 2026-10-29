import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { JobDetail } from './job-detail.component';
import { API_BASE, AuthService } from './auth.service';

const JOB_ID = 7;
const JOB = {
  id: JOB_ID,
  title: 'Backend Developer',
  description: 'Work on the API',
  location: 'Montreal',
  category: 'Engineering',
  deadline: '2026-12-31',
  createdAt: '2026-10-01T12:00:00Z',
};

const SEEKER = { id: 1, email: 'seeker@test.com', role: 'job_seeker' as const, createdAt: '' };

describe('JobDetail', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  async function openPage(applications: Array<{ jobId: number; status: string }> = []) {
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/jobs/${JOB_ID}`, JobDetail);
    http = TestBed.inject(HttpTestingController);

    http.expectOne(`${API_BASE}/jobs/${JOB_ID}`).flush({ job: JOB });
    http.expectOne(`${API_BASE}/resumes`).flush({ resumes: [] });
    http.expectOne(`${API_BASE}/applications`).flush({ applications });
    await render();
  }

  async function render() {
    harness.detectChanges();
    await harness.fixture.whenStable();
  }

  function page(): HTMLElement {
    return harness.routeNativeElement as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'jobs/:id', component: JobDetail }]),
        { provide: AuthService, useValue: { currentUser: () => SEEKER } },
      ],
    }).compileComponents();
  });

  afterEach(() => http.verify());

  it('shows the apply form when the job seeker has not applied yet', async () => {
    await openPage([]);

    expect(page().querySelector('form')).not.toBeNull();
    expect(page().textContent).not.toContain('Application status');
  });

  it('shows the application status instead of the apply form when already applied', async () => {
    await openPage([{ jobId: JOB_ID, status: 'Interview' }]);

    expect(page().querySelector('form')).toBeNull();
    expect(page().textContent).toContain('Application status');
    expect(page().textContent).toContain('Interview');
  });

  it('shows a confirmation with the job title, date, status and a link after applying', async () => {
    await openPage([]);

    page().querySelector('form')!.dispatchEvent(new Event('submit'));
    const req = http.expectOne(`${API_BASE}/applications`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ jobId: JOB_ID, resumeId: undefined });
    req.flush(
      { application: { id: 3, jobId: JOB_ID, status: 'Applied', appliedAt: '2026-10-29 18:30:00' } },
      { status: 201, statusText: 'Created' },
    );
    await render();

    const text = page().textContent ?? '';
    expect(page().querySelector('form')).toBeNull();
    expect(text).toContain('Application submitted');
    expect(text).toContain('Backend Developer');
    expect(text).toContain('Applied 2026-10-29');
    expect(text).toContain('Application status');
    const link = page().querySelector('.apply-confirmation a');
    expect(link?.getAttribute('href')).toBe('/applications');
  });

  it('shows an "already applied" message on a 409 and no confirmation', async () => {
    await openPage([]);

    page().querySelector('form')!.dispatchEvent(new Event('submit'));
    http
      .expectOne(`${API_BASE}/applications`)
      .flush({ error: 'You already applied to this job' }, { status: 409, statusText: 'Conflict' });
    await render();

    const text = page().textContent ?? '';
    expect(text).toContain("You've already applied to this job");
    expect(text).not.toContain('Application submitted');
    expect(page().querySelector('form')).not.toBeNull();
  });

  it('ignores applications to other jobs', async () => {
    await openPage([{ jobId: JOB_ID + 1, status: 'Interview' }]);

    expect(page().querySelector('form')).not.toBeNull();
  });
});
