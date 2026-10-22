import { Component, OnInit, inject, signal } from '@angular/core';
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

interface ProfileData {
  fullName: string | null;
  headline: string | null;
  location: string | null;
  phone: string | null;
  bio: string | null;
}

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  imports: [CommonModule, ReactiveFormsModule],
})
export class Profile implements OnInit {
  private form_builder = inject(FormBuilder);
  private http_client = inject(HttpClient);
  private auth = inject(AuthService);

  user = this.auth.currentUser;
  resumes = signal<Resume[]>([]);
  upload_error = signal('');
  profile_saved = signal(false);
  replacing_id = signal<number | null>(null);

  upload_form: FormGroup;
  profile_form: FormGroup;

  constructor() {
    this.upload_form = this.form_builder.group({ resume: [''] });
    this.profile_form = this.form_builder.group({
      fullName: [''],
      headline: [''],
      location: [''],
      phone: [''],
      bio: [''],
    });
  }

  ngOnInit() {
    this.refreshResumes();
    this.http_client.get<{ profile: ProfileData }>(`${API_BASE}/profile`).subscribe((res) => {
      this.profile_form.patchValue({
        fullName: res.profile.fullName ?? '',
        headline: res.profile.headline ?? '',
        location: res.profile.location ?? '',
        phone: res.profile.phone ?? '',
        bio: res.profile.bio ?? '',
      });
    });
  }

  saveProfile() {
    this.profile_saved.set(false);
    this.http_client.put(`${API_BASE}/profile`, this.profile_form.getRawValue()).subscribe({
      next: () => this.profile_saved.set(true),
    });
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
      next: () => {
        this.upload_form.reset();
        this.refreshResumes();
      },
      error: (err) => this.upload_error.set(err?.error?.error ?? 'Upload failed'),
    });
  }

  deleteResume(id: number) {
    this.http_client.delete(`${API_BASE}/resumes/${id}`).subscribe({
      next: () => this.refreshResumes(),
    });
  }

  viewResume(id: number) {
    this.http_client.get(`${API_BASE}/resumes/${id}/file`, { responseType: 'blob' }).subscribe((blob) => {
      window.open(URL.createObjectURL(blob), '_blank');
    });
  }

  startReplace(id: number) {
    this.replacing_id.set(id);
  }

  onReplaceSelect(event: Event, id: number) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const form_data = new FormData();
    form_data.append('resume', file);
    this.http_client.put<{ resume: Resume }>(`${API_BASE}/resumes/${id}`, form_data).subscribe({
      next: () => {
        this.replacing_id.set(null);
        this.refreshResumes();
      },
    });
  }

  private refreshResumes() {
    this.http_client
      .get<{ resumes: Resume[] }>(`${API_BASE}/resumes`)
      .subscribe((res) => this.resumes.set(res.resumes));
  }
}
