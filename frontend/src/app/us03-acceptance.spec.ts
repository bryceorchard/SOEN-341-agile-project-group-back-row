import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { API_BASE } from './auth.service';
import { Component } from '@angular/core';
import { Jobs, JobSummary } from './jobs.component';

// An empty page to navigate away to, so coming back to /jobs builds the Jobs page from scratch (like a reload).
@Component({ template: '' })
class Elsewhere {}

// Acceptance tests for US-03 (#90): search and filter job postings (Jobs page).

const job = (id: number, fields: Partial<JobSummary>): JobSummary => ({
  id,
  title: 'Job',
  description: 'Description',
  location: null,
  category: null,
  deadline: null,
  status: 'open',
  createdAt: '',
  ...fields,
});

// Newest first, as the backend returns them.
const NEWEST = job(2, { title: 'Product Designer', location: 'Montreal', category: 'Design', deadline: '2026-12-15' });
const OLDER = job(1, { title: 'Backend Developer', location: 'Toronto', category: 'Engineering', deadline: '2026-12-01' });

describe('US-03 acceptance', () => {
  let harness: RouterTestingHarness | undefined;
  let http: HttpTestingController;

  beforeEach(async () => {
    harness = undefined;
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: 'jobs', component: Jobs }, { path: 'elsewhere', component: Elsewhere }])],
    }).compileComponents();
  });

  afterEach(() => http.verify());

  // Opens the Jobs page at `url` and answers its startup requests.
  async function open(url: string, jobs: JobSummary[]) {
    harness ??= await RouterTestingHarness.create();
    await harness.navigateByUrl(url, Jobs);
    http = TestBed.inject(HttpTestingController);
    http.expectOne(`${API_BASE}/jobs/categories`).flush({ categories: ['Design', 'Engineering'] });
    return answerSearch(jobs);
  }

  // Answers the pending job search and returns the filters it was sent with.
  async function answerSearch(jobs: JobSummary[]) {
    const req = http.expectOne((r) => r.url === `${API_BASE}/jobs`);
    const sent = Object.fromEntries(req.request.params.keys().map((k) => [k, req.request.params.get(k)]));
    req.flush({ jobs });
    harness!.detectChanges();
    await harness!.fixture.whenStable();
    return sent;
  }

  const page = () => harness!.routeNativeElement as HTMLElement;
  const cards = () => Array.from(page().querySelectorAll('.job-card')) as HTMLElement[];
  const text = (el: Element | null) => el?.textContent?.trim() ?? '';

  function setField(selector: string, value: string, event: 'input' | 'change') {
    const field = page().querySelector(selector) as HTMLInputElement | HTMLSelectElement;
    field.value = value;
    field.dispatchEvent(new Event(event));
  }

  it('US-03 AT-1: the Jobs page shows each posting with its title, location, category and deadline, newest first', async () => {
    await open('/jobs', [NEWEST, OLDER]);

    expect(cards().map((c) => text(c.querySelector('h2')))).toEqual(['Product Designer', 'Backend Developer']);
    const first = cards()[0];
    expect(text(first.querySelector('.job-meta'))).toBe('Montreal');
    expect(text(first.querySelector('.badge'))).toBe('Design');
    expect(text(first.querySelector('.job-deadline'))).toBe('Apply by 2026-12-15');
  });

  it('US-03 AT-2: searching by keyword, location and category sends all three, shows the results, and a reload keeps them', async () => {
    await open('/jobs', [NEWEST, OLDER]);

    setField('input[formControlName="keyword"]', 'backend', 'input');
    setField('input[formControlName="location"]', 'Toronto', 'input');
    setField('select[formControlName="category"]', 'Engineering', 'change');
    (page().querySelector('button[type="submit"]') as HTMLButtonElement).click();

    const filters = { keyword: 'backend', location: 'Toronto', category: 'Engineering' };
    expect(await answerSearch([OLDER])).toEqual(filters);
    expect(cards().map((c) => text(c.querySelector('h2')))).toEqual(['Backend Developer']);

    // "Reload": leave the page, then open it again at the URL the search produced.
    const url = TestBed.inject(Router).url;
    expect(TestBed.inject(Router).parseUrl(url).queryParams).toEqual(filters);
    await harness!.navigateByUrl('/elsewhere');
    expect(await open(url, [OLDER])).toEqual(filters);
    const form = page().querySelector('input[formControlName="keyword"]') as HTMLInputElement;
    expect(form.value).toBe('backend'); // the search box is filled in again
    expect(cards().map((c) => text(c.querySelector('h2')))).toEqual(['Backend Developer']);
  });

  it('US-03 AT-3: when no posting matches, the page says "No jobs match your search." instead of an empty list', async () => {
    await open('/jobs?keyword=astronaut', []);

    expect(cards()).toHaveLength(0);
    expect(text(page().querySelector('.empty-state'))).toBe('No jobs match your search.');
  });
});
