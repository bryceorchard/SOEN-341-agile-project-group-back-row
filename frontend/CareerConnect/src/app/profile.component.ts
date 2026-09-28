import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'profile',
  template: `
    <h1>{{ user() }}</h1>

    <input type="file" #fileInput (change)="upload_resume(fileInput.files)" />

    <div>{{ resume() }}</div>
  `,
})

export class Profile {
  user = signal('');
  private activatedRoute = inject(ActivatedRoute);

  resume = signal('');

  constructor() {
    this.activatedRoute.params.subscribe((params) => {
      this.user.set(params['user']);
    });
  }

  upload_resume(file_list: FileList | null) {
    const file = file_list?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        let resume = reader.result as string;
        this.resume.set(resume);
      };

      reader.readAsText(file);

    // store resume bytes to database
    // for now, it just prints the file contents
    }
  }
}
