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
      });
  }

  refreshUnreadCount() {
    return this.http
      .get<UnreadCountResponse>(`${API_BASE}/notifications/unread-count`)
      .subscribe({
        next: (response) => this.unreadCount.set(response.count),
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
    });
  }
}