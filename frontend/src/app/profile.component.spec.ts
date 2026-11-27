import { signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Profile, validateResumeFile, fileTypeLabel, groupImprovements, splitPlaceholders, Feedback } from './profile.component';
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

// Form controls with no associated <label> (static analysis D8, Web:InputWithoutLabelCheck).
function unlabelledControls(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll<HTMLInputElement>('input, select, textarea'))
    .filter((c) => !c.labels?.length)
    .map((c) => c.outerHTML);
}

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

  it('labels every profile field and the resume upload input', () => {
    expect(unlabelledControls(fixture.nativeElement)).toEqual([]);
    expect(fixture.nativeElement.querySelector('#resume-upload')).not.toBeNull();
  });

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

describe('groupImprovements', () => {
  const imp = (section: string, priority: string) => ({ section, priority, excerpt: '', issue: 'i', suggestion: 's' });

  it('groups by section in order of first appearance, keeping the order inside each group', () => {
    const groups = groupImprovements([
      imp('experience', 'high'),
      imp('skills', 'high'),
      imp('experience', 'medium'),
      imp('formatting', 'low'),
    ]);
    expect(groups.map((g) => g.section)).toEqual(['experience', 'skills', 'formatting']);
    expect(groups[0].items.map((i) => i.priority)).toEqual(['high', 'medium']);
  });

  it('returns no groups for no improvements', () => {
    expect(groupImprovements([])).toEqual([]);
  });
});

describe('splitPlaceholders', () => {
  it('marks [bracketed] text as placeholders', () => {
    expect(splitPlaceholders('Cut costs by [X%] for [number] clients.')).toEqual([
      { text: 'Cut costs by ', placeholder: false },
      { text: '[X%]', placeholder: true },
      { text: ' for ', placeholder: false },
      { text: '[number]', placeholder: true },
      { text: ' clients.', placeholder: false },
    ]);
  });

  it('returns plain text unchanged', () => {
    expect(splitPlaceholders('No placeholders here.')).toEqual([{ text: 'No placeholders here.', placeholder: false }]);
  });
});

describe('Profile AI Feedback', () => {
  const SEEKER = { id: 1, email: 'seeker@test.com', role: 'job_seeker' as const, createdAt: '' };
  const RESUME_A = { id: 101, originalFilename: 'a.pdf', fileType: 'application/pdf', uploadedAt: '2026-11-01 12:00:00' };
  const RESUME_B = { id: 102, originalFilename: 'b.pdf', fileType: 'application/pdf', uploadedAt: '2026-11-02 12:00:00' };

  // Same shape as backend/src/ai/feedback-schema.js and the API in docs/ai/us10-resume-feedback.md.
  function makeFeedback(overrides: Partial<Feedback> = {}): Feedback {
    return {
      resumeId: 101,
      createdAt: '2026-11-19 18:12:00',
      model: 'mock',
      promptVersion: 'resume-feedback-v3',
      isResume: true,
      summary: 'Solid resume with clear results.',
      strengths: [{ point: 'Quantified impact', evidence: 'Cut p95 latency from 1.8s to 350ms' }],
      improvements: [
        { section: 'experience', priority: 'high', excerpt: 'Worked on backend stuff.', issue: 'Vague bullet.', suggestion: 'Say what you built.' },
        { section: 'skills', priority: 'medium', excerpt: '', issue: 'No testing tools listed.', suggestion: 'Add the test frameworks you used.' },
        { section: 'experience', priority: 'low', excerpt: 'Team player', issue: 'Generic phrase.', suggestion: 'Show it with an example.' },
      ],
      rewordings: [
        { section: 'experience', original: 'Worked on backend stuff.', suggested: 'Built a REST API serving [number] users.', reason: 'Specific and measurable.' },
      ],
      ...overrides,
    };
  }

  let fixture: ComponentFixture<Profile>;
  let component: Profile;
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
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    http.expectOne(`${API_BASE}/resumes`).flush({ resumes: [RESUME_A, RESUME_B] });
    http.expectOne(`${API_BASE}/profile`).flush({ profile: {} });
    await render();
  });

  afterEach(() => http.verify());

  async function render() {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function el(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function text(): string {
    return el().textContent ?? '';
  }

  function panel(): HTMLElement | null {
    return el().querySelector('.feedback-panel');
  }

  // Clicks the button with this label; `row` picks the resume (0 = a.pdf, 1 = b.pdf).
  function click(label: string, row = 0) {
    const scope = label === 'AI feedback' || label === 'Hide AI feedback' ? el().querySelectorAll('.resume-item')[row] : el();
    const button = Array.from(scope.querySelectorAll('button')).find((b) => b.textContent?.trim() === label);
    if (!button) throw new Error(`Button "${label}" not found`);
    button.click();
  }

  function hasButton(label: string): boolean {
    return Array.from(el().querySelectorAll('button')).some((b) => b.textContent?.trim() === label);
  }

  const feedbackUrl = (id: number) => `${API_BASE}/resumes/${id}/feedback`;

  async function openWith(feedback: Feedback | null, row = 0) {
    click('AI feedback', row);
    await render();
    http.expectOne({ method: 'GET', url: feedbackUrl(row === 0 ? 101 : 102) }).flush({ feedback });
    await render();
  }

  it('labels the replacement file input', async () => {
    component.startReplace(RESUME_A.id);
    await render();
    const input = fixture.nativeElement.querySelector(`#resume-replace-${RESUME_A.id}`) as HTMLInputElement;
    expect(input.labels![0].textContent).toBe('Replacement file for a.pdf');
    expect(unlabelledControls(fixture.nativeElement)).toEqual([]);
  });

  it('loads saved feedback with GET and renders summary, strengths, generated time and Regenerate', async () => {
    click('AI feedback');
    await render();
    expect(text()).toContain('Loading saved feedback');

    http.expectOne({ method: 'GET', url: feedbackUrl(101) }).flush({ feedback: makeFeedback() });
    await render();

    expect(text()).not.toContain('Loading saved feedback');
    expect(text()).toContain('Solid resume with clear results.');
    expect(text()).toContain('Quantified impact');
    expect(text()).toContain('Cut p95 latency from 1.8s to 350ms');
    expect(text()).toContain('Generated');
    expect(text()).not.toContain('[object Object]');
    expect(hasButton('Regenerate')).toBe(true);
    expect(hasButton('Get AI feedback')).toBe(false);
  });

  it('reads the server timestamp as UTC', () => {
    expect(component.generatedAt('2026-11-19 18:12:00').toISOString()).toBe('2026-11-19T18:12:00.000Z');
  });

  it('groups improvements by section with priority badges and shows non-empty excerpts', async () => {
    await openWith(makeFeedback());

    const groups = Array.from(panel()!.querySelectorAll('.feedback-group'));
    expect(groups.map((g) => g.querySelector('h5')?.textContent?.trim())).toEqual(['Experience', 'Skills']);

    const experienceBadges = Array.from(groups[0].querySelectorAll('.badge')).map((b) => b.textContent?.trim());
    expect(experienceBadges).toEqual(['high', 'low']);
    expect(groups[0].querySelector('.badge')?.classList).toContain('priority-high');

    // The skills item has an empty excerpt, so no quote is shown for it.
    expect(groups[1].querySelectorAll('.feedback-quote').length).toBe(0);
    expect(groups[0].textContent).toContain('Worked on backend stuff.');
    expect(groups[0].textContent).toContain('Vague bullet.');
    expect(groups[0].textContent).toContain('Say what you built.');
  });

  it('shows rewordings as original → suggested with the reason, and highlights placeholders', async () => {
    await openWith(makeFeedback());

    expect(panel()!.querySelector('.rewording-original')?.textContent).toContain('Worked on backend stuff.');
    expect(panel()!.querySelector('.rewording-suggested')?.textContent).toContain('Built a REST API serving [number] users.');
    expect(text()).toContain('Specific and measurable.');

    const marks = Array.from(panel()!.querySelectorAll('.rewording-suggested mark.placeholder'));
    expect(marks.map((m) => m.textContent)).toEqual(['[number]']);
    expect(text()).toContain('is a placeholder');
  });

  it('hides the placeholder note when nothing has a placeholder', async () => {
    await openWith(makeFeedback({ rewordings: [] }));
    expect(text()).not.toContain('is a placeholder');
    expect(text()).not.toContain('Suggested rewordings');
  });

  it('shows only the summary when the document is not a resume', async () => {
    await openWith(makeFeedback({ isResume: false, summary: 'This is a cover letter.' }));
    expect(text()).toContain('This is a cover letter.');
    expect(text()).not.toContain('Strengths');
    expect(text()).not.toContain('Improvements');
  });

  it('shows the privacy notice when there is no saved feedback, then POSTs and renders the result', async () => {
    await openWith(null);
    expect(text()).toContain('sent to an external AI service');
    expect(text()).toContain('deleted when you replace or delete the resume');

    click('Get AI feedback');
    await render();
    expect(text()).toContain('Generating AI feedback');
    expect(hasButton('Get AI feedback')).toBe(false);

    http.expectOne({ method: 'POST', url: feedbackUrl(101) }).flush({ feedback: makeFeedback({ summary: 'Fresh feedback.' }) }, { status: 201, statusText: 'Created' });
    await render();

    expect(text()).toContain('Fresh feedback.');
    expect(text()).not.toContain('Generating AI feedback');
    expect(text()).not.toContain('sent to an external AI service');
  });

  it('offers "Try again" after a failed first generation, and retrying works', async () => {
    await openWith(null);
    click('Get AI feedback');
    await render();
    http
      .expectOne({ method: 'POST', url: feedbackUrl(101) })
      .flush({ error: 'The AI service is unavailable right now. Please try again later.' }, { status: 503, statusText: 'Service Unavailable' });
    await render();

    expect(text()).toContain('The AI service is unavailable right now.');
    expect(hasButton('Try again')).toBe(true);

    click('Try again');
    await render();
    http.expectOne({ method: 'POST', url: feedbackUrl(101) }).flush({ feedback: makeFeedback() }, { status: 201, statusText: 'Created' });
    await render();

    expect(text()).not.toContain('The AI service is unavailable');
    expect(text()).toContain('Solid resume with clear results.');
  });

  it('keeps the earlier feedback on screen when Regenerate fails (AT-3)', async () => {
    await openWith(makeFeedback());
    click('Regenerate');
    await render();
    http
      .expectOne({ method: 'POST', url: feedbackUrl(101) })
      .flush({ error: 'Too many feedback requests. Please wait a minute and try again.' }, { status: 429, statusText: 'Too Many Requests' });
    await render();

    expect(text()).toContain('Too many feedback requests.');
    expect(text()).toContain('Solid resume with clear results.');
    expect(hasButton('Regenerate')).toBe(true);
  });

  it('shows an error and "Try again" when saved feedback cannot be loaded, and retries the GET', async () => {
    click('AI feedback');
    await render();
    http.expectOne({ method: 'GET', url: feedbackUrl(101) }).flush({ error: 'Server error' }, { status: 500, statusText: 'Server Error' });
    await render();

    expect(text()).toContain('Server error');
    // Unknown whether feedback is saved, so don't offer a new AI request yet.
    expect(hasButton('Get AI feedback')).toBe(false);

    click('Try again');
    await render();
    http.expectOne({ method: 'GET', url: feedbackUrl(101) }).flush({ feedback: makeFeedback() });
    await render();
    expect(text()).toContain('Solid resume with clear results.');
  });

  it('reopens feedback without a new request', async () => {
    await openWith(makeFeedback());
    click('Hide AI feedback');
    await render();
    expect(panel()).toBeNull();

    click('AI feedback');
    await render();
    // http.verify() in afterEach fails if a second GET was sent.
    expect(text()).toContain('Solid resume with clear results.');
  });

  it('drops cached feedback when the resume file is replaced', async () => {
    await openWith(makeFeedback());

    const file = new File([new Uint8Array(10)], 'new.pdf', { type: 'application/pdf' });
    component.onReplaceSelect({ target: { files: [file] } } as unknown as Event, 101);
    http.expectOne({ method: 'PUT', url: `${API_BASE}/resumes/101` }).flush({ resume: RESUME_A });
    http.expectOne(`${API_BASE}/resumes`).flush({ resumes: [RESUME_A, RESUME_B] });
    await render();
    expect(panel()).toBeNull();

    await openWith(null);
    expect(text()).toContain('sent to an external AI service');
  });

  it("does not show one resume's reply in another resume's panel", async () => {
    await openWith(null, 0);
    click('Get AI feedback');
    await render();
    const pending = http.expectOne({ method: 'POST', url: feedbackUrl(101) });

    // Switch to b.pdf while a.pdf's request is still running.
    await openWith(null, 1);
    pending.flush({ feedback: makeFeedback({ summary: 'Feedback for a.pdf' }) }, { status: 201, statusText: 'Created' });
    await render();
    expect(text()).not.toContain('Feedback for a.pdf');
    expect(text()).toContain('sent to an external AI service');

    // a.pdf's result was kept and shows when its panel is reopened, without a new request.
    click('AI feedback', 0);
    await render();
    expect(text()).toContain('Feedback for a.pdf');
  });

  it('shows the generating state when reopening a resume whose request is still running', async () => {
    await openWith(null, 0);
    click('Get AI feedback');
    await render();
    const pending = http.expectOne({ method: 'POST', url: feedbackUrl(101) });

    await openWith(null, 1);
    click('AI feedback', 0);
    await render();
    expect(text()).toContain('Generating AI feedback');

    pending.flush({ feedback: makeFeedback({ summary: 'Feedback for a.pdf' }) }, { status: 201, statusText: 'Created' });
    await render();
    expect(text()).toContain('Feedback for a.pdf');
  });
});
