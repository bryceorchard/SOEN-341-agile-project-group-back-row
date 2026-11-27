import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from './auth.service';
import { Application, ApplicationStats, HistoryEntry } from './application-stats.model';

@Injectable({ providedIn: 'root' })
export class ApplicationStatsService {
  private http = inject(HttpClient);

  stats() {
    return this.http.get<{ stats: ApplicationStats }>(`${API_BASE}/applications/stats`);
  }

  history(id: number) {
    return this.http.get<{ history: HistoryEntry[] }>(`${API_BASE}/applications/${id}/history`);
  }

  applications() {
    return this.http.get<{ applications: Application[] }>(`${API_BASE}/applications`);
  }
}
