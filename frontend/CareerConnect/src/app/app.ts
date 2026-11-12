import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Component({
  // RouterLinkActive is what makes the nav's routerLinkActive="active" highlight the current page.
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = 'CareerConnect';
  protected auth = inject(AuthService);
  protected router = inject(Router);
  protected notifications = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  constructor() {
  const refreshUnreadCount = () => {
    if (this.auth.currentUser()) {
      this.notifications.refreshUnreadCount();
    }
  };

  refreshUnreadCount();

  this.router.events
    .pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe(() => refreshUnreadCount());

  interval(60_000)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(() => refreshUnreadCount());
}

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
