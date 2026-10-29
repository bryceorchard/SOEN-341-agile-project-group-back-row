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

  it('ignores applications to other jobs', async () => {
    await openPage([{ jobId: JOB_ID + 1, status: 'Interview' }]);

    expect(page().querySelector('form')).not.toBeNull();
  });
});
