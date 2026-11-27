import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationStatsService } from './application-stats';
import { API_BASE } from './auth.service';

describe('ApplicationStatsService', () => {
  let service: ApplicationStatsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApplicationStatsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('calls the stats, history and applications endpoints', () => {
    service.stats().subscribe();
    service.history(7).subscribe();
    service.applications().subscribe();

    http.expectOne(`${API_BASE}/applications/stats`).flush({ stats: {} });
    http.expectOne(`${API_BASE}/applications/7/history`).flush({ history: [] });
    http.expectOne(`${API_BASE}/applications`).flush({ applications: [] });
  });
});
