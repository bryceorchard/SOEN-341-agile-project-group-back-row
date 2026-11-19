import { signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Profile, validateResumeFile, fileTypeLabel } from './profile.component';
import { API_BASE, AuthService } from './auth.service';

function makeFile(type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], 'resume', { type });
}

describe('validateResumeFile', () => {
  it('rejects a file type other than PDF/DOC/DOCX', () => {
    const file = makeFile('image/png', 1024);
    expect(validateResumeFile(file)).toBe('Resume must be a PDF, DOC or DOCX file.');
  });

  it('rejects a file over 5 MB', () => {
    const file = makeFile('application/pdf', 5 * 1024 * 1024 + 1);
    expect(validateResumeFile(file)).toBe('Resume must be 5 MB or smaller.');
  });

  it('accepts a PDF at or under 5 MB', () => {
    const file = makeFile('application/pdf', 5 * 1024 * 1024);
    expect(validateResumeFile(file)).toBeNull();
  });

  it('accepts DOC and DOCX mime types', () => {
    expect(validateResumeFile(makeFile('application/msword', 1024))).toBeNull();
    expect(
      validateResumeFile(
        makeFile('application/vnd.openxmlformats-officedocument.wordprocessingml.document', 1024),
      ),
    ).toBeNull();
  });
});

describe('fileTypeLabel', () => {
  it('maps known mime types to a friendly label', () => {
    expect(fileTypeLabel('application/pdf')).toBe('PDF');
  });

  it('falls back to the raw mime type when unknown', () => {
    expect(fileTypeLabel('application/weird')).toBe('application/weird');
  });
});

describe('Profile details', () => {
  const SEEKER = { id: 1, email: 'seeker@test.com', role: 'job_seeker' as const, createdAt: '' };
  const SAVED = { fullName: 'Sam Seeker', headline: 'Junior developer', location: 'Montreal', phone: null, bio: 'Hi' };
  let fixture: ComponentFixture<Profile>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { currentUser: signal(SEEKER) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Profile);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne(`${API_BASE}/resumes`).flush({ resumes: [] });
    http.expectOne(`${API_BASE}/profile`).flush({ profile: SAVED });
    await render();
  });

  afterEach(() => http.verify());

  async function render() {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function input(name: string): HTMLInputElement | HTMLTextAreaElement {
    return (fixture.nativeElement as HTMLElement).querySelector(`[formcontrolname=${name}]`)!;
  }

  function type(name: string, value: string) {
    const el = input(name);
    el.value = value;
    el.dispatchEvent(new Event('input'));
  }

  function submit() {
    (fixture.nativeElement as HTMLElement).querySelector('.profile-card form')!.dispatchEvent(new Event('submit'));
  }

  it('loads the saved profile into the form', () => {
    expect(input('fullName').value).toBe('Sam Seeker');
    expect(input('headline').value).toBe('Junior developer');
    expect(input('location').value).toBe('Montreal');
    expect(input('phone').value).toBe('');
    expect(input('bio').value).toBe('Hi');
  });

  it('saves the edited fields with PUT /profile and confirms', async () => {
    type('headline', 'Frontend developer');
    submit();
    const req = http.expectOne(`${API_BASE}/profile`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ ...SAVED, phone: '', headline: 'Frontend developer' });
    req.flush({ profile: { ...SAVED, headline: 'Frontend developer' } });
    await render();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Saved.');
  });

  it('blocks a field over 2000 characters and sends nothing', async () => {
    type('bio', 'x'.repeat(2001));
    await render();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Too long (2000 characters max): Bio');

    submit();
    http.expectNone(`${API_BASE}/profile`);
    await render();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Bio: 2000 characters max.');
  });
});

describe('Profile AI Feedback', () => {
  const SEEKER = { id: 1, email: 'seeker@test.com', role: 'job_seeker' as const, createdAt: '' };
  const MOCK_RESUME = { id: 101, originalFilename: 'test.pdf', fileType: 'application/pdf', uploadedAt: '2023-01-01T00:00:00Z' };
  
  let fixture: ComponentFixture<Profile>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { currentUser: signal(SEEKER) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Profile);
    http = TestBed.inject(HttpTestingController);
    
    fixture.detectChanges();
    http.expectOne(`${API_BASE}/resumes`).flush({ resumes: [MOCK_RESUME] });
    http.expectOne(`${API_BASE}/profile`).flush({ profile: {} });
    await render();
  });

  afterEach(() => http.verify());

  async function render() {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function getNativeElement(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function clickButtonByText(text: string) {
    const buttons = Array.from(getNativeElement().querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent?.trim() === text);
    if (!btn) throw new Error(`Button "${text}" not found`);
    btn.click();
  }

  it('shows loading state, fetches saved feedback, and renders structured data', async () => {
    clickButtonByText('AI Feedback');
    fixture.detectChanges();

    expect(getNativeElement().textContent).toContain('Loading AI feedback...');

    const req = http.expectOne(`${API_BASE}/resumes/101/feedback`);
    expect(req.request.method).toBe('GET');

    const MOCK_FEEDBACK = {
      resumeId: 101, 
      createdAt: '2023-01-02T00:00:00Z', 
      model: 'test-model', 
      promptVersion: '1.0',
      isResume: true,
      summary: 'Excellent layout and pacing.',
      strengths: [{ point: 'Great bullet points', evidence: 'Cut p95 latency from 1.8s to 350ms' }],
      improvements: [],
      rewordings: []
    };
    req.flush({ feedback: MOCK_FEEDBACK });
    await render();

    const text = getNativeElement().textContent;
    expect(text).not.toContain('Loading AI feedback...');
    expect(text).toContain('Excellent layout and pacing.');
    expect(text).toContain('Great bullet points');
    expect(text).not.toContain('[object Object]');
  });

  it('displays an error if the feedback GET request fails', async () => {
    clickButtonByText('AI Feedback');
    
    const req = http.expectOne(`${API_BASE}/resumes/101/feedback`);
    req.flush({ error: 'AI service timed out' }, { status: 503, statusText: 'Service Unavailable' });
    await render();

    expect(getNativeElement().textContent).toContain('AI service timed out');
  });

  it('shows privacy notice if no feedback exists, then POSTs to generate and display new feedback', async () => {
    clickButtonByText('AI Feedback');
    
    http.expectOne(`${API_BASE}/resumes/101/feedback`).flush({ feedback: null });
    await render();

    expect(getNativeElement().textContent).toContain('By proceeding, your resume text will be sent to an external AI service');
    
    clickButtonByText('Get AI feedback');
    fixture.detectChanges();
    expect(getNativeElement().textContent).toContain('Loading AI feedback...');

    const req = http.expectOne(`${API_BASE}/resumes/101/feedback`);
    expect(req.request.method).toBe('POST');
    
    req.flush({
      feedback: {
        resumeId: 101, 
        createdAt: '2023-01-02T00:00:00Z', 
        model: 'test-model', 
        promptVersion: '1.0',
        isResume: true,
        summary: 'Brand new generated summary.',
        strengths: [],
        improvements: [{ section: 'skills', priority: 'high', excerpt: 'Backend: Node.js', issue: 'Missing framework versions.', suggestion: 'Add framework specifics.' }],
        rewordings: [{ section: 'experience', original: 'Worked on backend stuff.', suggested: 'Built the backend API for CareerConnect.', reason: 'More specific and measurable.' }]
      }
    });
    await render();

    const text = getNativeElement().textContent;
    expect(text).toContain('Brand new generated summary.');
    expect(text).toContain('Add framework specifics.');
  });
});
