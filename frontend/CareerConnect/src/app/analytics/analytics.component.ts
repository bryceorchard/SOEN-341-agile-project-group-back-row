import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApplicationStatsService } from '../application-stats';
import { Application, ApplicationStats } from '../application-stats.model';
import { ChartSpec, SankeySpec } from '../chart-adapter';
import { PERIODS, buildSankey } from '../sankey-data';
import { SankeyView } from '../sankey-view/sankey-view';
import { ChartView } from '../chart-view/chart-view.component';
import { MetricTile } from '../metric-tile/metric-tile';

@Component({
  selector: 'app-analytics',
  imports: [SankeyView, ChartView, MetricTile, RouterLink],
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

    this.svc.applications().subscribe((res: { applications: Application[] }) => {
      this.sankeySpecs.set(PERIODS.map((p) => buildSankey(res.applications, p)));
    });
  }
}