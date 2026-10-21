import { Routes } from '@angular/router';
import { Login } from './login.component';
import { Profile } from './profile.component';
import { RecruiterPostings } from './recruiter-postings.component';

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
    // Recruiter-only check is done inline in the component for now; swap in the
    // real role guard from #73 once the shared app shell/guards land.
    path: 'recruiter/postings',
    component: RecruiterPostings,
  },
  {
    path: '**',
    redirectTo: '/login',
  }
];
