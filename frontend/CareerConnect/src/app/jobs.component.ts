import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { API_BASE } from './auth.service';

export interface JobSummary {
  id: number;
  title: string;
  description: string;
  location: string | null;
  category: string | null;
  deadline: string | null;
  createdAt: string;
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

  jobs = signal<JobSummary[]>([]);
  categories = signal<string[]>([]);
  filter_form: FormGroup;

  constructor() {
    this.filter_form = this.form_builder.group({ keyword: '', location: '', category: '' });
  }

  ngOnInit() {
    this.http_client
      .get<{ categories: string[] }>(`${API_BASE}/jobs/categories`)
      .subscribe((res) => this.categories.set(res.categories));
    this.search();
  }

  search() {
    const { keyword, location, category } = this.filter_form.getRawValue();
    const query: Record<string, string> = {};
    if (keyword) query['keyword'] = keyword;
    if (location) query['location'] = location;
    if (category) query['category'] = category;

    this.http_client
      .get<{ jobs: JobSummary[] }>(`${API_BASE}/jobs`, { params: query })
      .subscribe((res) => this.jobs.set(res.jobs));
  }

  resetFilters() {
    this.filter_form.reset({ keyword: '', location: '', category: '' });
    this.search();
  }

  excerpt(description: string): string {
    return description.length > 140 ? `${description.slice(0, 140)}…` : description;
  }
}
