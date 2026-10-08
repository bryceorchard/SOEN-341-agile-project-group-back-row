import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';

@Component({
  selector: 'login',
  template: `
    <h1> Sign Up / Sign In</h1>
    <p>Email</p>
    <input type="text" [formControl]="user" />
    <p>Password</p>
    <input type="password" [formControl]="pass" />

    <button (click)="login()">Login</button>
    <button (click)="register()">Register</button>

    <div *ngIf="WRONG_PASSWORD == display_error">Wrong email or password</div>
    <div *ngIf="USERNAME_TAKEN == display_error">Email already registered</div>
    <div *ngIf="OTHER_ERROR == display_error">Something went wrong, try again</div>
  `,
  imports: [CommonModule, ReactiveFormsModule],
})
export class Login {
  private router = inject(Router);
  private auth = inject(AuthService);

  user = new FormControl('');
  pass = new FormControl('');

  USERNAME_TAKEN = 1;
  WRONG_PASSWORD = 2;
  OTHER_ERROR = 3;
  display_error = 0;

  login() {
    const email = this.user.getRawValue() ?? '';
    const password = this.pass.getRawValue() ?? '';
    this.display_error = 0;

    this.auth.login(email, password).subscribe({
      next: (res) => this.router.navigateByUrl(`/profile/${res.user.email}`),
      error: (err: HttpErrorResponse) =>
        (this.display_error = err.status === 401 ? this.WRONG_PASSWORD : this.OTHER_ERROR),
    });
  }

  register() {
    const email = this.user.getRawValue() ?? '';
    const password = this.pass.getRawValue() ?? '';
    this.display_error = 0;

    this.auth.register(email, password).subscribe({
      next: (res) => this.router.navigateByUrl(`/profile/${res.user.email}`),
      error: (err: HttpErrorResponse) =>
        (this.display_error = err.status === 409 ? this.USERNAME_TAKEN : this.OTHER_ERROR),
    });
  }
}
