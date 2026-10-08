import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService, API_BASE } from './auth.service';

interface Resume {
  id: number;
  originalFilename: string;
  fileType: string;
  uploadedAt: string;
}

@Component({
  selector: 'profile',
  template: `
  <div class="profile-upload">
    <h1>Welcome, {{ user() }}!</h1>

    <div>
      <form class="profile-upload-form "[formGroup]="upload_form" (ngSubmit)="onSubmit()">
        <div>
          <input class="profile-button" type="file" name="resume" (change)="onFileSelect($event)" />
        </div>
        <div>
          <button class="profile-button" type="submit">Upload</button>
        </div>
      </form>
    </div>

    <div *ngIf="upload_error()" class="error">{{ upload_error() }}</div>
  </div>

  <div class="profile-display">
    <h2>Your resumes</h2>
    <div class="profile-resume">
      <ul>
        <li *ngFor="let r of resumes()">
          {{ r.originalFilename }}
          <button class="profile-button" (click)="deleteResume(r.id)">Delete</button>
        </li>
      </ul>
    </div>
  </div>
  `,
  styles: `
    .profile-upload {
      justify-items: center;
      border-radius: 10px;
      background: white;
      padding: 15px;
      margin-bottom: 20px;
    }
    .profile-upload-form {
      display: flex;
      justify-items: center;
    }
    .profile-button {
      border-radius: 10px;
      border-color: white;
      border-width: thin;
      background: midnightblue;
      color: white;
      padding: 5px;
    }
    input[type="file"]::file-selector-button {
      display: none;
    }
    .profile-display {
      justify-items: center;
      border-radius: 10px;
      background: white;
      padding: 15px;
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
export class Profile implements OnInit {
  private activated_route = inject(ActivatedRoute);
  private router = inject(Router);
  private form_builder = inject(FormBuilder);
  private http_client = inject(HttpClient);
  private auth = inject(AuthService);

  user = signal('');
  resumes = signal<Resume[]>([]);
  upload_error = signal('');

  upload_form: FormGroup;

  constructor() {
    this.activated_route.params.subscribe((params) => {
      this.user.set(params['user']);
    });
    this.upload_form = this.form_builder.group({
      resume: [''],
    });
  }

  ngOnInit() {
    // The backend reads the user from the JWT, not from the URL, so no token = no access.
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.refreshResumes();
  }

  onFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target && target.files && target.files.length > 0) {
      this.upload_form.get('resume')?.setValue(target.files[0]);
    }
  }

  onSubmit() {
    const file = this.upload_form.get('resume')?.value;
    if (!file) return;

    const form_data = new FormData();
    form_data.append('resume', file);
    this.upload_error.set('');

    this.http_client.post<{ resume: Resume }>(`${API_BASE}/resumes`, form_data).subscribe({
      next: () => this.refreshResumes(),
      error: (err) => this.upload_error.set(err?.error?.error ?? 'Upload failed'),
    });
  }

  deleteResume(id: number) {
    this.http_client.delete(`${API_BASE}/resumes/${id}`).subscribe({
      next: () => this.refreshResumes(),
    });
  }

  private refreshResumes() {
    this.http_client
      .get<{ resumes: Resume[] }>(`${API_BASE}/resumes`)
      .subscribe((res) => this.resumes.set(res.resumes));
  }
}
