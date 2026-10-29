import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_BASE } from './auth.service';
import { JobSummary } from './jobs.component';
import { openBlobInNewTab } from './open-blob';

interface Applicant {
  id: number;
  applicantEmail: string;
  applicantName: string | null;
  applicantHeadline: string | null;
  resumeId: number | null;
  resumeFilename: string | null;
  status: string;
  appliedAt: string;
}

const STATUSES = ['Applied', 'Under Review', 'Interview', 'Offered', 'Rejected'];

@Component({
  selector: 'posting-applicants',
  templateUrl: './posting-applicants.component.html',
  styleUrl: './posting-applicants.component.css',
  imports: [CommonModule, RouterLink, FormsModule],
})
export class PostingApplicants implements OnInit {
  private route = inject(ActivatedRoute);
  private http_client = inject(HttpClient);

  jobId!: number;
  // The posting itself, shown above the applicants (title, location, category, deadline, status).
  job = signal<JobSummary | null>(null);
  applicants = signal<Applicant[]>([]);
  statuses = STATUSES;
  active_status = signal('');
  forbidden = signal(false);
  error = signal('');

  ngOnInit() {
    this.jobId = Number(this.route.snapshot.paramMap.get('id'));
    this.http_client.get<{ job: JobSummary }>(`${API_BASE}/jobs/${this.jobId}`).subscribe({
      next: (res) => this.job.set(res.job),
      // The applicants request decides access; a missing posting just leaves the header generic.
      error: () => this.job.set(null),
    });
    this.load();
  }

  filterBy(status: string) {
    this.active_status.set(status);
    this.load();
  }

  setStatus(applicant: Applicant, status: string) {
    const previous = applicant.status;
    this.error.set('');
    // Show the new status right away, and remember the old one in case the save fails.
    this.replaceStatus(applicant.id, status);

    this.http_client.patch(`${API_BASE}/applications/${applicant.id}`, { status }).subscribe({
      next: () => this.load(),
      error: (err) => {
        // The save failed, so put the dropdown back to what is actually stored.
        this.replaceStatus(applicant.id, previous);
        this.error.set(err?.error?.error ?? 'Could not update the status. Please try again.');
      },
    });
  }

  viewResume(resumeId: number) {
    this.error.set('');
    openBlobInNewTab(
      this.http_client.get(`${API_BASE}/resumes/${resumeId}/file`, { responseType: 'blob' }),
      (message) => this.error.set(message),
    );
  }

  // Swaps in a new object (instead of editing the old one) so Angular re-renders the row
  // and the <select> shows the right value.
  private replaceStatus(id: number, status: string) {
    this.applicants.update((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  private load() {
    const params: Record<string, string> = {};
    if (this.active_status()) params['status'] = this.active_status();
    this.http_client
      .get<{ applications: Applicant[] }>(`${API_BASE}/jobs/${this.jobId}/applications`, { params })
      .subscribe({
        next: (res) => this.applicants.set(res.applications),
        error: () => this.forbidden.set(true),
      });
  }
}
