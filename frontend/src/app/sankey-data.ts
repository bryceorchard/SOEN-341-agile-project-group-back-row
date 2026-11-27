import { SankeySpec } from './chart-adapter';
import { Application } from './application-stats.model';

export interface SankeyPeriod { label: string; days: number; }

export const PERIODS: SankeyPeriod[] = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last year', days: 365 },
];

const STATUSES = ['Applied', 'Under Review', 'Interview', 'Offered', 'Rejected'];

// SQLite gives "YYYY-MM-DD HH:MM:SS" in UTC with no timezone marker.
const parseUtc = (s: string) => new Date(s.replace(' ', 'T') + 'Z');

export function buildSankey(apps: Application[], period: SankeyPeriod, now = new Date()): SankeySpec {
  const cutoff = now.getTime() - period.days * 24 * 60 * 60 * 1000;
  const inPeriod = apps.filter((a) => parseUtc(a.appliedAt).getTime() >= cutoff);

  const flows = STATUSES
    .map((status) => ({
      from: 'Submitted',
      to: status,
      value: inPeriod.filter((a) => a.status === status).length,
    }))
    .filter((f) => f.value > 0);

  return { title: `${period.label} (${inPeriod.length} applications)`, flows };
}
