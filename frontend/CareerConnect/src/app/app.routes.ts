import { Routes } from '@angular/router';
import { Login } from './login.component';
import { Profile } from './profile.component';
import { Jobs } from './jobs.component';
import { JobDetail } from './job-detail.component';
import { MyApplications } from './my-applications.component';
import { RecruiterPostings } from './recruiter-postings.component';
import { PostingApplicants } from './posting-applicants.component';
import { authGuard, roleGuard } from './guards';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard],
  },
  {
    path: 'jobs',
    component: Jobs,
  },
  {
    path: 'jobs/:id',
    component: JobDetail,
  },
  {
    path: 'applications',
    component: MyApplications,
    canActivate: [authGuard, roleGuard('job_seeker')],
  },
  {
    path: 'recruiter/postings',
    component: RecruiterPostings,
    canActivate: [authGuard, roleGuard('recruiter')],
  },
  {
    path: 'recruiter/postings/:id/applicants',
    component: PostingApplicants,
    canActivate: [authGuard, roleGuard('recruiter')],
  },
  {
    path: '',
    redirectTo: '/jobs',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/jobs',
  },
];
