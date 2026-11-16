import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE } from './auth.service';
import { Notification, NotificationService, parseServerTime } from './notification.service';

function notification(overrides: Partial<Notification>): Notification {
  return {
    id: 1,
    type: 'status_update',
    title: 'Application update',
    message: 'Your application is now "Under Review".',
    link: '/applications',
    jobId: 10,
    applicationId: 5,
    read: false,
    readAt: null,
    createdAt: '2026-11-16 21:00:00',
    ...overrides,
  };
}

describe('parseServerTime', () => {
  it('reads a SQLite timestamp as UTC, not local time', () => {
    expect(parseServerTime('2026-11-16 21:23:00').toISOString()).toBe('2026-11-16T21:23:00.000Z');
  });

  it('leaves timestamps that already carry a zone alone', () => {
    expect(parseServerTime('2026-11-16T21:23:00Z').toISOString()).toBe('2026-11-16T21:23:00.000Z');
    expect(parseServerTime('2026-11-16T16:23:00-05:00').toISOString()).toBe('2026-11-16T21:23:00.000Z');
  });
});

describe('NotificationService', () => {
  let service: NotificationService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(NotificationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads notifications and derives the unread count from them', () => {
    const list = [
      notification({ id: 3, type: 'interview_invite' }),
      notification({ id: 2, read: true, readAt: '2026-11-16 20:00:00' }),
      notification({ id: 1 }),
    ];

    service.loadNotifications();
    http.expectOne(`${API_BASE}/notifications`).flush({ notifications: list });

    expect(service.notifications()).toEqual(list);
    expect(service.unreadCount()).toBe(2);
  });

  it('refreshes the unread count from the server', () => {
    service.refreshUnreadCount();
    http.expectOne(`${API_BASE}/notifications/unread-count`).flush({ count: 4 });

    expect(service.unreadCount()).toBe(4);
  });

  it('marks one notification read, replaces it in the list, and refreshes the unread count', () => {
    service.notifications.set([notification({ id: 1 }), notification({ id: 2 })]);
    service.unreadCount.set(2);

    service.markRead(2);
    const req = http.expectOne(`${API_BASE}/notifications/2/read`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ notification: notification({ id: 2, read: true, readAt: '2026-11-16 21:05:00' }) });
    http.expectOne(`${API_BASE}/notifications/unread-count`).flush({ count: 1 });

    expect(service.notifications().map((n) => n.read)).toEqual([false, true]);
    expect(service.unreadCount()).toBe(1);
  });

  it('marks all notifications read and zeroes the unread count', () => {
    service.notifications.set([notification({ id: 1 }), notification({ id: 2 })]);
    service.unreadCount.set(2);

    service.markAllRead();
    const req = http.expectOne(`${API_BASE}/notifications/read-all`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ count: 0 });

    expect(service.notifications().every((n) => n.read)).toBe(true);
    expect(service.unreadCount()).toBe(0);
  });

  it('keeps the current unread count when a poll fails, without throwing', () => {
    service.unreadCount.set(3);

    service.refreshUnreadCount();
    http
      .expectOne(`${API_BASE}/notifications/unread-count`)
      .flush({ error: 'down' }, { status: 500, statusText: 'Server Error' });

    expect(service.unreadCount()).toBe(3);
  });
});
