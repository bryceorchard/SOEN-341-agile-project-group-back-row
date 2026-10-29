import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { PostingApplicants } from './posting-applicants.component';
import { API_BASE } from './auth.service';

const JOB_ID = 7;
const LIST_URL = `${API_BASE}/jobs/${JOB_ID}/applications`;

const ADA = {
  id: 1,
  applicantEmail: 'ada@test.com',
  applicantName: 'Ada Lovelace',
  applicantHeadline: 'Backend dev',
  resumeId: null,
  resumeFilename: null,
  status: 'Applied',
  appliedAt: '2026-10-01T12:00:00Z',
};

const GRACE = {
  ...ADA,
  id: 2,
  applicantEmail: 'grace@test.com',
  applicantName: 'Grace Hopper',
  status: 'Interview',
};

describe('PostingApplicants', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  // Opens the applicants page for job 7 and answers its first "load applicants" request.
  async function openPage(applicants = [ADA, GRACE]) {
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/recruiter/postings/${JOB_ID}/applicants`, PostingApplicants);
    http = TestBed.inject(HttpTestingController);

    const req = http.expectOne((r) => r.url === LIST_URL);
    expect(req.request.method).toBe('GET');
    req.flush({ applications: applicants });
    await render();
  }

  async function render() {
    harness.detectChanges();
    await harness.fixture.whenStable();
  }

  function page(): HTMLElement {
    return harness.routeNativeElement as HTMLElement;
  }

  function names(): string[] {
    return Array.from(page().querySelectorAll('.applicant-row h2')).map((el) => el.textContent!.trim());
  }

  function firstDropdown(): HTMLSelectElement {
    return page().querySelector('.applicant-row select') as HTMLSelectElement;
  }

  // Simulates a recruiter picking a new status in the first applicant's dropdown.
  async function chooseStatus(status: string) {
    const select = firstDropdown();
    select.value = status;
    select.dispatchEvent(new Event('change'));
    await render();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'recruiter/postings/:id/applicants', component: PostingApplicants }]),
      ],
    }).compileComponents();
  });

  // Fails the test if the page made a request we didn't expect (or skipped one we did).
  afterEach(() => http.verify());

  it('loads and shows the applicants for the posting', async () => {
    await openPage();

    expect(names()).toEqual(['Ada Lovelace', 'Grace Hopper']);
  });

  it('shows an empty state when there are no applicants', async () => {
    await openPage([]);

    expect(names()).toEqual([]);
    expect(page().textContent).toContain('No applicants yet.');
  });

  it('filters applicants by status', async () => {
    await openPage();

    const interviewButton = Array.from(page().querySelectorAll<HTMLButtonElement>('.status-filter button')).find(
      (b) => b.textContent!.trim() === 'Interview',
    )!;
    interviewButton.click();

    const req = http.expectOne((r) => r.url === LIST_URL);
    expect(req.request.params.get('status')).toBe('Interview');
    req.flush({ applications: [GRACE] });
    await render();

    expect(names()).toEqual(['Grace Hopper']);
  });

  it('saves a status change and reloads the list', async () => {
    await openPage();

    await chooseStatus('Interview');

    const patch = http.expectOne(`${API_BASE}/applications/${ADA.id}`);
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({ status: 'Interview' });
    patch.flush({});

    // After a successful save, the page reloads the list from the server.
    http.expectOne((r) => r.url === LIST_URL).flush({ applications: [{ ...ADA, status: 'Interview' }, GRACE] });
    await render();

    expect(firstDropdown().value).toBe('Interview');
    expect(page().querySelector('.alert-error')).toBeNull();
  });

  it('reverts the dropdown and shows an error when saving the status fails', async () => {
    await openPage();

    await chooseStatus('Rejected');

    http
      .expectOne(`${API_BASE}/applications/${ADA.id}`)
      .flush({ error: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
    await render();

    // Back to the status that is actually saved, and the user is told why.
    expect(firstDropdown().value).toBe('Applied');
    expect(page().querySelector('.alert-error')?.textContent).toContain('Server error');
    // No reload happens after a failure (http.verify() in afterEach checks this).
  });
});
