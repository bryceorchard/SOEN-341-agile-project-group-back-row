import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';

@Component({
  selector: 'login',
  template: `
  <div class="login">
    <h1>Sign In / Sign Up</h1>
    <div class="login-email">
      <input class="login-button" placeholder="email" type="text" [formControl]="user" />
    </div>

    <div class="login-password">
      <input class="login-button" placeholder="password" type="password" [formControl]="pass" />
    </div>

    <div class="login-submit-buttons">
      <div><button class="login-button" (click)="login()">Login</button></div>
      <div><button class="login-button" (click)="register()">Register</button></div>
    </div>

    <div *ngIf="WRONG_PASSWORD == display_error" class="error">Wrong email or password</div>
    <div *ngIf="USERNAME_TAKEN == display_error" class="error">Email already registered</div>
    <div *ngIf="OTHER_ERROR == display_error" class="error">Something went wrong, try again</div>
  </div>
  `,
  styles: `
    .login {
      justify-items: center;
      top: 25%;
      position: absolute;
      left: 40%;
      border-radius: 10px;
      background: white;
      padding: 15px;
    }
    .login-email {
      margin-bottom: 20px;
    }
    .login-password {
      margin-bottom: 20px;
    }
    .login-submit-buttons {
      display: flex;
      width: 20vw;
      flex-wrap: balance;
      justify-content: space-evenly;
    }
    .login-button {
      border-radius: 10px;
      border-color: white;
      border-width: thin;
      background: midnightblue;
      color: white;
      padding: 5px;
    }
    .login-button::placeholder {
      color: white;
    }
    .login-button:hover {
      color: grey;
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
