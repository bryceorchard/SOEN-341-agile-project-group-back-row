import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { API_BASE } from './auth.service';

interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  jobLocation?: string | null;
  jobCategory?: string | null;
  resumeId: number | null;
  resumeFilename?: string | null;
  status: string;
  appliedAt: string;
  updatedAt?: string;
}

const STATUSES = ['Applied', 'Under Review', 'Interview', 'Offered', 'Rejected'];

@Component({
  selector: 'my-applications',
  templateUrl: './my-applications.component.html',
  styleUrl: './my-applications.component.css',
  imports: [CommonModule, RouterLink],
})
export class MyApplications implements OnInit {
  private http_client = inject(HttpClient);

  applications = signal<Application[]>([]);
  statuses = STATUSES;
  active_status = signal('');

  ngOnInit() {
    this.load();
  }

  filterBy(status: string) {
    this.active_status.set(status);
    this.load();
  }

  badgeClass(status: string): string {
    return `badge-${status.toLowerCase().replace(/\s+/g, '-')}`;
  }

  private load() {
    const params: Record<string, string> = {};
    if (this.active_status()) params['status'] = this.active_status();
    this.http_client
      .get<{ applications: Application[] }>(`${API_BASE}/applications`, { params })
      .subscribe((res) => this.applications.set(res.applications));
  }
}
