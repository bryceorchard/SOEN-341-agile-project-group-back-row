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
