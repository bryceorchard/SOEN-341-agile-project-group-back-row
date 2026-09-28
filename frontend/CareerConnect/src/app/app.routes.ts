import { Routes } from '@angular/router';
import { Login } from './login.component';
import { Profile } from './profile.component';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'profile/:user',
    component: Profile,
  },
  {
    path: '**',
    redirectTo: '/login',
  }
];
