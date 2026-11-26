import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from './auth.service';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  jobId: number | null;
  applicationId: number | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
}

interface UnreadCountResponse {
  count: number;
}

// The backend stores timestamps with SQLite's datetime('now'): UTC, formatted as
// "YYYY-MM-DD HH:MM:SS" with no zone marker. new Date() would read that as local time,
// so mark it as UTC explicitly. Strings that already carry a zone are left alone.
export function parseServerTime(timestamp: string): Date {
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(timestamp);
  return new Date(hasZone ? timestamp : `${timestamp.replace(' ', 'T')}Z`);
}

// A failed request (backend down, expired session) shouldn't throw an unhandled error every
// time the bell polls; the current values simply stay until the next successful refresh.
const ignoreError = () => {};

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);

  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);

  loadNotifications() {
    return this.http
      .get<NotificationsResponse>(`${API_BASE}/notifications`)
      .subscribe({
        next: (response) => {
          this.notifications.set(response.notifications);
          this.unreadCount.set(
            response.notifications.filter((notification) => !notification.read).length,
          );
        },
        error: ignoreError,
      });
  }

  refreshUnreadCount() {
    return this.http
      .get<UnreadCountResponse>(`${API_BASE}/notifications/unread-count`)
      .subscribe({
        next: (response) => this.unreadCount.set(response.count),
        error: ignoreError,
      });
  }

  markRead(id: number) {
    return this.http
      .patch<{ notification: Notification }>(`${API_BASE}/notifications/${id}/read`, {})
      .subscribe({
        next: (response) => {
          this.notifications.update((notifications) =>
            notifications.map((notification) =>
              notification.id === id ? response.notification : notification,
            ),
          );
          this.refreshUnreadCount();
        },
        error: ignoreError,
      });
  }

  markAllRead() {
    return this.http.patch(`${API_BASE}/notifications/read-all`, {}).subscribe({
      next: () => {
        this.notifications.update((notifications) =>
          notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        );
        this.unreadCount.set(0);
      },
      error: ignoreError,
    });
  }
}
