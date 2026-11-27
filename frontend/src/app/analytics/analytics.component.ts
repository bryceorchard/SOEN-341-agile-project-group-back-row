import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApplicationStatsService } from '../application-stats';
import { Application, ApplicationStats } from '../application-stats.model';
import { ChartSpec, SankeySpec } from '../chart-adapter';
import { PERIODS, buildSankey } from '../sankey-data';
import { SankeyView } from '../sankey-view/sankey-view';
import { ChartView } from '../chart-view/chart-view.component';
import { MetricTile } from '../metric-tile/metric-tile';
import { ApplicationHistory } from '../application-history/application-history';

@Component({
  selector: 'app-analytics',
  imports: [SankeyView, ChartView, MetricTile, ApplicationHistory, RouterLink, DatePipe],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css',
})
export class Analytics implements OnInit {
  private svc = inject(ApplicationStatsService);

  loading = signal(true);
  error = signal('');
  stats = signal<ApplicationStats | null>(null);
  sankeySpecs = signal<SankeySpec[]>([]);
  weekSpec = signal<ChartSpec | null>(null);
  applications = signal<Application[]>([]);
  applicationsError = signal('');
  // Ids of the history rows that have been opened. ApplicationHistory is only created for these,
  // so each history is fetched the first time its row is expanded.
  opened = signal<ReadonlySet<number>>(new Set());

  ngOnInit() {
    this.svc.stats().subscribe({
      next: ({ stats }) => {
        this.stats.set(stats);
        this.weekSpec.set({
          kind: 'bar',
          title: 'Applications per week',
          labels: stats.perWeek.map((w) => w.weekStart),
          values: stats.perWeek.map((w) => w.count),
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load analytics.');
        this.loading.set(false);
      },
    });

    this.svc.applications().subscribe({
      next: (res: { applications: Application[] }) => {
        this.applications.set(res.applications);
        this.sankeySpecs.set(PERIODS.map((p) => buildSankey(res.applications, p)));
      },
      error: () => this.applicationsError.set('Could not load your applications.'),
    });
  }

  onToggle(id: number, event: Event) {
    if (!(event.target as HTMLDetailsElement).open || this.opened().has(id)) return;
    this.opened.update((s) => new Set(s).add(id));
  }

  // appliedAt is SQLite UTC with no timezone marker ("YYYY-MM-DD HH:MM:SS").
  appliedDate(a: Application) {
    return new Date(a.appliedAt.replace(' ', 'T') + 'Z');
  }
}
