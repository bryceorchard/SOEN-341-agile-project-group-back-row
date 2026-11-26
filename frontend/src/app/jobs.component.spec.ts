import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { API_BASE } from './auth.service';
import { Jobs, buildJobsQuery } from './jobs.component';

describe('buildJobsQuery', () => {
  it('returns an empty object when no filters are set', () => {
    expect(buildJobsQuery({ keyword: '', location: '', category: '' })).toEqual({});
  });

  it('includes only the filters that have a value', () => {
    expect(buildJobsQuery({ keyword: 'backend', location: '', category: '' })).toEqual({
      keyword: 'backend',
    });
  });

  it('includes all three filters when all are set', () => {
    expect(buildJobsQuery({ keyword: 'backend', location: 'Montreal', category: 'Engineering' })).toEqual({
      keyword: 'backend',
      location: 'Montreal',
      category: 'Engineering',
    });
  });

  it('treats null/undefined filters the same as empty', () => {
    expect(buildJobsQuery({ keyword: null, location: undefined, category: '' })).toEqual({});
  });
});

describe('Jobs page: filters round-trip through the URL', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: 'jobs', component: Jobs }])],
    }).compileComponents();
  });

  afterEach(() => http.verify());

  async function open(url: string): Promise<Jobs> {
    harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl(url, Jobs);
    http = TestBed.inject(HttpTestingController);
    http.expectOne(`${API_BASE}/jobs/categories`).flush({ categories: ['Engineering', 'Design'] });
    return page;
  }

  function expectJobsRequest(params: Record<string, string>) {
    const req = http.expectOne((r) => r.url === `${API_BASE}/jobs`);
    const sent = Object.fromEntries(req.request.params.keys().map((k) => [k, req.request.params.get(k)]));
    expect(sent).toEqual(params);
    req.flush({ jobs: [] });
  }

  it('restores the filters from the URL on load and searches with them', async () => {
    const page = await open('/jobs?keyword=backend&location=Montreal&category=Engineering');

    expect(page.filter_form.getRawValue()).toEqual({ keyword: 'backend', location: 'Montreal', category: 'Engineering' });
    expectJobsRequest({ keyword: 'backend', location: 'Montreal', category: 'Engineering' });
  });

  it('writes the filters to the URL when the user searches', async () => {
    const page = await open('/jobs');
    expectJobsRequest({});

    page.filter_form.setValue({ keyword: 'designer', location: '', category: 'Design' });
    page.search();
    expectJobsRequest({ keyword: 'designer', category: 'Design' });
    await harness.fixture.whenStable();

    const url = TestBed.inject(Router).parseUrl(TestBed.inject(Router).url);
    expect(url.queryParams).toEqual({ keyword: 'designer', category: 'Design' });
  });
});
