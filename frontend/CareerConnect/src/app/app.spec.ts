import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app';
import { AuthService } from './auth.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient()],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the nav brand', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.nav-brand')?.textContent).toContain('CareerConnect');
  });
});

@Component({ template: '' })
class Blank {}

describe('App nav active link', () => {
  const SEEKER = { id: 1, email: 'seeker@test.com', role: 'job_seeker' as const, createdAt: '' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: 'jobs', component: Blank },
          { path: 'applications', component: Blank },
          { path: 'profile', component: Blank },
        ]),
        provideHttpClient(),
        { provide: AuthService, useValue: { currentUser: signal(SEEKER), logout: () => {} } },
      ],
    }).compileComponents();
  });

  async function navLinksAt(url: string): Promise<Record<string, boolean>> {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl(url);
    fixture.detectChanges();
    await fixture.whenStable();
    const links = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.nav-links a'));
    return Object.fromEntries(links.map((a) => [a.textContent!.trim(), a.classList.contains('active')]));
  }

  it('highlights only the link for the current page', async () => {
    expect(await navLinksAt('/applications')).toEqual({ Jobs: false, 'My applications': true, Profile: false });
  });

  it('keeps Jobs highlighted when the search has query params', async () => {
    expect((await navLinksAt('/jobs?keyword=backend'))['Jobs']).toBe(true);
  });
});
