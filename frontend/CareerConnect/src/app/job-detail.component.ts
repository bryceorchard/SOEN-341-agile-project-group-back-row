import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { API_BASE, AuthService } from './auth.service';
import { JobSummary } from './jobs.component';

interface Resume {
  id: number;
  originalFilename: string;
}

interface Application {
  id: number;
  jobId: number;
  status: string;
  appliedAt?: string;
}

// The API returns SQLite timestamps ("YYYY-MM-DD HH:MM:SS"); the date part is all we show, and
// slicing it avoids browsers that can't parse the space-separated form (same as My applications).
function appliedDate(appliedAt: string | undefined): string | null {
  return appliedAt ? appliedAt.slice(0, 10) : null;
}

@Component({
  selector: 'job-detail',
  templateUrl: './job-detail.component.html',
  styleUrl: './job-detail.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
})
export class JobDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private http_client = inject(HttpClient);
  private form_builder = inject(FormBuilder);
  protected auth = inject(AuthService);

  job = signal<JobSummary | null>(null);
  not_found = signal(false);
  // Any other failure loading the job (server down, 500…): different message, so it isn't mistaken for a missing job.
  load_error = signal('');
  resumes = signal<Resume[]>([]);
  apply_form: FormGroup;
  apply_error = signal('');
  // null = haven't applied; otherwise the application's current status (Applied, Interview, …).
  applied_status = signal<string | null>(null);
  applied_at = signal<string | null>(null);
  // True right after a successful submit, so the card reads as a confirmation rather than a status.
  just_applied = signal(false);

  // The search filters the user came from, so "Back to results" lands them where they were.
  backQueryParams = this.route.snapshot.queryParams;

  constructor() {
    this.apply_form = this.form_builder.group({ resumeId: [''] });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.http_client.get<{ job: JobSummary }>(`${API_BASE}/jobs/${id}`).subscribe({
      next: (res) => this.job.set(res.job),
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) this.not_found.set(true);
        else this.load_error.set('Could not load this job. Please try again.');
      },
    });

    if (this.auth.currentUser()?.role === 'job_seeker') {
      this.http_client
        .get<{ resumes: Resume[] }>(`${API_BASE}/resumes`)
        .subscribe((res) => this.resumes.set(res.resumes));

      this.http_client.get<{ applications: Application[] }>(`${API_BASE}/applications`).subscribe((res) => {
        const existing = res.applications.find((a) => a.jobId === Number(id));
        if (existing) {
          this.applied_status.set(existing.status);
          this.applied_at.set(appliedDate(existing.appliedAt));
        }
      });
    }
  }

  apply() {
    const job = this.job();
    if (!job) return;
    this.apply_error.set('');

    const resumeId = this.apply_form.getRawValue().resumeId || undefined;
    this.http_client.post<{ application: Application }>(`${API_BASE}/applications`, { jobId: job.id, resumeId }).subscribe({
      next: (res) => {
        this.applied_status.set(res.application?.status ?? 'Applied');
        this.applied_at.set(appliedDate(res.application?.appliedAt) ?? new Date().toISOString().slice(0, 10));
        this.just_applied.set(true);
      },
      error: (err: HttpErrorResponse) =>
        this.apply_error.set(err.status === 409 ? "You've already applied to this job" : err.error?.error ?? 'Could not apply'),
    });
  }
}
