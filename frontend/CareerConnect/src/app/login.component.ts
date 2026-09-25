import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'login',
  template: `
    <h1> Sign Up / Sign In</h1>
    <p>Username</p>
    <input type="text" [formControl]="user" />
    <p>Password</p>
    <input type="text" [formControl]="pass" />

    <button (click)="redirect()">Login</button>
  `,
  imports: [ReactiveFormsModule],
})

export class Login {
  private router = inject(Router);

  user = new FormControl('');
  pass = new FormControl('');

  redirect() {
    let u = this.user.getRawValue();
    let p = this.pass.getRawValue();

    if (0 == this.authenticate()) {
      this.router.navigateByUrl(`/profile/${u}`);
    }
  }

  authenticate(): number {
    // get password from database and authenticate
    return 0;
  }
}
