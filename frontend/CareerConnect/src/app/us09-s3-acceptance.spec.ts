import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CandidateReview, PostingApplicants, isInvalidRange } from './posting-applicants.component';
import { API_BASE } from './auth.service';

// Acceptance tests for US-09 Sprint 3 (#143), frontend side (#133):
// date range filter and candidate review panel on /recruiter/postings/:id/applicants.

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
  appliedAt: '2026-11-01 09:00:00',
};
const GRACE = { ...ADA, id: 2, applicantEmail: 'grace@test.com', applicantName: 'Grace Hopper', resumeId: null, resumeFilename: null, status: 'Interview', appliedAt: '2026-11-05 15:00:00' };

const ADA_REVIEW: CandidateReview = {
  application: { id: 1, jobId: JOB_ID, status: 'Applied', appliedAt: '2026-11-01 09:00:00', updatedAt: '2026-11-01 09:00:00', resumeId: 5, resumeFilename: 'ada-cv.pdf' },
  candidate: { email: 'ada@test.com', fullName: 'Ada Lovelace', headline: 'Backend dev', location: 'London', phone: '555-0100', bio: 'Engines.' },
  otherApplications: [{ id: 9, jobId: 8, jobTitle: 'QA Analyst', jobStatus: 'open', status: 'Interview', appliedAt: '2026-11-08 10:00:00' }],
};

describe('isInvalidRange', () => {
  it('is true only when both dates are set and "from" is after "to"', () => {
    expect(isInvalidRange('2026-11-10', '2026-11-01')).toBe(true);
    expect(isInvalidRange('2026-11-01', '2026-11-10')).toBe(false);
    expect(isInvalidRange('2026-11-05', '2026-11-05')).toBe(false); // same day is fine
    expect(isInvalidRange('2026-11-05', '')).toBe(false);
    expect(isInvalidRange('', '2026-11-05')).toBe(false);
  });
});

describe('US-09 Sprint 3 acceptance', () => {
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

  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });

  // Opens the page (optionally with filters in the URL) and returns the first list request's filters.
  async function openPage(query = '', applicants = [ADA, GRACE]) {
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/recruiter/postings/${JOB_ID}/applicants${query}`, PostingApplicants);
    http = TestBed.inject(HttpTestingController);
    http.expectOne(`${API_BASE}/jobs/${JOB_ID}`).flush({ job: JOB });
    return answerList(applicants);
  }

  async function answerList(applicants: object[]) {
    const req = http.expectOne((r) => r.url === LIST_URL);
    req.flush({ applications: applicants });
    await render();
    return filtersOf(req);
  }

  const filtersOf = (req: TestRequest) =>
    Object.fromEntries(req.request.params.keys().map((k) => [k, req.request.params.get(k)]));

  async function render() {
    harness.detectChanges();
    await harness.fixture.whenStable();
  }

  const page = () => harness.routeNativeElement as HTMLElement;
  const names = () => Array.from(page().querySelectorAll('.applicant-row h2')).map((h) => h.textContent!.trim());
  const button = (text: string, root: ParentNode = page()) =>
    Array.from(root.querySelectorAll('button')).find((b) => b.textContent!.trim() === text) as HTMLButtonElement;
  const urlQuery = () => {
    const router = TestBed.inject(Router);
    return router.parseUrl(router.url).queryParams;
  };

  async function setDates(from: string, to: string) {
    for (const [name, value] of [['from', from], ['to', to]]) {
      const input = page().querySelector(`.date-filter input[name="${name}"]`) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    await render();
    button('Apply dates').click();
    await render();
  }

  // ---- Date filter (AT-6, AT-7) ----

  it('US-09 AT-6: applying a from/to range together with a status filter loads only matching applicants and keeps all filters in the URL', async () => {
    await openPage();

    button('Interview').click();
    expect(await answerList([GRACE])).toEqual({ status: 'Interview' });

    await setDates('2026-11-01', '2026-11-05');
    expect(await answerList([GRACE])).toEqual({ status: 'Interview', from: '2026-11-01', to: '2026-11-05' });
    expect(names()).toEqual(['Grace Hopper']);
    expect(urlQuery()).toEqual({ status: 'Interview', from: '2026-11-01', to: '2026-11-05' });
  });

  it('US-09 AT-6: reloading the page with filters in the URL restores them and loads the filtered list', async () => {
    const sent = await openPage('?status=Applied&from=2026-11-01&to=2026-11-03', [ADA]);

    expect(sent).toEqual({ status: 'Applied', from: '2026-11-01', to: '2026-11-03' });
    expect((page().querySelector('.date-filter input[name="from"]') as HTMLInputElement).value).toBe('2026-11-01');
    expect((page().querySelector('.date-filter input[name="to"]') as HTMLInputElement).value).toBe('2026-11-03');
    expect(page().querySelector('.status-filter .btn-primary')?.textContent?.trim()).toBe('Applied');
    expect(names()).toEqual(['Ada Lovelace']);
  });

  it('US-09 AT-6: when no applicant matches the filters, an empty state is shown', async () => {
    await openPage();

    await setDates('2026-12-01', '2026-12-31');
    await answerList([]);

    expect(names()).toEqual([]);
    expect(page().querySelector('.empty-state')?.textContent?.trim()).toBe('No applicants match these filters.');
  });

  it('US-09 AT-6: clearing the dates removes them from the request and the URL', async () => {
    await openPage('?from=2026-11-01&to=2026-11-03', [ADA]);

    button('Clear dates').click();
    expect(await answerList([ADA, GRACE])).toEqual({});
    expect(urlQuery()).toEqual({});
  });

  it('US-09 AT-7: a "from" date after the "to" date shows a warning and leaves the list and URL unchanged', async () => {
    await openPage();

    await setDates('2026-11-10', '2026-11-01');

    // No new list request (http.verify() in afterEach checks this).
    expect(page().querySelector('.date-error')?.textContent).toContain('"From" must be on or before "To"');
    expect(names()).toEqual(['Ada Lovelace', 'Grace Hopper']);
    expect(urlQuery()).toEqual({});

    // Fixing the range clears the warning and applies it.
    await setDates('2026-11-01', '2026-11-10');
    expect(await answerList([ADA, GRACE])).toEqual({ from: '2026-11-01', to: '2026-11-10' });
    expect(page().querySelector('.date-error')).toBeNull();
  });

  it('US-09 AT-7: an invalid range in the URL is not applied and the recruiter is warned', async () => {
    const sent = await openPage('?from=2026-11-10&to=2026-11-01');

    expect(sent).toEqual({});
    expect(page().querySelector('.date-error')?.textContent).toContain('"From" must be on or before "To"');
  });

  // ---- Candidate review panel (AT-8, AT-9) ----

  async function openReviewFor(row: number, review: CandidateReview | null, error?: { status: number; body: object }) {
    const rowEl = page().querySelectorAll('.applicant-row')[row];
    button('Review', rowEl).click();
    const req = http.expectOne(`${LIST_URL}/${row === 0 ? ADA.id : GRACE.id}`);
    expect(req.request.method).toBe('GET');
    if (error) req.flush(error.body, { status: error.status, statusText: 'Error' });
    else req.flush(review);
    await render();
  }

  it("US-09 AT-8: the review panel shows the candidate's full profile, the applied resume and their other applications", async () => {
    await openPage();
    await openReviewFor(0, ADA_REVIEW);

    const panel = page().querySelector('.review-panel') as HTMLElement;
    const text = panel.textContent!.replace(/\s+/g, ' ');
    expect(panel.querySelector('h2')?.textContent?.trim()).toBe('Ada Lovelace');
    expect(text).toContain('ada@test.com · Backend dev');
    expect(text).toContain('London');
    expect(text).toContain('555-0100');
    expect(text).toContain('Engines.');
    expect(text).toContain('ada-cv.pdf');
    expect(button('View resume', panel)).toBeTruthy();
    const other = panel.querySelector('.review-others li') as HTMLElement;
    expect(other.textContent!.replace(/\s+/g, ' ')).toContain('QA Analyst · Interview · Applied 2026-11-08');
    expect(other.querySelector('a')?.getAttribute('href')).toBe('/recruiter/postings/8/applicants');
    expect((panel.querySelector('select.review-status') as HTMLSelectElement).value).toBe('Applied');
  });

  it('US-09 AT-8: "View resume" in the panel opens the applied resume', async () => {
    await openPage();
    await openReviewFor(0, ADA_REVIEW);
    const tab = { document: document.implementation.createHTMLDocument(''), close: vi.fn(), addEventListener: vi.fn() };
    vi.spyOn(window, 'open').mockReturnValue(tab as unknown as Window);
    URL.createObjectURL = vi.fn(() => 'blob:ada');
    URL.revokeObjectURL = vi.fn();

    button('View resume', page().querySelector('.review-panel')!).click();
    http.expectOne(`${API_BASE}/resumes/5/file`).flush(new Blob(['%PDF-1.4'], { type: 'application/pdf' }));

    expect(tab.document.title).toBe('ada-cv.pdf');
  });

  it('US-09 AT-8: changing the status inside the panel saves it and updates both the panel and the list', async () => {
    await openPage();
    await openReviewFor(0, ADA_REVIEW);

    const select = page().querySelector('.review-panel select.review-status') as HTMLSelectElement;
    select.value = 'Interview';
    select.dispatchEvent(new Event('change'));
    await render();

    const patch = http.expectOne(`${API_BASE}/applications/${ADA.id}`);
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({ status: 'Interview' });
    patch.flush({});
    await answerList([{ ...ADA, status: 'Interview' }, GRACE]);

    expect((page().querySelector('.review-panel select.review-status') as HTMLSelectElement).value).toBe('Interview');
    expect((page().querySelector('.applicant-row select') as HTMLSelectElement).value).toBe('Interview');
  });

  it('US-09 AT-8: a candidate with no resume shows "No resume attached" and Close hides the panel', async () => {
    await openPage();
    await openReviewFor(1, {
      ...ADA_REVIEW,
      application: { ...ADA_REVIEW.application, id: 2, resumeId: null, resumeFilename: null },
      candidate: { ...ADA_REVIEW.candidate, email: 'grace@test.com', fullName: null, location: null, phone: null, bio: null },
      otherApplications: [],
    });

    const panel = page().querySelector('.review-panel') as HTMLElement;
    expect(panel.querySelector('h2')?.textContent?.trim()).toBe('grace@test.com');
    expect(panel.textContent).toContain('No resume attached');
    expect(panel.textContent).toContain('No other applications to your postings.');

    button('Close', panel).click();
    await render();
    expect(page().querySelector('.review-panel')).toBeNull();
  });

  it('US-09 AT-9: if the server refuses the review, no candidate data is shown, only an error', async () => {
    await openPage();
    await openReviewFor(0, null, { status: 404, body: { error: 'Job not found' } });

    expect(page().querySelector('.review-panel')).toBeNull();
    expect(page().textContent).toContain('Job not found');
    expect(page().textContent).not.toContain('555-0100');
  });
});
