import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Posting, RecruiterPostings } from './recruiter-postings.component';
import { API_BASE } from './auth.service';

// Acceptance tests for US-08 (#94): recruiter creates and manages job postings (My postings page).
// AT-2 (job seeker blocked from the recruiter route) is covered in guards.spec.ts; the backend
// side of AT-2 to AT-4 is in backend/test/jobs-applications.test.js and us08-acceptance.test.js.

const posting = (fields: Partial<Posting>): Posting => ({
  id: 10,
  title: 'Backend Developer',
  description: 'Work on the API',
  location: 'Montreal',
  category: 'Engineering',
  deadline: null,
  status: 'open',
  applicationCount: 0,
  statusCounts: {},
  ...fields,
});

describe('US-08 acceptance', () => {
  let fixture: ComponentFixture<RecruiterPostings>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruiterPostings],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function openPage(postings: Posting[]) {
    fixture = TestBed.createComponent(RecruiterPostings);
    fixture.detectChanges();
    answerMyPostings(postings);
    await render();
  }

  function answerMyPostings(postings: Posting[]) {
    http.expectOne(`${API_BASE}/jobs/mine?view=active`).flush({ jobs: postings });
  }

  async function render() {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const button = (text: string, root: ParentNode = el()) =>
    Array.from(root.querySelectorAll('button')).find((b) => b.textContent!.trim() === text) as HTMLButtonElement;
  const cards = () => Array.from(el().querySelectorAll('.posting-card')) as HTMLElement[];
  const titles = () => cards().map((c) => c.querySelector('h2')!.textContent!.trim());

  function type(root: ParentNode, control: string, value: string) {
    const field = root.querySelector(`[formControlName="${control}"]`) as HTMLInputElement | HTMLTextAreaElement;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }

  it('US-08 AT-1: submitting the New posting form with a title and description creates it and it appears in My postings', async () => {
    await openPage([]);

    button('New posting').click();
    await render();
    const form = el().querySelector('.create-card form')!;
    expect(button('Create posting', form).disabled).toBe(true); // title and description are required
    type(form, 'title', 'QA Analyst');
    type(form, 'description', 'Test the platform');
    await render();
    button('Create posting', form).click();

    const create = http.expectOne(`${API_BASE}/jobs`);
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toMatchObject({ title: 'QA Analyst', description: 'Test the platform' });
    create.flush({ job: posting({ id: 11, title: 'QA Analyst' }) }, { status: 201, statusText: 'Created' });

    answerMyPostings([posting({ id: 11, title: 'QA Analyst' })]);
    await render();
    expect(titles()).toEqual(['QA Analyst']);
    expect(el().querySelector('.create-card')).toBeNull(); // the form closes after creating
  });

  it("US-08 AT-3: editing a posting's details saves them and My postings shows the update", async () => {
    await openPage([posting({})]);

    button('Edit', cards()[0]).click();
    await render();
    const form = cards()[0].querySelector('form')!;
    type(form, 'title', 'Senior Backend Developer');
    type(form, 'location', 'Toronto');
    await render();
    button('Save', form).click();

    const save = http.expectOne(`${API_BASE}/jobs/10`);
    expect(save.request.method).toBe('PUT');
    expect(save.request.body).toMatchObject({ title: 'Senior Backend Developer', location: 'Toronto' });
    save.flush({ job: posting({ title: 'Senior Backend Developer', location: 'Toronto' }) });

    answerMyPostings([posting({ title: 'Senior Backend Developer', location: 'Toronto' })]);
    await render();
    expect(titles()).toEqual(['Senior Backend Developer']);
    expect(cards()[0].textContent).toContain('Toronto');
  });

  it('US-08 AT-3: closing a posting changes its status to closed in My postings', async () => {
    await openPage([posting({})]);
    expect(cards()[0].querySelector('.badge')!.textContent!.trim()).toBe('open');

    button('Close', cards()[0]).click();
    const close = http.expectOne(`${API_BASE}/jobs/10/status`);
    expect(close.request.method).toBe('PATCH');
    expect(close.request.body).toEqual({ status: 'closed' });
    close.flush({ job: posting({ status: 'closed' }) });

    answerMyPostings([posting({ status: 'closed' })]);
    await render();
    expect(cards()[0].querySelector('.badge')!.textContent!.trim()).toBe('closed');
    expect(button('Reopen', cards()[0])).toBeTruthy();
  });
});
