// Job seeker application analytics (#134, US-21). Pure so the arithmetic can be tested
// against a fixed "now"; GET /applications/stats loads the rows and calls this.

export const STATUSES = ['Applied', 'Under Review', 'Interview', 'Offered', 'Rejected'];
export const WEEKS = 8;

const DAY = 24 * 60 * 60 * 1000;

// SQLite's datetime('now') gives 'YYYY-MM-DD HH:MM:SS' in UTC.
export const parseDbTime = (s) => new Date(s.includes('T') ? s : `${s.replace(' ', 'T')}Z`);

const percent = (part, total) => (total === 0 ? 0 : Math.round((part / total) * 1000) / 10);
const isoDate = (ms) => new Date(ms).toISOString().slice(0, 10);

// rows: [{ status, appliedAt, responded, jobOpen }]
//   responded: the application has ever had a status other than Applied
//   jobOpen:   the posting is open and not archived
export function computeStats(rows, now = new Date()) {
  const total = rows.length;
  const nowMs = now.getTime();
  const applied = rows.map((r) => parseDbTime(r.appliedAt).getTime());

  const byStatus = STATUSES.map((status) => {
    const count = rows.filter((r) => r.status === status).length;
    return { status, count, percent: percent(count, total) };
  });

  const responded = rows.filter((r) => r.responded).length;

  // Weeks start on Monday (UTC). The last entry is the current, partial week.
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const thisMonday = today - ((now.getUTCDay() + 6) % 7) * DAY;
  const perWeek = [];
  for (let i = WEEKS - 1; i >= 0; i--) {
    const start = thisMonday - i * 7 * DAY;
    const end = start + 7 * DAY;
    perWeek.push({ weekStart: isoDate(start), count: applied.filter((t) => t >= start && t < end).length });
  }

  const open = rows.filter((r) => r.jobOpen).length;

  return {
    total,
    byStatus,
    submittedLast7Days: applied.filter((t) => t > nowMs - 7 * DAY).length,
    submittedLast30Days: applied.filter((t) => t > nowMs - 30 * DAY).length,
    responded,
    responseRate: percent(responded, total),
    perWeek,
    postings: { open, closed: total - open },
  };
}
