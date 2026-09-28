import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'login',
  template: `
    <h1> Sign Up / Sign In</h1>
    <p>Username</p>
    <input type="text" [formControl]="user" />
    <p>Password</p>
    <input type="password" [formControl]="pass" />

    <button (click)="login()">Login</button>
    <button (click)="register()">Register</button>

    <div *ngIf="WRONG_PASSWORD == display_error">Wrong Password</div>
    <div *ngIf="USERNAME_TAKEN == display_error">Username Taken</div>
  `,
  imports: [CommonModule, ReactiveFormsModule],
})

export class Login {
  private router = inject(Router);
  private http_client = inject(HttpClient);

  user = new FormControl('');
  pass = new FormControl('');

  USERNAME_TAKEN = 1;
  WRONG_PASSWORD = 2;
  display_error = 0;

  login() {
    let u = this.user.getRawValue();
    let p = this.pass.getRawValue();

    this.http_client.post<string>('/api/login', u).subscribe(
      (res) => {
        if (res == p) {
          this.router.navigateByUrl(`/profile/${u}`);
        }
      },
      (err) => this.display_error = this.WRONG_PASSWORD,
    );
  }

  register() {
    let u = this.user.getRawValue();
    let p = this.pass.getRawValue();

    this.http_client.post<string>('/api/register', u).subscribe(
      (res) => {
        if (res == p) {
          this.router.navigateByUrl(`/profile/${u}`);
        }
      },
      (err) => this.display_error = this.USERNAME_TAKEN,
    );
  }
}
