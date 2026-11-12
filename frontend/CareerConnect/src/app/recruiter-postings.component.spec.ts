import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RecruiterPostings, Posting } from './recruiter-postings.component';
import { AuthService, API_BASE } from './auth.service';

describe('RecruiterPostings form validation', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruiterPostings],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: () => true,
            getUser: () => ({ id: 1, email: 'r@test.com', role: 'recruiter', createdAt: '' }),
          },
        },
      ],
    }).compileComponents();
  });

  it('rejects an empty title or description', () => {
    const fixture = TestBed.createComponent(RecruiterPostings);
    const form = fixture.componentInstance.create_form;

    form.setValue({ title: '', description: '', location: '', category: '', deadline: '' });
    expect(form.invalid).toBe(true);

    form.setValue({ title: 'Backend Developer', description: '', location: '', category: '', deadline: '' });
    expect(form.invalid).toBe(true);
  });

  it('accepts a title and description with optional fields blank', () => {
    const fixture = TestBed.createComponent(RecruiterPostings);
    const form = fixture.componentInstance.create_form;

    form.setValue({
      title: 'Backend Developer',
      description: 'Work on the API',
      location: '',
      category: '',
      deadline: '',
    });
    expect(form.valid).toBe(true);
  });
});

describe('RecruiterPostings Dashboard Features', () => {
  let fixture: ComponentFixture<RecruiterPostings>;
  let component: RecruiterPostings;
  let http: HttpTestingController;

  const MOCK_POSTING: Posting = {
    id: 10,
    title: 'Backend Developer',
    description: 'Work on the API',
    location: null,
    category: null,
    deadline: null,
    status: 'open',
    applicationCount: 5,
    statusCounts: { 'Applied': 3, 'Interview': 2 }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruiterPostings],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: () => true,
            getUser: () => ({ id: 1, email: 'r@test.com', role: 'recruiter', createdAt: '' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecruiterPostings);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    
    // auto-accept the window.confirm dialogs for archive/restore
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    // ensure no unexpected HTTP requests were made
    http.verify();
  });

  it('loads active postings by default and displays status counts', () => {
    // fixture.detectChanges() triggers ngOnInit, which calls refreshPostings()
    fixture.detectChanges(); 
    
    const req = http.expectOne(`${API_BASE}/jobs/mine?view=active`);
    expect(req.request.method).toBe('GET');
    req.flush({ jobs: [MOCK_POSTING] });
    
    // update DOM with the flushed mock data
    fixture.detectChanges();

    const domText = fixture.nativeElement.textContent;
    expect(domText).toContain('Backend Developer');
    expect(domText).toContain('Total Applications: 5');
    expect(domText).toContain('Applied: 3');
    expect(domText).toContain('Interview: 2');
  });

  it('toggles to the archived view and requests archived jobs', () => {
    fixture.detectChanges(); 
    http.expectOne(`${API_BASE}/jobs/mine?view=active`).flush({ jobs: [] });

    component.toggleView('archived');
    
    const req = http.expectOne(`${API_BASE}/jobs/mine?view=archived`);
    expect(req.request.method).toBe('GET');
    req.flush({ jobs: [] });
  });

  it('archives a posting and reloads the active view', () => {
    fixture.detectChanges();
    http.expectOne(`${API_BASE}/jobs/mine?view=active`).flush({ jobs: [MOCK_POSTING] });

    component.archivePosting(MOCK_POSTING);

    const patchReq = http.expectOne(`${API_BASE}/jobs/10/archive`);
    expect(patchReq.request.method).toBe('PATCH');
    patchReq.flush({ job: MOCK_POSTING });

    // component should automatically fetch the active list again
    http.expectOne(`${API_BASE}/jobs/mine?view=active`).flush({ jobs: [] });
  });

  it('restores a posting and reloads the archived view', () => {
    fixture.detectChanges();
    http.expectOne(`${API_BASE}/jobs/mine?view=active`).flush({ jobs: [] });

    // switch to archived view first
    component.toggleView('archived');
    http.expectOne(`${API_BASE}/jobs/mine?view=archived`).flush({ jobs: [MOCK_POSTING] });

    component.restorePosting(MOCK_POSTING);

    const patchReq = http.expectOne(`${API_BASE}/jobs/10/unarchive`);
    expect(patchReq.request.method).toBe('PATCH');
    patchReq.flush({ job: MOCK_POSTING });

    // component should automatically fetch the archived list again
    http.expectOne(`${API_BASE}/jobs/mine?view=archived`).flush({ jobs: [] });
  });
});
