import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { API_BASE } from './auth.service';
import { Notification } from './notification.service';
import { Notifications } from './notifications.component';

// Acceptance tests for US-22 (#146): recruiter notifications (Notifications page).

@Component({ template: 'applicants page' })
class Applicants {}

const NEW_APPLICATION: Notification = {
  id: 12,
  type: 'new_application',
  title: 'New application for Backend Developer',
  message: 'Ada Lovelace applied to Backend Developer.',
  link: '/recruiter/postings/10/applicants',
  jobId: 10,
  applicationId: 5,
  read: false,
  readAt: null,
  createdAt: '2026-11-16 21:00:00',
};

describe('US-22 acceptance', () => {
  let fixture: ComponentFixture<Notifications>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Notifications],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'recruiter/postings/:id/applicants', component: Applicants }]),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Notifications);
  });

  afterEach(() => http.verify());

  function load(list: Notification[]) {
    fixture.detectChanges();
    http.expectOne(`${API_BASE}/notifications`).flush({ notifications: list });
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it("US-22 AT-1: a new-application notification names the job and applicant, and clicking it opens that posting's applicant list", async () => {
    const el = load([NEW_APPLICATION]);
    const card = el.querySelector('.notification') as HTMLElement;
    expect(card.classList).toContain('unread');
    expect(card.textContent).toContain('New application for Backend Developer');
    expect(card.textContent).toContain('Ada Lovelace applied to Backend Developer.');

    card.click();
    http.expectOne(`${API_BASE}/notifications/12/read`).flush({ notification: { ...NEW_APPLICATION, read: true } });
    http.expectOne(`${API_BASE}/notifications/unread-count`).flush({ count: 0 });
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/recruiter/postings/10/applicants');
  });

  it('US-22 AT-2: the "closing soon" reminder appears in the recruiter\'s notifications', () => {
    const el = load([
      { ...NEW_APPLICATION, id: 13, type: 'deadline_reminder', title: 'Posting closing soon', message: 'Backend Developer closes on 2026-11-18.' },
    ]);
    expect(el.textContent).toContain('Posting closing soon');
    expect(el.textContent).toContain('Backend Developer closes on 2026-11-18.');
  });

  it('US-22 AT-3: a recruiter with no notifications sees the empty state', () => {
    const el = load([]);
    expect(el.textContent).toContain('You have no notifications.');
    expect(el.querySelectorAll('.notification').length).toBe(0);
    const markAll = Array.from(el.querySelectorAll('button')).find((b) => b.textContent!.trim() === 'Mark all as read') as HTMLButtonElement;
    expect(markAll.disabled).toBe(true);
  });
});
