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

const seeker = db.prepare('SELECT id FROM users WHERE email = ?').get('seeker@example.com');
const insertApplication = db.prepare(
  "INSERT OR IGNORE INTO applications (user_id, job_id, status) VALUES (?, ?, ?)"
);
const applications = [
  [1, 'Applied'],
  [3, 'Under Review'],
  [6, 'Interview'],
  [9, 'Offered'],
  [11, 'Rejected'],
];
for (const [jobId, status] of applications) {
  insertApplication.run(seeker.id, jobId, status);
}

console.log('Seeded demo users (password: Password123!), demo jobs, and demo applications');
db.close();
