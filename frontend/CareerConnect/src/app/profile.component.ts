import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, API_BASE } from './auth.service';
import { openBlobInNewTab } from './open-blob';

interface Resume {
  id: number;
  originalFilename: string;
  fileType: string;
  uploadedAt: string;
}

// Mirrors backend/src/config.js's ALLOWED_RESUME_TYPES / MAX_RESUME_BYTES so bad files
// are rejected before we even open a connection, with a friendlier message than the API gives.
const ALLOWED_RESUME_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
};
const MAX_RESUME_BYTES = 5 * 1024 * 1024;

// Mirrors backend/src/routes/profile.js, which rejects any profile field over 2000 characters.
export const PROFILE_FIELD_MAX = 2000;
const PROFILE_FIELD_LABELS: Record<string, string> = {
  fullName: 'Full name',
  headline: 'Headline',
  location: 'Location',
  phone: 'Phone',
  bio: 'Bio',
};

// Exported so it can be unit-tested without standing up the whole component.
export function validateResumeFile(file: File): string | null {
  if (!ALLOWED_RESUME_TYPES[file.type]) {
    return 'Resume must be a PDF, DOC or DOCX file.';
  }
  if (file.size > MAX_RESUME_BYTES) {
    return 'Resume must be 5 MB or smaller.';
  }
  return null;
}

export function fileTypeLabel(mimeType: string): string {
  return ALLOWED_RESUME_TYPES[mimeType] ?? mimeType;
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
  resume_error = signal('');
  profile_saved = signal(false);
  profile_error = signal('');
  replacing_id = signal<number | null>(null);

  upload_form: FormGroup;
  profile_form: FormGroup;

  constructor() {
    this.upload_form = this.form_builder.group({ resume: [''] });
    const field = () => ['', Validators.maxLength(PROFILE_FIELD_MAX)];
    this.profile_form = this.form_builder.group({
      fullName: field(),
      headline: field(),
      location: field(),
      phone: field(),
      bio: field(),
    });
  }

  ngOnInit() {
    if (this.user()?.role !== 'recruiter') {
      this.refreshResumes();
    }
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

  // Labels of the fields that are over the length limit, for the inline message.
  tooLongFields(): string[] {
    return Object.keys(PROFILE_FIELD_LABELS)
      .filter((name) => this.profile_form.get(name)?.hasError('maxlength'))
      .map((name) => PROFILE_FIELD_LABELS[name]);
  }

  saveProfile() {
    this.profile_saved.set(false);
    this.profile_error.set('');
    const tooLong = this.tooLongFields();
    if (tooLong.length) {
      this.profile_error.set(`${tooLong.join(', ')}: ${PROFILE_FIELD_MAX} characters max.`);
      return;
    }
    this.http_client.put(`${API_BASE}/profile`, this.profile_form.getRawValue()).subscribe({
      next: () => this.profile_saved.set(true),
      error: (err) => this.profile_error.set(err?.error?.error ?? 'Could not save profile'),
    });
  }

  onFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target && target.files && target.files.length > 0) {
      const file = target.files[0];
      const error = validateResumeFile(file);
      if (error) {
        this.upload_error.set(error);
        target.value = '';
        this.upload_form.get('resume')?.setValue('');
        return;
      }
      this.upload_error.set('');
      this.upload_form.get('resume')?.setValue(file);
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
    if (!confirm('Delete this resume? This cannot be undone.')) return;

    this.resume_error.set('');
    this.http_client.delete(`${API_BASE}/resumes/${id}`).subscribe({
      next: () => this.refreshResumes(),
      error: (err) => this.resume_error.set(err?.error?.error ?? 'Could not delete the resume.'),
    });
  }

  viewResume(id: number) {
    this.resume_error.set('');
    openBlobInNewTab(
      this.http_client.get(`${API_BASE}/resumes/${id}/file`, { responseType: 'blob' }),
      (message) => this.resume_error.set(message),
    );
  }

  startReplace(id: number) {
    this.replacing_id.set(id);
  }

  typeLabel(mimeType: string): string {
    return fileTypeLabel(mimeType);
  }

  onReplaceSelect(event: Event, id: number) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const error = validateResumeFile(file);
    if (error) {
      this.resume_error.set(error);
      this.replacing_id.set(null);
      return;
    }

    const form_data = new FormData();
    form_data.append('resume', file);
    this.resume_error.set('');
    this.http_client.put<{ resume: Resume }>(`${API_BASE}/resumes/${id}`, form_data).subscribe({
      next: () => {
        this.replacing_id.set(null);
        this.refreshResumes();
      },
      error: (err) => {
        // Close the file picker so the user can click Replace again to retry.
        this.replacing_id.set(null);
        this.resume_error.set(err?.error?.error ?? 'Could not replace the resume.');
      },
    });
  }

  private refreshResumes() {
    this.http_client
      .get<{ resumes: Resume[] }>(`${API_BASE}/resumes`)
      .subscribe((res) => this.resumes.set(res.resumes));
  }
}
