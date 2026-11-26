import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { App } from './app';
import { API_BASE, AuthService } from './auth.service';
import { Notification } from './notification.service';
import { Notifications } from './notifications.component';

// Acceptance tests for US-07 (#145): job seeker notifications (frontend).
// Interview invitations standing out (AT-2) and click-to-open (AT-1) are also covered in
// notifications.component.spec.ts.

@Component({ template: '' })
class Blank {}

const SEEKER = { id: 1, email: 'seeker@test.com', role: 'job_seeker' as const, createdAt: '' };

const notification = (overrides: Partial<Notification>): Notification => ({
  id: 1,
  type: 'status_update',
  title: 'Application update: Backend Developer',
  message: 'Your application for Backend Developer is now "Under Review".',
  link: '/applications',
  jobId: 10,
  applicationId: 5,
  read: false,
  readAt: null,
  createdAt: '2026-11-16 21:00:00',
  ...overrides,
});

describe('US-07 acceptance', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, Notifications],
      providers: [
        provideRouter([
          { path: 'jobs', component: Blank },
          { path: 'applications', component: Blank },
          { path: 'notifications', component: Notifications },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { currentUser: signal(SEEKER), logout: () => {} } },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  // Answers every pending unread-count request (the nav asks on start-up and after each navigation).
  function answerCount(count: number) {
    for (const req of http.match(`${API_BASE}/notifications/unread-count`)) req.flush({ count });
  }

  it("US-07 AT-1: the nav bell shows the job seeker's unread count, and it goes up when a new notification arrives", async () => {
    const fixture = TestBed.createComponent(App);
    answerCount(0);
    fixture.detectChanges();
    const bell = () => (fixture.nativeElement as HTMLElement).querySelector('.notification-bell .notification-count');
    expect(bell()).toBeNull(); // no badge when there is nothing unread

    // A recruiter changes a status; the next refresh (e.g. on navigation) picks up the new count.
    await TestBed.inject(Router).navigateByUrl('/jobs');
    answerCount(1);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(bell()?.textContent?.trim()).toBe('1');
  });

  it('US-07 AT-1: clicking an unread notification marks it read, lowers the count, and goes to the application', async () => {
    const fixture = TestBed.createComponent(App);
    answerCount(1);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/notifications');
    answerCount(1);
    fixture.detectChanges(); // draws the notifications page, which loads the list
    http.expectOne(`${API_BASE}/notifications`).flush({ notifications: [notification({ id: 7 })] });
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.notification-count')?.textContent?.trim()).toBe('1');

    (el.querySelector('.notification.unread') as HTMLElement).click();
    http.expectOne(`${API_BASE}/notifications/7/read`).flush({ notification: notification({ id: 7, read: true, readAt: '2026-11-16 21:05:00' }) });
    await fixture.whenStable();
    answerCount(0); // the count is re-checked after reading it and after navigating
    fixture.detectChanges();

    expect(router.url).toBe('/applications');
    expect(el.querySelector('.notification-count')).toBeNull();
  });

  it('US-07 AT-4: "Mark all as read" resets the count to zero and keeps every notification listed as read', async () => {
    const fixture = TestBed.createComponent(Notifications);
    fixture.detectChanges();
    http.expectOne(`${API_BASE}/notifications`).flush({
      notifications: [
        notification({ id: 3, type: 'interview_invite', title: 'Interview invite: QA Analyst' }),
        notification({ id: 2 }),
        notification({ id: 1, type: 'deadline_reminder', title: 'Deadline soon', read: true, readAt: '2026-11-15 10:00:00' }),
      ],
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const markAll = () =>
      Array.from(el.querySelectorAll('button')).find((b) => b.textContent!.trim() === 'Mark all as read') as HTMLButtonElement;
    expect(el.querySelectorAll('.notification.unread').length).toBe(2);
    expect(markAll().disabled).toBe(false);

    markAll().click();
    const req = http.expectOne(`${API_BASE}/notifications/read-all`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ count: 0 });
    fixture.detectChanges();

    expect(el.querySelectorAll('.notification').length).toBe(3); // still in the history
    expect(el.querySelectorAll('.notification.unread').length).toBe(0); // all shown as read
    expect(markAll().disabled).toBe(true); // nothing left to mark
  });
});
