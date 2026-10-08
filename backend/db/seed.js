import bcrypt from 'bcryptjs';
import { openDb, migrate } from './migrate.js';

const db = openDb();
migrate(db);

const users = [
  { email: 'seeker@example.com', role: 'job_seeker', name: 'Sam Seeker', headline: 'Junior developer' },
  { email: 'recruiter@example.com', role: 'recruiter', name: 'Riley Recruiter', headline: 'Talent acquisition' },
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
const insertJob = db.prepare(
  'INSERT OR IGNORE INTO jobs (id, recruiter_id, title, description, location, category, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)'
);
insertJob.run(1, recruiter.id, 'Junior Software Developer', 'Build and ship features on a small team.', 'Montreal, QC', 'Engineering', '2026-12-31');
insertJob.run(2, recruiter.id, 'QA Analyst', 'Write and run test plans for web applications.', 'Remote', 'Quality Assurance', '2026-11-30');

console.log('Seeded demo users (password: Password123!) and demo jobs');
db.close();
