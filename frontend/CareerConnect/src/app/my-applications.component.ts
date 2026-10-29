import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { API_BASE } from './auth.service';

export interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  jobLocation?: string | null;
  jobCategory?: string | null;
  jobDeadline?: string | null;
  jobStatus?: 'open' | 'closed';
  resumeId: number | null;
  resumeFilename?: string | null;
  status: string;
  appliedAt: string;
  updatedAt?: string;
}

export const STATUSES = ['Applied', 'Under Review', 'Interview', 'Offered', 'Rejected'];

// Exported for its own test: how many applications are in each status ('' = all of them).
export function countByStatus(applications: Application[]): Record<string, number> {
  const counts: Record<string, number> = { '': applications.length };
  for (const s of STATUSES) counts[s] = 0;
  for (const a of applications) counts[a.status] = (counts[a.status] ?? 0) + 1;
  return counts;
}

@Component({
  selector: 'my-applications',
  templateUrl: './my-applications.component.html',
  styleUrl: './my-applications.component.css',
  imports: [CommonModule, RouterLink],
})
export class MyApplications implements OnInit {
  private http_client = inject(HttpClient);

  // Everything the seeker has applied to; the status filter and the counts work from this list,
  // so the counts on the filter buttons don't change when a filter is picked.
  all = signal<Application[]>([]);
  statuses = STATUSES;
  active_status = signal('');
  loading = signal(true);
  error = signal('');

  counts = computed(() => countByStatus(this.all()));
  applications = computed(() => {
    const status = this.active_status();
    return status ? this.all().filter((a) => a.status === status) : this.all();
  });

  ngOnInit() {
    this.http_client.get<{ applications: Application[] }>(`${API_BASE}/applications`).subscribe({
      next: (res) => {
        this.all.set(res.applications);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? 'Could not load your applications. Please try again.');
        this.loading.set(false);
      },
    });
  }

  filterBy(status: string) {
    this.active_status.set(status);
  }

  badgeClass(status: string): string {
    return `badge-${status.toLowerCase().replace(/\s+/g, '-')}`;
  }
}
