import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationHistory } from './application-history';
import { API_BASE } from '../auth.service';

describe('ApplicationHistory', () => {
  let fixture: ComponentFixture<ApplicationHistory>;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApplicationHistory],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(ApplicationHistory);
    fixture.componentRef.setInput('applicationId', 3);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('lists each status change with its date and who made it', () => {
    http.expectOne(`${API_BASE}/applications/3/history`).flush({
      history: [
        { status: 'Applied', changedAt: '2026-11-01 10:00:00', changedBy: 'applicant' },
        { status: 'Interview', changedAt: '2026-11-05 15:30:00', changedBy: 'recruiter' },
        { status: 'Rejected', changedAt: '2026-11-09 09:00:00', changedBy: null },
      ],
    });
    fixture.detectChanges();

    const rows = [...fixture.nativeElement.querySelectorAll('.history-list li')].map((li: Element) => li.textContent!);
    expect(rows.length).toBe(3);
    expect(rows[0]).toContain('Applied');
    expect(rows[0]).toContain('2026');
    expect(rows[0]).toContain('applicant');
    expect(rows[1]).toContain('Interview');
    expect(rows[1]).toContain('recruiter');
    expect(rows[2]).toContain('unknown');
  });

  it('shows an error when the history cannot be loaded', () => {
    http.expectOne(`${API_BASE}/applications/3/history`).flush({}, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Could not load history.');
  });
});
