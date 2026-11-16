import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { PostingApplicants } from './posting-applicants.component';
import { API_BASE } from './auth.service';

// Acceptance tests for US-09 (#95): recruiter views and filters applications (Applicants page).
// The applicant fields, the status filter (AT-3) and error handling are also covered in
// posting-applicants.component.spec.ts; AT-4 and AT-5 are enforced by the backend.

const JOB_ID = 7;
const LIST_URL = `${API_BASE}/jobs/${JOB_ID}/applications`;
const JOB = { id: JOB_ID, title: 'Backend Developer', description: 'API work', location: null, category: null, deadline: null, status: 'open', createdAt: '' };

const ADA = {
  id: 1,
  applicantEmail: 'ada@test.com',
  applicantName: 'Ada Lovelace',
  applicantHeadline: 'Backend dev',
  resumeId: 5,
  resumeFilename: 'ada-cv.pdf',
  status: 'Applied',
  appliedAt: '2026-11-01 10:00:00',
};
const GRACE = { ...ADA, id: 2, applicantEmail: 'grace@test.com', applicantName: 'Grace Hopper', resumeFilename: 'grace-cv.pdf', status: 'Interview' };

describe('US-09 acceptance', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'recruiter/postings/:id/applicants', component: PostingApplicants }]),
      ],
    }).compileComponents();
  });

  afterEach(() => http.verify());

  async function openPage(applicants = [ADA, GRACE]) {
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/recruiter/postings/${JOB_ID}/applicants`, PostingApplicants);
    http = TestBed.inject(HttpTestingController);
    http.expectOne(`${API_BASE}/jobs/${JOB_ID}`).flush({ job: JOB });
    http.expectOne((r) => r.url === LIST_URL).flush({ applications: applicants });
    await render();
  }

  async function render() {
    harness.detectChanges();
    await harness.fixture.whenStable();
  }

  const page = () => harness.routeNativeElement as HTMLElement;
  const rows = () => Array.from(page().querySelectorAll('.applicant-row')) as HTMLElement[];
  const statusOf = (row: HTMLElement) => (row.querySelector('select') as HTMLSelectElement).value;

  it("US-09 AT-1: each applicant row shows the email, name, headline, applied date, current status and resume filename", async () => {
    await openPage();

    const [ada, grace] = rows();
    const adaText = ada.textContent!.replace(/\s+/g, ' ');
    expect(adaText).toContain('Ada Lovelace');
    expect(adaText).toContain('ada@test.com · Backend dev');
    expect(adaText).toContain('Applied 2026-11-01');
    expect(adaText).toContain('ada-cv.pdf');
    expect(statusOf(ada)).toBe('Applied');
    expect(grace.textContent).toContain('grace-cv.pdf');
    expect(statusOf(grace)).toBe('Interview');
  });

  it('US-09 AT-2: changing a status to "Under Review" updates the row in place and saves it', async () => {
    await openPage();

    const select = rows()[0].querySelector('select') as HTMLSelectElement;
    select.value = 'Under Review';
    select.dispatchEvent(new Event('change'));
    await render();
    expect(statusOf(rows()[0])).toBe('Under Review'); // shown right away, before the server answers

    const patch = http.expectOne(`${API_BASE}/applications/${ADA.id}`);
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({ status: 'Under Review' });
    patch.flush({ application: { ...ADA, status: 'Under Review' } });
    http.expectOne((r) => r.url === LIST_URL).flush({ applications: [{ ...ADA, status: 'Under Review' }, GRACE] });
    await render();

    expect(statusOf(rows()[0])).toBe('Under Review');
    expect(statusOf(rows()[1])).toBe('Interview'); // the other applicant is untouched
    expect(page().querySelector('.alert-error')).toBeNull();
  });
});
