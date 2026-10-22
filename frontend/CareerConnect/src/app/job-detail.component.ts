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
  resumes = signal<Resume[]>([]);
  apply_form: FormGroup;
  apply_error = signal('');
  applied = signal(false);

  constructor() {
    this.apply_form = this.form_builder.group({ resumeId: [''] });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.http_client.get<{ job: JobSummary }>(`${API_BASE}/jobs/${id}`).subscribe({
      next: (res) => this.job.set(res.job),
      error: () => this.not_found.set(true),
    });

    if (this.auth.currentUser()?.role === 'job_seeker') {
      this.http_client
        .get<{ resumes: Resume[] }>(`${API_BASE}/resumes`)
        .subscribe((res) => this.resumes.set(res.resumes));
    }
  }

  apply() {
    const job = this.job();
    if (!job) return;
    this.apply_error.set('');

    const resumeId = this.apply_form.getRawValue().resumeId || undefined;
    this.http_client.post(`${API_BASE}/applications`, { jobId: job.id, resumeId }).subscribe({
      next: () => this.applied.set(true),
      error: (err: HttpErrorResponse) =>
        this.apply_error.set(err.status === 409 ? "You've already applied to this job" : err.error?.error ?? 'Could not apply'),
    });
  }
}
