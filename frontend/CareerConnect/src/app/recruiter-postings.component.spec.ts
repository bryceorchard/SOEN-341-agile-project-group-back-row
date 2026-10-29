import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RecruiterPostings } from './recruiter-postings.component';
import { AuthService } from './auth.service';

describe('RecruiterPostings form validation', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruiterPostings],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: () => true,
            getUser: () => ({ id: 1, email: 'r@test.com', role: 'recruiter', createdAt: '' }),
          },
        },
      ],
    }).compileComponents();
  });

  it('rejects an empty title or description', () => {
    const fixture = TestBed.createComponent(RecruiterPostings);
    const form = fixture.componentInstance.create_form;

    form.setValue({ title: '', description: '', location: '', category: '', deadline: '' });
    expect(form.invalid).toBe(true);

    form.setValue({ title: 'Backend Developer', description: '', location: '', category: '', deadline: '' });
    expect(form.invalid).toBe(true);
  });

  it('accepts a title and description with optional fields blank', () => {
    const fixture = TestBed.createComponent(RecruiterPostings);
    const form = fixture.componentInstance.create_form;

    form.setValue({
      title: 'Backend Developer',
      description: 'Work on the API',
      location: '',
      category: '',
      deadline: '',
    });
    expect(form.valid).toBe(true);
  });
});
