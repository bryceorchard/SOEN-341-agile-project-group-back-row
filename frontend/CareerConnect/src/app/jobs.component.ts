import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { API_BASE } from './auth.service';

export interface JobSummary {
  id: number;
  title: string;
  description: string;
  location: string | null;
  category: string | null;
  deadline: string | null;
  // Closed postings are hidden from search but can still be opened by id (e.g. from My applications).
  status: 'open' | 'closed';
  createdAt: string;
}

export interface JobFilters {
  keyword?: string | null;
  location?: string | null;
  category?: string | null;
}

// Shared by search() (talks to the API) and the URL sync (talks to the router), and
// exported so the "only non-empty filters make it into the query" rule has its own test.
export function buildJobsQuery(filters: JobFilters): Record<string, string> {
  const query: Record<string, string> = {};
  if (filters.keyword) query['keyword'] = filters.keyword;
  if (filters.location) query['location'] = filters.location;
  if (filters.category) query['category'] = filters.category;
  return query;
}

@Component({
  selector: 'jobs',
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
})
export class Jobs implements OnInit {
  private http_client = inject(HttpClient);
  private form_builder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  jobs = signal<JobSummary[]>([]);
  categories = signal<string[]>([]);
  loading = signal(false);
  error = signal('');
  filter_form: FormGroup;

  constructor() {
    this.filter_form = this.form_builder.group({ keyword: '', location: '', category: '' });
  }

  ngOnInit() {
    this.http_client
      .get<{ categories: string[] }>(`${API_BASE}/jobs/categories`)
      .subscribe((res) => this.categories.set(res.categories));

    // Seed the form from the URL so a shared link or a page reload keeps the same filters.
    const params = this.route.snapshot.queryParams;
    this.filter_form.setValue({
      keyword: params['keyword'] ?? '',
      location: params['location'] ?? '',
      category: params['category'] ?? '',
    });
    this.search();
  }

  search() {
    const query = buildJobsQuery(this.filter_form.getRawValue());
    this.router.navigate([], { relativeTo: this.route, queryParams: query });

    this.loading.set(true);
    this.error.set('');
    this.http_client.get<{ jobs: JobSummary[] }>(`${API_BASE}/jobs`, { params: query }).subscribe({
      next: (res) => {
        this.jobs.set(res.jobs);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load job postings. Please try again.');
        this.loading.set(false);
      },
    });
  }

  resetFilters() {
    this.filter_form.reset({ keyword: '', location: '', category: '' });
    this.search();
  }

  excerpt(description: string): string {
    return description.length > 140 ? `${description.slice(0, 140)}…` : description;
  }
}
