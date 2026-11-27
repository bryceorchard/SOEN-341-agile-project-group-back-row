import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Analytics } from './analytics.component';
import { ApplicationStats } from '../application-stats.model';
import { API_BASE } from '../auth.service';

const STATS: ApplicationStats = {
  total: 4,
  byStatus: [
    { status: 'Applied', count: 1, percent: 25 },
    { status: 'Under Review', count: 0, percent: 0 },
    { status: 'Interview', count: 1, percent: 25 },
    { status: 'Offered', count: 0, percent: 0 },
    { status: 'Rejected', count: 2, percent: 50 },
  ],
  submittedLast7Days: 1,
  submittedLast30Days: 3,
  responded: 3,
  responseRate: 75,
  perWeek: [
    { weekStart: '2026-11-16', count: 1 },
    { weekStart: '2026-11-23', count: 3 },
  ],
  postings: { open: 3, closed: 1 },
};

const APPS = [
  { id: 1, jobTitle: 'Backend Developer', status: 'Applied', appliedAt: '2026-11-24 10:00:00' },
  { id: 2, jobTitle: 'QA Analyst', status: 'Interview', appliedAt: '2026-11-17 10:00:00' },
];

describe('Analytics', () => {
  let fixture: ComponentFixture<Analytics>;
  let http: HttpTestingController;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Analytics],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    fixture = TestBed.createComponent(Analytics);
    http = TestBed.inject(HttpTestingController);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  function load(stats: ApplicationStats, apps = APPS) {
    http.expectOne(`${API_BASE}/applications/stats`).flush({ stats });
    http.expectOne(`${API_BASE}/applications`).flush({ applications: apps });
    fixture.detectChanges();
  }

  it('shows the activity metrics, including open postings (AC3)', () => {
    load(STATS);
    const tiles = [...el.querySelectorAll('app-metric-tile')].map((t) => t.textContent);
    expect(tiles.some((t) => t!.includes('Total applications') && t!.includes('4'))).toBe(true);
    expect(tiles.some((t) => t!.includes('Response rate') && t!.includes('75%'))).toBe(true);
    expect(tiles.some((t) => t!.includes('Postings still open') && t!.includes('3') && t!.includes('1 closed'))).toBe(true);
  });

  it('breaks applications down by status with count and percentage (AC1)', () => {
    load(STATS);
    const rows = [...el.querySelectorAll('.status-table tbody tr')].map((r) => [...r.children].map((c) => c.textContent));
    expect(rows).toEqual([
      ['Applied', '1', '25%'],
      ['Under Review', '0', '0%'],
      ['Interview', '1', '25%'],
      ['Offered', '0', '0%'],
      ['Rejected', '2', '50%'],
    ]);
  });

  it('loads an application history only when its row is expanded (AC4)', () => {
    load(STATS);
    const rows = el.querySelectorAll<HTMLDetailsElement>('details.history-app');
    expect(rows.length).toBe(2);
    expect(el.querySelector('app-application-history')).toBeNull();

    rows[1].open = true;
    rows[1].dispatchEvent(new Event('toggle'));
    fixture.detectChanges();

    http.expectOne(`${API_BASE}/applications/2/history`).flush({
      history: [{ status: 'Interview', changedAt: '2026-11-20 10:00:00', changedBy: 'recruiter' }],
    });
    fixture.detectChanges();
    expect(rows[1].querySelector('.history-list')?.textContent).toContain('Interview');
  });

  it('shows the empty state with a link to the job search when there are no applications (AC5)', () => {
    load({ ...STATS, total: 0 }, []);
    expect(el.textContent).toContain("You haven't applied to any jobs yet.");
    expect(el.querySelector('a[href="/jobs"]')).not.toBeNull();
  });

  it('shows an error when the stats cannot be loaded', () => {
    http.expectOne(`${API_BASE}/applications/stats`).flush({}, { status: 500, statusText: 'Server Error' });
    http.expectOne(`${API_BASE}/applications`).flush({ applications: [] });
    fixture.detectChanges();
    expect(el.textContent).toContain('Could not load analytics.');
  });
});
