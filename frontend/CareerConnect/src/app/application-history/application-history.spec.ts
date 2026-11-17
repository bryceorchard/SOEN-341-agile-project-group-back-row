import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationStatsService } from '../application-stats';

describe('ApplicationStatsService', () => {
  let service: ApplicationStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApplicationStatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});