import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, API_BASE } from './auth.service';
import { openBlobInNewTab } from './open-blob';
import { parseServerTime } from './notification.service';

interface Resume {
  id: number;
  originalFilename: string;
  fileType: string;
  uploadedAt: string;
}

export interface Feedback {
  resumeId: number;
  createdAt: string;
  model: string;
  promptVersion: string;
  isResume: boolean;
  summary: string;
  strengths: { point: string; evidence: string }[];
  improvements: { section: string; priority: string; excerpt: string; issue: string; suggestion: string }[];
  rewordings: { section: string; original: string; suggested: string; reason: string }[];
}

type Improvement = Feedback['improvements'][number];

export interface ImprovementGroup {
  section: string;
  items: Improvement[];
}

// Section values come from SECTIONS in backend/src/ai/feedback-schema.js (#141).
const SECTION_LABELS: Record<string, string> = {
  contact: 'Contact',
  profile: 'Profile / summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  formatting: 'Formatting',
  other: 'Other',
};

export function sectionLabel(section: string): string {
  return SECTION_LABELS[section] ?? section;
}

// Improvements arrive sorted by priority. Grouping keeps sections in order of first
// appearance, so the section with the most urgent item comes first
// (docs/ai/us10-resume-feedback.md, "UI (#140)").
export function groupImprovements(improvements: Improvement[]): ImprovementGroup[] {
  const groups = new Map<string, Improvement[]>();
  for (const item of improvements) {
    const items = groups.get(item.section) ?? [];
    items.push(item);
    groups.set(item.section, items);
  }
  return Array.from(groups, ([section, items]) => ({ section, items }));
}

export interface TextPart {
  text: string;
  placeholder: boolean;
}

// The model writes "[number of users]" etc. for figures the resume doesn't give. Split
// text so the template can highlight those placeholders.
const PLACEHOLDER = /\[[^[\]\n]+\]/g;

export function splitPlaceholders(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const match of text.matchAll(PLACEHOLDER)) {
    const start = match.index ?? 0;
    if (start > last) parts.push({ text: text.slice(last, start), placeholder: false });
    parts.push({ text: match[0], placeholder: true });
    last = start + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), placeholder: false });
  return parts;
}

export function hasPlaceholder(text: string): boolean {
  return new RegExp(PLACEHOLDER.source).test(text);
}

const ALLOWED_RESUME_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
};
const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export const PROFILE_FIELD_MAX = 2000;
const PROFILE_FIELD_LABELS: Record<string, string> = {
  fullName: 'Full name',
  headline: 'Headline',
  location: 'Location',
  phone: 'Phone',
  bio: 'Bio',
};

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

  active_feedback_id = signal<number | null>(null);
  // What is loading: saved feedback (GET, quick) or a new AI request (POST, several seconds).
  feedback_loading = signal<'load' | 'generate' | null>(null);
  feedback_error = signal('');
  // 'load': GET failed, so we don't know whether saved feedback exists; retry the GET.
  // 'generate': POST failed; any earlier feedback is still shown (nothing was saved).
  feedback_error_kind = signal<'load' | 'generate' | null>(null);
  current_feedback = signal<Feedback | null>(null);

  improvement_groups = computed(() => groupImprovements(this.current_feedback()?.improvements ?? []));
  has_placeholders = computed(() => {
    const fb = this.current_feedback();
    if (!fb) return false;
    return (
      fb.rewordings.some((rw) => hasPlaceholder(rw.suggested)) ||
      fb.improvements.some((imp) => hasPlaceholder(imp.suggestion))
    );
  });

  // Feedback per resume id; null = checked, none saved yet. Requests in flight are tracked
  // per resume so a reply for one resume never lands in another resume's open panel.
  private feedback_cache = new Map<number, Feedback | null>();
  private pending_generate = new Set<number>();

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
      next: () => {
        this.forgetFeedback(id);
        this.refreshResumes();
      },
      error: (err) => this.resume_error.set(err?.error?.error ?? 'Could not delete the resume.'),
    });
  }

  viewResume(id: number, filename: string) {
    this.resume_error.set('');
    openBlobInNewTab(
      this.http_client.get(`${API_BASE}/resumes/${id}/file`, { responseType: 'blob' }),
      filename,
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
        // The backend deletes a resume's feedback when its file is replaced.
        this.forgetFeedback(id);
        this.refreshResumes();
      },
      error: (err) => {
        this.replacing_id.set(null);
        this.resume_error.set(err?.error?.error ?? 'Could not replace the resume.');
      },
    });
  }

  toggleFeedback(id: number) {
    if (this.active_feedback_id() === id) {
      this.active_feedback_id.set(null);
      return;
    }
    this.active_feedback_id.set(id);

    this.feedback_error.set('');
    this.feedback_error_kind.set(null);
    this.current_feedback.set(this.feedback_cache.get(id) ?? null);
    if (this.pending_generate.has(id)) {
      this.feedback_loading.set('generate');
    } else if (this.feedback_cache.has(id)) {
      this.feedback_loading.set(null);
    } else {
      this.loadFeedback(id);
    }
  }

  // GET /resumes/:id/feedback: reopens saved feedback without a new AI request.
  loadFeedback(id: number) {
    this.feedback_loading.set('load');
    this.feedback_error.set('');
    this.feedback_error_kind.set(null);

    this.http_client.get<{ feedback: Feedback | null }>(`${API_BASE}/resumes/${id}/feedback`).subscribe({
      next: (res) => {
        this.feedback_cache.set(id, res.feedback);
        if (this.active_feedback_id() !== id) return;
        this.current_feedback.set(res.feedback);
        this.feedback_loading.set(null);
      },
      error: (err) => {
        if (this.active_feedback_id() !== id) return;
        this.feedback_error.set(err?.error?.error ?? 'Could not load saved feedback.');
        this.feedback_error_kind.set('load');
        this.feedback_loading.set(null);
      },
    });
  }

  // POST /resumes/:id/feedback: new AI request. On error the backend saves nothing, so any
  // earlier feedback stays on screen (AT-3).
  generateFeedback(id: number) {
    this.pending_generate.add(id);
    this.feedback_loading.set('generate');
    this.feedback_error.set('');
    this.feedback_error_kind.set(null);

    this.http_client.post<{ feedback: Feedback }>(`${API_BASE}/resumes/${id}/feedback`, {}).subscribe({
      next: (res) => {
        this.pending_generate.delete(id);
        this.feedback_cache.set(id, res.feedback);
        if (this.active_feedback_id() !== id) return;
        this.current_feedback.set(res.feedback);
        this.feedback_loading.set(null);
      },
      error: (err) => {
        this.pending_generate.delete(id);
        if (this.active_feedback_id() !== id) return;
        this.feedback_error.set(err?.error?.error ?? 'Could not generate feedback. Please try again.');
        this.feedback_error_kind.set('generate');
        this.feedback_loading.set(null);
      },
    });
  }

  generatedAt(createdAt: string): Date {
    return parseServerTime(createdAt);
  }

  sectionLabel(section: string): string {
    return sectionLabel(section);
  }

  textParts(text: string): TextPart[] {
    return splitPlaceholders(text);
  }

  private forgetFeedback(id: number) {
    this.feedback_cache.delete(id);
    if (this.active_feedback_id() === id) this.active_feedback_id.set(null);
  }

  private refreshResumes() {
    this.http_client
      .get<{ resumes: Resume[] }>(`${API_BASE}/resumes`)
      .subscribe((res) => this.resumes.set(res.resumes));
  }
}
