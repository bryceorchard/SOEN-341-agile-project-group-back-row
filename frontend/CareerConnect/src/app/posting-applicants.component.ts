import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_BASE } from './auth.service';

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
  applicants = signal<Applicant[]>([]);
  statuses = STATUSES;
  active_status = signal('');
  forbidden = signal(false);

  ngOnInit() {
    this.jobId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  filterBy(status: string) {
    this.active_status.set(status);
    this.load();
  }

  setStatus(applicant: Applicant, status: string) {
    this.http_client.patch(`${API_BASE}/applications/${applicant.id}`, { status }).subscribe({
      next: () => this.load(),
    });
  }

  viewResume(resumeId: number) {
    this.http_client.get(`${API_BASE}/resumes/${resumeId}/file`, { responseType: 'blob' }).subscribe((blob) => {
      window.open(URL.createObjectURL(blob), '_blank');
    });
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
