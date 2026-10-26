import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, AuthUser } from './auth.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [CommonModule, ReactiveFormsModule],
})
export class Login {
  private router = inject(Router);
  private auth = inject(AuthService);

  user = new FormControl('');
  pass = new FormControl('');
  role = new FormControl<AuthUser['role']>('job_seeker');

  USERNAME_TAKEN = 1;
  WRONG_PASSWORD = 2;
  OTHER_ERROR = 3;
  INVALID_EMAIL = 4;
  
  display_error = signal(0);
  backend_error = signal('');

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  login() {
    const email = this.user.getRawValue() ?? '';
    const password = this.pass.getRawValue() ?? '';

    if (!this.isValidEmail(email)) {
      this.display_error.set(this.INVALID_EMAIL);
      return;
    }
    this.display_error.set(0);
    this.backend_error.set('');

    this.auth.login(email, password).subscribe({
      next: (res) => this.redirectByRole(res.user.role),
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.display_error.set(this.WRONG_PASSWORD);
          return;
        }
        if (err.status === 400) {
          this.backend_error.set(err.error?.error ?? 'Invalid login details');
          this.display_error.set(this.OTHER_ERROR);
          return;
        }
        this.display_error.set(this.OTHER_ERROR);
      },
    });
  }

  register() {
    const email = this.user.getRawValue() ?? '';
    const password = this.pass.getRawValue() ?? '';
    const role = this.role.getRawValue() ?? 'job_seeker';

    if (!this.isValidEmail(email)) {
      this.display_error.set(this.INVALID_EMAIL);
      return;
    }
    this.display_error.set(0);
    this.backend_error.set('');

    this.auth.register(email, password, role).subscribe({
      next: (res) => this.redirectByRole(res.user.role),
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.display_error.set(this.USERNAME_TAKEN);
          return;
        }
        if (err.status === 400) {
          this.backend_error.set(err.error?.error ?? 'Invalid registration details');
          this.display_error.set(this.OTHER_ERROR);
          return;
        }
        this.display_error.set(this.OTHER_ERROR);
      },
    });
  }

  private redirectByRole(role: AuthUser['role']) {
    this.router.navigateByUrl(role === 'recruiter' ? '/recruiter/postings' : '/jobs');
  }
}
