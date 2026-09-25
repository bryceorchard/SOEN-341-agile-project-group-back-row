import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'profile',
  template: `
    <h1>{{ user() }}</h1>

    <form [formGroup]="upload_form" (ngSubmit)="onSubmit()">
      <div>
        <input type="file" name="resume" (change)="onFileSelect($event)" />
      </div>
      <div>
        <button type="submit">Upload</button>
      </div>
    </form>

    <div>{{ resume() }}</div>
  `,
  imports: [ReactiveFormsModule],
})

export class Profile {
  private activated_route = inject(ActivatedRoute);
  private form_builder = inject(FormBuilder);
  private http_client = inject(HttpClient);

  user = signal('');
  resume = signal('');

  constructor() {
    this.activated_route.params.subscribe((params) => {
      this.user.set(params['user']);
    });
    this.upload_form = this.form_builder.group({
      resume: ['']
    });
  }

  upload_form: FormGroup;

  onFileSelect(event: Event) {
    const target = (event.target as HTMLInputElement);
    if (target && target.files) {
      if (0 < target.files.length) {
        const file = target.files[0];
        this.upload_form.get('resume')?.setValue(file);
      }
    }
  }

  onSubmit() {
    const form_data = new FormData();
    form_data.append('file', this.upload_form.get('resume')?.value);

    this.http_client.post<string>('/api/resume', form_data).subscribe(
      (res) => this.resume.set(res),
      (err) => {},
    );
  }
}
