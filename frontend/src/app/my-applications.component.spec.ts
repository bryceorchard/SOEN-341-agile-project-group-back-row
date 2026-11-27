import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Application, MyApplications, countByStatus } from './my-applications.component';
import { API_BASE } from './auth.service';

function app(overrides: Partial<Application>): Application {
  return {
    id: 1,
    jobId: 10,
    jobTitle: 'Backend Developer',
    jobLocation: 'Montreal, QC',
    jobCategory: 'Engineering',
    jobDeadline: '2026-12-31',
    jobStatus: 'open',
    resumeId: 4,
    resumeFilename: 'resume.pdf',
    status: 'Applied',
    appliedAt: '2026-10-20 14:00:00',
    updatedAt: '2026-10-25 09:30:00',
    ...overrides,
  };
}

const APPS: Application[] = [
  app({ id: 1, jobId: 10, status: 'Applied' }),
  app({ id: 2, jobId: 11, jobTitle: 'QA Analyst', status: 'Interview' }),
  app({ id: 3, jobId: 12, jobTitle: 'Data Analyst', status: 'Rejected', jobStatus: 'closed', resumeFilename: null }),
  app({ id: 4, jobId: 13, jobTitle: 'Designer', status: 'Rejected' }),
];

describe('countByStatus', () => {
  it('counts every status, including the ones with no applications', () => {
    expect(countByStatus(APPS)).toEqual({
      '': 4,
      Applied: 1,
      'Under Review': 0,
      Interview: 1,
      Offered: 0,
      Rejected: 2,
    });
  });
});

describe('MyApplications', () => {
  let fixture: ComponentFixture<MyApplications>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyApplications],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(MyApplications);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  async function load(body: object, opts?: { status: number; statusText: string }) {
    http.expectOne(`${API_BASE}/applications`).flush(body, opts);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function el(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function rows(): HTMLElement[] {
    return Array.from(el().querySelectorAll('.application-row'));
  }

  function filterButton(label: string): HTMLButtonElement {
    return Array.from(el().querySelectorAll('.status-filter button')).find((b) =>
      b.textContent!.trim().startsWith(label),
    ) as HTMLButtonElement;
  }

  it('shows each application with its job details, dates, resume and status badge', async () => {
    await load({ applications: [APPS[0]] });

    const row = rows()[0].textContent!.replace(/\s+/g, ' ');
    expect(row).toContain('Backend Developer');
    expect(row).toContain('Montreal, QC · Engineering');
    expect(row).toContain('Deadline 2026-12-31');
    expect(row).toContain('Applied 2026-10-20');
    expect(row).toContain('Last updated 2026-10-25');
    expect(row).toContain('Resume: resume.pdf');
    expect(rows()[0].querySelector('.badge-applied')?.textContent?.trim()).toBe('Applied');
    expect(rows()[0].getAttribute('href')).toBe('/jobs/10');
  });

  it('shows a "Posting closed" badge only on applications to closed postings', async () => {
    await load({ applications: APPS });

    const closed = rows().filter((r) => r.textContent!.includes('Posting closed'));
    expect(closed.length).toBe(1);
    expect(closed[0].textContent).toContain('Data Analyst');
  });

  it('shows the count for each status on the filter buttons', async () => {
    await load({ applications: APPS });

    expect(filterButton('All').textContent!.trim()).toBe('All (4)');
    expect(filterButton('Applied').textContent!.trim()).toBe('Applied (1)');
    expect(filterButton('Interview').textContent!.trim()).toBe('Interview (1)');
    expect(filterButton('Rejected').textContent!.trim()).toBe('Rejected (2)');
    expect(filterButton('Offered').textContent!.trim()).toBe('Offered (0)');
  });

  it('filters by status and shows the total for that status at the top', async () => {
    await load({ applications: APPS });

    filterButton('Rejected').click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(rows().map((r) => r.querySelector('h2')!.textContent)).toEqual(['Data Analyst', 'Designer']);
    expect(el().querySelector('.filter-summary')?.textContent?.trim()).toBe('2 Rejected applications');
    // The counts don't change when a filter is picked.
    expect(filterButton('All').textContent!.trim()).toBe('All (4)');
  });

  it('shows an error instead of "No applications yet" when the list fails to load', async () => {
    await load({ error: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(el().querySelector('.alert-error')?.textContent).toContain('boom');
    expect(el().textContent).not.toContain('No applications yet');
  });

  it('shows the empty state with a link to the job search when there are no applications', async () => {
    await load({ applications: [] });

    expect(el().textContent).toContain('No applications yet');
    expect(el().querySelector('.empty-state a')?.getAttribute('href')).toBe('/jobs');
  });
});
