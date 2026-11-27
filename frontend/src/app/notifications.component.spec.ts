import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { API_BASE } from './auth.service';
import { Notification } from './notification.service';
import { Notifications } from './notifications.component';

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

describe('Notifications page', () => {
  let fixture: ComponentFixture<Notifications>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Notifications],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(Notifications);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function load(list: Notification[]) {
    fixture.detectChanges();
    http.expectOne(`${API_BASE}/notifications`).flush({ notifications: list });
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the empty state when there are no notifications', () => {
    const el = load([]);
    expect(el.textContent).toContain('You have no notifications.');
    expect(el.querySelectorAll('.notification').length).toBe(0);
  });

  it('highlights unread notifications and makes interview invitations stand out', () => {
    const el = load([
      notification({ id: 2, type: 'interview_invite', title: 'Interview invitation' }),
      notification({ id: 1, read: true }),
    ]);
    const cards = el.querySelectorAll('.notification');

    expect(cards.length).toBe(2);
    expect(cards[0].classList).toContain('unread');
    expect(cards[0].classList).toContain('interview');
    expect(cards[1].classList).not.toContain('unread');
    expect(cards[1].classList).not.toContain('interview');
  });

  it('marks a notification read and opens its link when clicked', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const el = load([notification({ id: 7, link: '/applications' })]);

    (el.querySelector('.notification') as HTMLElement).click();

    http.expectOne(`${API_BASE}/notifications/7/read`).flush({ notification: notification({ id: 7, read: true }) });
    http.expectOne(`${API_BASE}/notifications/unread-count`).flush({ count: 0 });
    expect(navigate).toHaveBeenCalledWith('/applications');
  });

  it('shows relative times from the UTC timestamps the backend stores', () => {
    const component = fixture.componentInstance;
    const now = Date.parse('2026-11-16T21:30:00Z');

    expect(component.relativeTime('2026-11-16 21:29:45', now)).toBe('just now');
    expect(component.relativeTime('2026-11-16 21:25:00', now)).toBe('5 minutes ago');
    expect(component.relativeTime('2026-11-16 20:30:00', now)).toBe('1 hour ago');
    expect(component.relativeTime('2026-11-14 21:30:00', now)).toBe('2 days ago');
  });
});
