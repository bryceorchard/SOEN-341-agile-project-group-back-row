import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class Notifications implements OnInit {
  protected notificationService = inject(NotificationService);
  private router = inject(Router);

  ngOnInit(): void {
    this.notificationService.loadNotifications();
  }

  openNotification(id: number, link: string | null): void {
    this.notificationService.markRead(id);

    if (link) {
      this.router.navigateByUrl(link);
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllRead();
  }

  relativeTime(createdAt: string): string {
    const difference = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(difference / 60000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
}