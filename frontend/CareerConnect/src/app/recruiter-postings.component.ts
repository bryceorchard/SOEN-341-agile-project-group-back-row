import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, API_BASE } from './auth.service';

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
  template: `
  <div class="postings-create">
    <h1>My postings</h1>

    <form class="postings-form" [formGroup]="create_form" (ngSubmit)="onCreate()">
      <div><input class="postings-input" placeholder="Title" formControlName="title" /></div>
      <div><input class="postings-input" placeholder="Description" formControlName="description" /></div>
      <div><input class="postings-input" placeholder="Location (optional)" formControlName="location" /></div>
      <div><input class="postings-input" placeholder="Category (optional)" formControlName="category" /></div>
      <div><input class="postings-input" placeholder="Deadline (optional)" formControlName="deadline" /></div>
      <div><button class="postings-button" type="submit" [disabled]="create_form.invalid">New posting</button></div>
    </form>

    <div *ngIf="create_error()" class="error">{{ create_error() }}</div>
  </div>

  <div class="postings-list">
    <div *ngFor="let p of postings()" class="posting-row">
      <ng-container *ngIf="editing_id() === p.id; else viewRow">
        <form class="postings-form" [formGroup]="edit_form" (ngSubmit)="onSaveEdit(p.id)">
          <div><input class="postings-input" placeholder="Title" formControlName="title" /></div>
          <div><input class="postings-input" placeholder="Description" formControlName="description" /></div>
          <div><input class="postings-input" placeholder="Location (optional)" formControlName="location" /></div>
          <div><input class="postings-input" placeholder="Category (optional)" formControlName="category" /></div>
          <div><input class="postings-input" placeholder="Deadline (optional)" formControlName="deadline" /></div>
          <button class="postings-button" type="submit" [disabled]="edit_form.invalid">Save</button>
          <button class="postings-button" type="button" (click)="cancelEdit()">Cancel</button>
        </form>
      </ng-container>

      <ng-template #viewRow>
        <strong>{{ p.title }}</strong> — {{ p.status }} — {{ p.applicationCount }} application(s)
        <button class="postings-button" (click)="startEdit(p)">Edit</button>
        <button class="postings-button" (click)="toggleStatus(p)">{{ p.status === 'open' ? 'Close' : 'Reopen' }}</button>
      </ng-template>
    </div>

    <div *ngIf="edit_error()" class="error">{{ edit_error() }}</div>
  </div>
  `,
  styles: `
    .postings-create, .postings-list {
      justify-items: center;
      border-radius: 10px;
      background: white;
      padding: 15px;
      margin-bottom: 20px;
    }
    .postings-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .postings-input {
      padding: 5px;
    }
    .postings-button {
      border-radius: 10px;
      border-color: white;
      border-width: thin;
      background: midnightblue;
      color: white;
      padding: 5px;
    }
    .posting-row {
      padding: 8px 0;
      border-bottom: 1px solid #ddd;
    }
    .error {
      background: red;
      color: white;
      margin-top: 20px;
      border-radius: 10px;
      padding: 5px;
    }
  `,
  imports: [CommonModule, ReactiveFormsModule],
})
export class RecruiterPostings implements OnInit {
  private router = inject(Router);
  private http_client = inject(HttpClient);
  private form_builder = inject(FormBuilder);
  private auth = inject(AuthService);

  postings = signal<Posting[]>([]);
  editing_id = signal<number | null>(null);
  create_error = signal('');
  edit_error = signal('');

  create_form: FormGroup;
  edit_form: FormGroup;

  constructor() {
    this.create_form = this.buildForm();
    this.edit_form = this.buildForm();
  }

  ngOnInit() {
    // TODO: swap for the role guard landing with #73 — this manual check is a stand-in
    // so recruiter-only access works before the shared app shell/guards exist.
    const user = this.auth.getUser();
    if (!this.auth.isLoggedIn() || user?.role !== 'recruiter') {
      this.router.navigateByUrl('/login');
      return;
    }
    this.refreshPostings();
  }

  onCreate() {
    if (this.create_form.invalid) return;
    this.create_error.set('');

    this.http_client.post<{ job: Posting }>(`${API_BASE}/jobs`, this.formPayload(this.create_form)).subscribe({
      next: () => {
        this.create_form.reset();
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
