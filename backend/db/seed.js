import bcrypt from 'bcryptjs';
import { openDb, migrate } from './migrate.js';

const db = openDb();
migrate(db);

const users = [
  { email: 'seeker@example.com', role: 'job_seeker', name: 'Sam Seeker', headline: 'Junior developer' },
  { email: 'recruiter@example.com', role: 'recruiter', name: 'Riley Recruiter', headline: 'Talent acquisition' },
  { email: 'recruiter2@example.com', role: 'recruiter', name: 'Morgan Hiring', headline: 'Hiring manager' },
];

const insertUser = db.prepare(
  'INSERT OR IGNORE INTO users (email, password_hash, role) VALUES (?, ?, ?)'
);
const insertProfile = db.prepare(
  'INSERT OR IGNORE INTO profiles (user_id, full_name, headline) VALUES (?, ?, ?)'
);

for (const u of users) {
  insertUser.run(u.email, bcrypt.hashSync('Password123!', 10), u.role);
  const { id } = db.prepare('SELECT id FROM users WHERE email = ?').get(u.email);
  insertProfile.run(id, u.name, u.headline);
}

const recruiter = db.prepare('SELECT id FROM users WHERE email = ?').get('recruiter@example.com');
const recruiter2 = db.prepare('SELECT id FROM users WHERE email = ?').get('recruiter2@example.com');
const insertJob = db.prepare(
  'INSERT OR IGNORE INTO jobs (id, recruiter_id, title, description, location, category, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)'
);

const jobs = [
  [1, recruiter, 'Junior Software Developer', 'Build and ship features on a small team.', 'Montreal, QC', 'Engineering', '2026-12-31'],
  [2, recruiter, 'QA Analyst', 'Write and run test plans for web applications.', 'Remote', 'Quality Assurance', '2026-11-30'],
  [3, recruiter, 'Senior Backend Engineer', 'Own the API layer for a growing product.', 'Toronto, ON', 'Engineering', '2026-12-15'],
  [4, recruiter2, 'UX/UI Designer', 'Design flows and interfaces for our web app.', 'Remote', 'Design', '2026-11-20'],
  [5, recruiter2, 'Product Manager', 'Drive the roadmap for the job search platform.', 'Montreal, QC', 'Product', '2026-12-10'],
  [6, recruiter, 'Data Analyst', 'Turn application funnel data into insights.', 'Ottawa, ON', 'Data', '2026-12-05'],
  [7, recruiter2, 'Marketing Coordinator', 'Run campaigns to grow our job seeker base.', 'Toronto, ON', 'Marketing', '2026-11-25'],
  [8, recruiter2, 'Customer Support Specialist', 'Help users with account and application issues.', 'Remote', 'Customer Support', '2026-11-15'],
  [9, recruiter, 'DevOps Engineer', 'Manage CI/CD and cloud infrastructure.', 'Vancouver, BC', 'Engineering', '2026-12-20'],
  [10, recruiter2, 'Sales Representative', 'Sell recruiter subscriptions to local businesses.', 'Montreal, QC', 'Sales', '2026-11-30'],
  [11, recruiter, 'Financial Analyst', 'Support budgeting and forecasting for the team.', 'Toronto, ON', 'Finance', '2026-12-08'],
  [12, recruiter2, 'Operations Coordinator', 'Keep day-to-day operations running smoothly.', 'Remote', 'Operations', '2026-12-01'],
  [13, recruiter, 'Frontend Developer', 'Build the Angular UI job seekers use daily.', 'Montreal, QC', 'Engineering', '2026-12-18'],
  [14, recruiter2, 'Graphic Designer', 'Design marketing assets and brand visuals.', 'Remote', 'Design', '2026-11-28'],
];
for (const [id, owner, title, description, location, category, deadline] of jobs) {
  insertJob.run(id, owner.id, title, description, location, category, deadline);
}

// A posting that always closes in two days, so the deadline-reminder demo works whenever the DB is
// seeded. Its deadline is refreshed on every seed run, since INSERT OR IGNORE keeps the old row.
const closingSoon = new Date();
closingSoon.setDate(closingSoon.getDate() + 2);
const closingSoonDeadline = [
  closingSoon.getFullYear(),
  String(closingSoon.getMonth() + 1).padStart(2, '0'),
  String(closingSoon.getDate()).padStart(2, '0'),
].join('-');
insertJob.run(15, recruiter.id, 'Junior QA Automation Tester', 'Automate regression tests for our web app.', 'Montreal, QC', 'Quality Assurance', closingSoonDeadline);
db.prepare('UPDATE jobs SET deadline = ? WHERE id = 15').run(closingSoonDeadline);

const seeker = db.prepare('SELECT id FROM users WHERE email = ?').get('seeker@example.com');
const insertApplication = db.prepare(
  "INSERT OR IGNORE INTO applications (user_id, job_id, status, applied_at, updated_at) VALUES (?, ?, ?, datetime('now', ?), datetime('now', ?))"
);
const insertHistory = db.prepare(
  "INSERT INTO application_status_history (application_id, status, changed_at, changed_by) VALUES (?, ?, datetime('now', ?), ?)"
);
// [jobId, days ago applied, later status changes as [status, days ago]]. Spread over several
// weeks so the analytics dashboard (#134/#135) has something to show; the last change is the
// application's current status.
const applications = [
  [1, 2, []],
  [3, 9, [['Under Review', 6]]],
  [6, 20, [['Under Review', 16], ['Interview', 10]]],
  [9, 40, [['Under Review', 35], ['Interview', 28], ['Offered', 14]]],
  [11, 27, [['Under Review', 24], ['Rejected', 21]]],
  [15, 1, []],
];
const ago = (days) => `-${days} days`;
for (const [jobId, appliedDaysAgo, changes] of applications) {
  const status = changes.at(-1)?.[0] ?? 'Applied';
  const updatedDaysAgo = changes.at(-1)?.[1] ?? appliedDaysAgo;
  const { changes: inserted, lastInsertRowid } = insertApplication.run(
    seeker.id, jobId, status, ago(appliedDaysAgo), ago(updatedDaysAgo)
  );
  if (!inserted) continue; // already seeded; leave its history alone

  const { recruiter_id: jobRecruiter } = db.prepare('SELECT recruiter_id FROM jobs WHERE id = ?').get(jobId);
  insertHistory.run(lastInsertRowid, 'Applied', ago(appliedDaysAgo), seeker.id);
  for (const [changedTo, daysAgo] of changes) insertHistory.run(lastInsertRowid, changedTo, ago(daysAgo), jobRecruiter);
}

console.log('Seeded demo users (password: Password123!), demo jobs, and demo applications');
db.close();
