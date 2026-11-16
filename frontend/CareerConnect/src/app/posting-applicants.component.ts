import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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

// GET /jobs/:id/applications/:applicationId: everything needed to review one candidate.
export interface CandidateReview {
  application: {
    id: number;
    jobId: number;
    status: string;
    appliedAt: string;
    updatedAt: string;
    resumeId: number | null;
    resumeFilename: string | null;
  };
  candidate: {
    email: string;
    fullName: string | null;
    headline: string | null;
    location: string | null;
    phone: string | null;
    bio: string | null;
  };
  otherApplications: { id: number; jobId: number; jobTitle: string; jobStatus: string; status: string; appliedAt: string }[];
}

const STATUSES = ['Applied', 'Under Review', 'Interview', 'Offered', 'Rejected'];

// Exported for its own test: true when both dates are set and "from" is after "to".
// YYYY-MM-DD strings compare correctly as text, so no Date parsing is needed.
export function isInvalidRange(from: string, to: string): boolean {
  return !!from && !!to && from > to;
}

@Component({
  selector: 'posting-applicants',
  templateUrl: './posting-applicants.component.html',
  styleUrl: './posting-applicants.component.css',
  imports: [CommonModule, RouterLink, FormsModule],
})
export class PostingApplicants implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http_client = inject(HttpClient);

  jobId!: number;
  // The posting itself, shown above the applicants (title, location, category, deadline, status).
  job = signal<JobSummary | null>(null);
  applicants = signal<Applicant[]>([]);
  statuses = STATUSES;
  active_status = signal('');
  forbidden = signal(false);
  error = signal('');

  // Date range filter. The inputs (from_input/to_input) only take effect when applied, so an
  // invalid range never changes the list; applied_from/applied_to are what the list is filtered by.
  from_input = '';
  to_input = '';
  applied_from = signal('');
  applied_to = signal('');
  date_error = signal('');

  // The candidate review panel (null = closed).
  review = signal<CandidateReview | null>(null);
  review_error = signal('');

  ngOnInit() {
    this.jobId = Number(this.route.snapshot.paramMap.get('id'));

    // Restore the filters from the URL, so a reload or a shared link shows the same list.
    const query = this.route.snapshot.queryParamMap;
    this.active_status.set(query.get('status') ?? '');
    this.from_input = query.get('from') ?? '';
    this.to_input = query.get('to') ?? '';
    if (isInvalidRange(this.from_input, this.to_input)) {
      this.date_error.set('"From" must be on or before "To". The date filter was not applied.');
    } else {
      this.applied_from.set(this.from_input);
      this.applied_to.set(this.to_input);
    }

    this.http_client.get<{ job: JobSummary }>(`${API_BASE}/jobs/${this.jobId}`).subscribe({
      next: (res) => this.job.set(res.job),
      // The applicants request decides access; a missing posting just leaves the header generic.
      error: () => this.job.set(null),
    });
    this.load();
  }

  filterBy(status: string) {
    this.active_status.set(status);
    this.syncUrl();
    this.load();
  }

  applyDates() {
    if (isInvalidRange(this.from_input, this.to_input)) {
      this.date_error.set('"From" must be on or before "To".');
      return; // leave the list (and the URL) as they are
    }
    this.date_error.set('');
    this.applied_from.set(this.from_input);
    this.applied_to.set(this.to_input);
    this.syncUrl();
    this.load();
  }

  clearDates() {
    this.from_input = '';
    this.to_input = '';
    this.applyDates();
  }

  hasFilters(): boolean {
    return !!(this.active_status() || this.applied_from() || this.applied_to());
  }

  setStatus(applicant: Applicant, status: string) {
    this.changeStatus(applicant.id, applicant.status, status);
  }

  // Status dropdown inside the review panel.
  setReviewStatus(status: string) {
    const current = this.review();
    if (current) this.changeStatus(current.application.id, current.application.status, status);
  }

  openReview(applicant: Applicant) {
    this.review_error.set('');
    this.http_client
      .get<CandidateReview>(`${API_BASE}/jobs/${this.jobId}/applications/${applicant.id}`)
      .subscribe({
        next: (res) => this.review.set(res),
        error: (err: HttpErrorResponse) => {
          this.review.set(null);
          this.review_error.set(err?.error?.error ?? 'Could not load this candidate.');
        },
      });
  }

  closeReview() {
    this.review.set(null);
    this.review_error.set('');
  }

  viewResume(resumeId: number, filename: string) {
    this.error.set('');
    openBlobInNewTab(
      this.http_client.get(`${API_BASE}/resumes/${resumeId}/file`, { responseType: 'blob' }),
      filename,
      (message) => this.error.set(message),
    );
  }

  private changeStatus(id: number, previous: string, status: string) {
    this.error.set('');
    // Show the new status right away, and remember the old one in case the save fails.
    this.replaceStatus(id, status);

    this.http_client.patch(`${API_BASE}/applications/${id}`, { status }).subscribe({
      next: () => this.load(),
      error: (err) => {
        // The save failed, so put the dropdown back to what is actually stored.
        this.replaceStatus(id, previous);
        this.error.set(err?.error?.error ?? 'Could not update the status. Please try again.');
      },
    });
  }

  // Swaps in new objects (instead of editing the old ones) so Angular re-renders the row, the
  // review panel, and their <select>s with the right value.
  private replaceStatus(id: number, status: string) {
    this.applicants.update((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
    this.review.update((r) => (r && r.application.id === id ? { ...r, application: { ...r.application, status } } : r));
  }

  // Keeps the filters in the URL query, like the job search, without adding a history entry per click.
  private syncUrl() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: this.active_status() || null,
        from: this.applied_from() || null,
        to: this.applied_to() || null,
      },
      replaceUrl: true,
    });
  }

  private load() {
    const params: Record<string, string> = {};
    if (this.active_status()) params['status'] = this.active_status();
    if (this.applied_from()) params['from'] = this.applied_from();
    if (this.applied_to()) params['to'] = this.applied_to();
    this.http_client
      .get<{ applications: Applicant[] }>(`${API_BASE}/jobs/${this.jobId}/applications`, { params })
      .subscribe({
        next: (res) => this.applicants.set(res.applications),
        error: (err: HttpErrorResponse) => {
          // A bad filter is the recruiter's to fix; anything else means no access to this posting.
          if (err.status === 400) this.error.set(err.error?.error ?? 'Invalid filter.');
          else this.forbidden.set(true);
        },
      });
  }
}
