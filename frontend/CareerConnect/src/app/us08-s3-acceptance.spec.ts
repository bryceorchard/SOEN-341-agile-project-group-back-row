import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Posting, RecruiterPostings } from './recruiter-postings.component';
import { PostingApplicants } from './posting-applicants.component';
import { API_BASE } from './auth.service';

// Acceptance tests for US-08 Sprint 3 (#142): archive postings + recruiter dashboard (frontend).
// AT-1 to AT-4 are in us08-acceptance.spec.ts (#94).

const posting = (fields: Partial<Posting>): Posting => ({
  id: 10,
  title: 'Backend Developer',
  description: 'Work on the API',
  location: 'Montreal',
  category: 'Engineering',
  deadline: '2026-12-31',
  status: 'open',
  applicationCount: 5,
  statusCounts: { Applied: 3, 'Under Review': 0, Interview: 2, Offered: 0, Rejected: 0 },
  archivedAt: null,
  ...fields,
});

describe('US-08 Sprint 3 acceptance: My postings dashboard', () => {
  let fixture: ComponentFixture<RecruiterPostings>;
  let http: HttpTestingController;
  let confirmAnswer: boolean;
  let confirm: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    confirmAnswer = true;
    confirm = vi.fn(() => confirmAnswer);
    vi.stubGlobal('confirm', confirm);
    await TestBed.configureTestingModule({
      imports: [RecruiterPostings],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RecruiterPostings);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
    vi.unstubAllGlobals();
  });

  async function answer(view: 'active' | 'archived', jobs: Posting[]) {
    http.expectOne(`${API_BASE}/jobs/mine?view=${view}`).flush({ jobs });
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const button = (text: string) =>
    Array.from(el().querySelectorAll('button')).find((b) => b.textContent!.trim() === text) as HTMLButtonElement;
  const titles = () => Array.from(el().querySelectorAll('.posting-card h2')).map((h) => h.textContent!.trim());

  it('US-08 AT-5: clicking Archive and accepting the confirmation archives the posting and it leaves the active view', async () => {
    await answer('active', [posting({})]);

    button('Archive').click();
    expect(confirm).toHaveBeenCalled();
    const archive = http.expectOne(`${API_BASE}/jobs/10/archive`);
    expect(archive.request.method).toBe('PATCH');
    archive.flush({ job: posting({ archivedAt: '2026-11-16 20:00:00' }) });

    await answer('active', []);
    expect(titles()).toEqual([]);

    button('Archived').click();
    await answer('archived', [posting({ archivedAt: '2026-11-16 20:00:00' })]);
    expect(titles()).toEqual(['Backend Developer']);
  });

  it('US-08 AT-5: declining the archive confirmation leaves the posting as it is', async () => {
    await answer('active', [posting({})]);
    confirmAnswer = false;

    button('Archive').click();

    // No archive request (http.verify() checks this) and the posting is still listed.
    expect(titles()).toEqual(['Backend Developer']);
  });

  it('US-08 AT-6: clicking Restore and accepting the confirmation brings the posting back to the active view with its deadline and applications', async () => {
    await answer('active', []);
    button('Archived').click();
    await answer('archived', [posting({ archivedAt: '2026-11-16 20:00:00' })]);

    button('Restore').click();
    expect(confirm).toHaveBeenCalled();
    const restore = http.expectOne(`${API_BASE}/jobs/10/unarchive`);
    expect(restore.request.method).toBe('PATCH');
    restore.flush({ job: posting({}) });
    await answer('archived', []);
    expect(titles()).toEqual([]);

    button('Active').click();
    await answer('active', [posting({})]);
    const card = el().querySelector('.posting-card')!.textContent!.replace(/\s+/g, ' ');
    expect(titles()).toEqual(['Backend Developer']);
    expect(card).toContain('Deadline: Dec 31, 2026');
    expect(card).toContain('Total Applications: 5');
  });

  it('US-08 AT-7: each posting card shows its status, deadline and application counts by status, with links pre-filtered to that status', async () => {
    await answer('active', [posting({}), posting({ id: 11, title: 'QA Analyst', status: 'closed', deadline: '2026-12-15', applicationCount: 0, statusCounts: {} })]);

    const [open, closed] = Array.from(el().querySelectorAll('.posting-card')) as HTMLElement[];
    expect(open.querySelector('.badge')!.textContent!.trim()).toBe('open');
    expect(open.textContent).toContain('Deadline: Dec 31, 2026');
    expect(open.textContent).toContain('Total Applications: 5');
    expect(closed.querySelector('.badge')!.textContent!.trim()).toBe('closed');
    expect(closed.textContent).toContain('Deadline: Dec 15, 2026');

    const countLinks = Array.from(open.querySelectorAll('.status-counts a')) as HTMLAnchorElement[];
    expect(countLinks.map((a) => a.textContent!.trim())).toEqual(['Applied: 3', 'Interview: 2']); // statuses with 0 are hidden
    expect(countLinks[1].getAttribute('href')).toBe('/recruiter/postings/10/applicants?status=Interview');
  });
});

describe('US-08 Sprint 3 acceptance: following a status count', () => {
  it('US-08 AT-7: opening the applicant list from a status count loads only applicants with that status', async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'recruiter/postings/:id/applicants', component: PostingApplicants }]),
      ],
    }).compileComponents();
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/recruiter/postings/10/applicants?status=Interview', PostingApplicants);
    const http = TestBed.inject(HttpTestingController);

    http.expectOne(`${API_BASE}/jobs/10`).flush({ job: { id: 10, title: 'Backend Developer', status: 'open' } });
    const list = http.expectOne((r) => r.url === `${API_BASE}/jobs/10/applications`);
    expect(list.request.params.get('status')).toBe('Interview');
    list.flush({ applications: [] });
    harness.detectChanges();
    await harness.fixture.whenStable();

    const active = (harness.routeNativeElement as HTMLElement).querySelector('.status-filter .btn-primary');
    expect(active?.textContent?.trim()).toBe('Interview'); // the Interview filter is highlighted
    http.verify();
  });
});
