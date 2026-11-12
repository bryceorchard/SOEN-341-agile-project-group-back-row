import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Profile } from './profile.component';
import { API_BASE } from './auth.service';

const SAVED = {
  fullName: 'Ada Lovelace',
  headline: 'Backend developer',
  location: 'Montreal, QC',
  phone: '514-555-0100',
  bio: 'Likes engines.',
};

describe('US-01 Manage profile (Profile page)', () => {
  let fixture: ComponentFixture<Profile>;
  let http: HttpTestingController;

  // Opens the profile page as a logged-in job seeker and answers its startup requests.
  async function openProfile(profile: Partial<typeof SAVED> = {}) {
    fixture = TestBed.createComponent(Profile);
    fixture.detectChanges();
    http.expectOne(`${API_BASE}/resumes`).flush({ resumes: [] });
    http.expectOne(`${API_BASE}/profile`).flush({ profile: { fullName: null, headline: null, location: null, phone: null, bio: null, ...profile } });
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const field = (name: string) =>
    el().querySelector(`[formControlName="${name}"]`) as HTMLInputElement | HTMLTextAreaElement;

  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('cc_token', 'test-token');
    localStorage.setItem('cc_user', JSON.stringify({ id: 1, email: 'ada@test.com', role: 'job_seeker', createdAt: '' }));

    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('US-01 AT-5: editing all profile fields and saving sends them to the backend and shows a success message', async () => {
    await openProfile();

    for (const [name, value] of Object.entries(SAVED)) {
      const input = field(name);
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    (el().querySelector('form button[type="submit"]') as HTMLButtonElement).click();

    const save = http.expectOne(`${API_BASE}/profile`);
    expect(save.request.method).toBe('PUT');
    expect(save.request.body).toEqual(SAVED);
    save.flush({ profile: SAVED });
    fixture.detectChanges();

    expect(el().querySelector('.alert-success')?.textContent).toContain('Saved.');
  });

  it('US-01 AT-5: after reloading, the saved profile values are shown in the form', async () => {
    await openProfile(SAVED);

    for (const [name, value] of Object.entries(SAVED)) {
      expect(field(name).value).toBe(value);
    }
  });
});
