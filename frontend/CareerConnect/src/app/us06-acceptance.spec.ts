import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Application, MyApplications } from './my-applications.component';
import { API_BASE } from './auth.service';

// Acceptance tests for US-06 (#93): application dashboard with status.
// AT-1, AT-3 and AT-4 are already covered in my-applications.component.spec.ts.

const BEFORE: Application = {
  id: 1,
  jobId: 10,
  jobTitle: 'Backend Developer',
  jobLocation: 'Montreal',
  jobCategory: 'Engineering',
  jobDeadline: '2026-12-31',
  jobStatus: 'open',
  resumeId: 4,
  resumeFilename: 'resume.pdf',
  status: 'Applied',
  appliedAt: '2026-11-01 10:00:00',
  updatedAt: '2026-11-01 10:00:00',
};
// What the backend returns after the recruiter moves the application to Interview.
const AFTER: Application = { ...BEFORE, status: 'Interview', updatedAt: '2026-11-16 15:30:00' };

describe('US-06 acceptance', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyApplications],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  // Opens (or reloads) the My applications page with what the backend currently returns.
  async function openPage(applications: Application[]) {
    const fixture = TestBed.createComponent(MyApplications);
    fixture.detectChanges();
    http.expectOne(`${API_BASE}/applications`).flush({ applications });
    fixture.detectChanges();
    await fixture.whenStable();
    const row = fixture.nativeElement.querySelector('.application-row') as HTMLElement;
    return { badge: row.querySelector('.badge')!.textContent!.trim(), text: row.textContent!.replace(/\s+/g, ' ') };
  }

  it('US-06 AT-2: after a recruiter moves an application to "Interview", reloading shows the Interview badge and the new last-updated date', async () => {
    const before = await openPage([BEFORE]);
    expect(before.badge).toBe('Applied');
    expect(before.text).toContain('Last updated 2026-11-01');

    const after = await openPage([AFTER]); // the job seeker reloads the page
    expect(after.badge).toBe('Interview');
    expect(after.text).toContain('Last updated 2026-11-16');
    expect(after.text).toContain('Applied 2026-11-01'); // the applied date doesn't change
  });
});
