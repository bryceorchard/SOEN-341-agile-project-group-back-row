import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { API_BASE } from './auth.service';

export interface Posting {
  id: number;
  title: string;
  description: string;
  location: string | null;
  category: string | null;
  deadline: string | null;
  status: 'open' | 'closed';
  applicationCount: number;
}

@Component({
  selector: 'recruiter-postings',
  templateUrl: './recruiter-postings.component.html',
  styleUrl: './recruiter-postings.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
})
export class RecruiterPostings implements OnInit {
  private http_client = inject(HttpClient);
  private form_builder = inject(FormBuilder);

  postings = signal<Posting[]>([]);
  editing_id = signal<number | null>(null);
  show_create = signal(false);
  create_error = signal('');
  edit_error = signal('');

  create_form: FormGroup;
  edit_form: FormGroup;

  constructor() {
    this.create_form = this.buildForm();
    this.edit_form = this.buildForm();
  }

  ngOnInit() {
    this.refreshPostings();
  }

  onCreate() {
    if (this.create_form.invalid) return;
    this.create_error.set('');

    this.http_client.post<{ job: Posting }>(`${API_BASE}/jobs`, this.formPayload(this.create_form)).subscribe({
      next: () => {
        this.create_form.reset();
        this.show_create.set(false);
        this.refreshPostings();
      },
      error: (err) => this.create_error.set(err?.error?.error ?? 'Could not create posting'),
    });
  }

  startEdit(p: Posting) {
    this.editing_id.set(p.id);
    this.edit_error.set('');
    this.edit_form.setValue({
      title: p.title,
      description: p.description,
      location: p.location ?? '',
      category: p.category ?? '',
      deadline: p.deadline ?? '',
    });
  }

  cancelEdit() {
    this.editing_id.set(null);
  }

  onSaveEdit(id: number) {
    if (this.edit_form.invalid) return;
    this.edit_error.set('');

    this.http_client.put<{ job: Posting }>(`${API_BASE}/jobs/${id}`, this.formPayload(this.edit_form)).subscribe({
      next: () => {
        this.editing_id.set(null);
        this.refreshPostings();
      },
      error: (err) => this.edit_error.set(err?.error?.error ?? 'Could not save posting'),
    });
  }

  toggleStatus(p: Posting) {
    const status = p.status === 'open' ? 'closed' : 'open';
    this.http_client.patch<{ job: Posting }>(`${API_BASE}/jobs/${p.id}/status`, { status }).subscribe({
      next: () => this.refreshPostings(),
    });
  }

  private buildForm(): FormGroup {
    return this.form_builder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      location: [''],
      category: [''],
      deadline: [''],
    });
  }

  private formPayload(form: FormGroup) {
    const { title, description, location, category, deadline } = form.getRawValue();
    return {
      title,
      description,
      location: location || undefined,
      category: category || undefined,
      deadline: deadline || undefined,
    };
  }

  private refreshPostings() {
    this.http_client
      .get<{ jobs: Posting[] }>(`${API_BASE}/jobs/mine`)
      .subscribe((res) => this.postings.set(res.jobs));
  }
}
