import { DEADLINE_REMINDER_DAYS } from './config.js';
import { notify } from './notify.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// Midnight (server local time) of the calendar day a date falls on.
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Deadlines come from a date input as "YYYY-MM-DD" and mean "apply by the end of that day".
// new Date('YYYY-MM-DD') would read that as UTC midnight, which is the evening before in
// Montréal, so a date-only deadline is read as a local calendar date instead.
// Returns null for a missing or unparseable deadline (the API accepts free text).
export function parseDeadline(deadline) {
  if (!deadline) return null;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(deadline);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(deadline);
  return Number.isNaN(date.getTime()) ? null : startOfDay(date);
}

// Whole calendar days from `now` until the deadline: 0 on the deadline day itself,
// negative once it has passed, null if the deadline can't be read.
export function daysUntilDeadline(deadline, now = new Date()) {
  const deadlineDay = parseDeadline(deadline);
  if (!deadlineDay) return null;
  // Rounding absorbs the 23/25-hour days around daylight saving changes.
  return Math.round((deadlineDay - startOfDay(now)) / DAY_MS);
}

// Creates any due deadline_reminder notifications. An open, unarchived posting whose deadline is
// within `windowDays` calendar days (deadline day included) gets one reminder for its recruiter and
// one for each applicant whose application isn't Rejected or Offered. Never twice for the same
// user, job and type. Called whenever notifications are read, so no scheduler is needed.
export function generateDeadlineReminders(db, now = new Date(), windowDays = DEADLINE_REMINDER_DAYS) {
  const jobs = db
    .prepare(`
      SELECT id, recruiter_id, title, deadline
      FROM jobs
      WHERE status = 'open'
        AND archived_at IS NULL
        AND deadline IS NOT NULL
    `)
    .all();

  const alreadyReminded = db.prepare(`
    SELECT 1
    FROM notifications
    WHERE user_id = ?
      AND job_id = ?
      AND type = 'deadline_reminder'
  `);

  const activeApplications = db.prepare(`
    SELECT id, user_id
    FROM applications
    WHERE job_id = ?
      AND status NOT IN ('Rejected', 'Offered')
  `);

  const run = db.transaction(() => {
    for (const job of jobs) {
      const daysLeft = daysUntilDeadline(job.deadline, now);
      if (daysLeft === null || daysLeft < 0 || daysLeft > windowDays) continue;

      if (!alreadyReminded.get(job.recruiter_id, job.id)) {
        notify(db, {
          userId: job.recruiter_id,
          type: 'deadline_reminder',
          title: 'Posting closing soon',
          message: `${job.title} closes on ${job.deadline}.`,
          link: `/recruiter/postings/${job.id}/applicants`,
          jobId: job.id,
        });
      }

      for (const application of activeApplications.all(job.id)) {
        if (alreadyReminded.get(application.user_id, job.id)) continue;
        notify(db, {
          userId: application.user_id,
          type: 'deadline_reminder',
          title: 'Application deadline approaching',
          message: `${job.title} closes on ${job.deadline}.`,
          link: '/applications',
          jobId: job.id,
          applicationId: application.id,
        });
      }
    }
  });

  run();
}
