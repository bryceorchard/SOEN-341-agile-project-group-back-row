import { Component, OnInit, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApplicationStatsService } from '../application-stats';

interface Row { status: string; at: Date; by: string; }

@Component({
  selector: 'app-application-history',
  imports: [DatePipe],
  templateUrl: './application-history.html',
  styleUrl: './application-history.css',
})
export class ApplicationHistory implements OnInit {
  applicationId = input.required<number>();
  private svc = inject(ApplicationStatsService);

  rows = signal<Row[]>([]);
  loading = signal(true);
  error = signal('');

  // Created only when the row is expanded, so this is the lazy load.
  ngOnInit() {
    this.svc.history(this.applicationId()).subscribe({
      next: ({ history }) => {
        this.rows.set(
          history.map((h) => ({
            status: h.status,
            at: new Date(h.changedAt.replace(' ', 'T') + 'Z'),
            by: h.changedBy ?? 'unknown',
          })),
        );
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load history.');
        this.loading.set(false);
      },
    });
  }
}