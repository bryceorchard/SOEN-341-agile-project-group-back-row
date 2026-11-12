import { notify } from './notify.js';

export const REMINDER_DAYS_THRESHOLD = 3;

export function generateDeadlineReminders(db, now = new Date()) {
  const jobs = db
    .prepare(`
      SELECT id, recruiter_id, title, deadline
      FROM jobs
      WHERE status = 'open'
        AND archived_at IS NULL
        AND deadline IS NOT NULL
    `)
    .all();

  for (const job of jobs) {
    const deadlineDate = new Date(job.deadline);
    const diffDays = (deadlineDate - now) / (1000 * 60 * 60 * 24);

    if (diffDays < 0 || diffDays > REMINDER_DAYS_THRESHOLD) {
      continue;
    }

    const recruiterReminder = db
      .prepare(`
        SELECT id
        FROM notifications
        WHERE user_id = ?
          AND job_id = ?
          AND type = 'deadline_reminder'
      `)
      .get(job.recruiter_id, job.id);

    if (!recruiterReminder) {
      notify(db, {
        userId: job.recruiter_id,
        type: 'deadline_reminder',
        title: 'Posting closing soon',
        message: `${job.title} closes soon.`,
        link: `/recruiter/postings/${job.id}/applicants`,
        jobId: job.id,
      });
    }

    const applications = db
      .prepare(`
        SELECT id, user_id
        FROM applications
        WHERE job_id = ?
          AND status NOT IN ('Rejected', 'Offered')
      `)
      .all(job.id);

    for (const application of applications) {
      const applicantReminder = db
        .prepare(`
          SELECT id
          FROM notifications
          WHERE user_id = ?
            AND job_id = ?
            AND type = 'deadline_reminder'
        `)
        .get(application.user_id, job.id);

      if (!applicantReminder) {
        notify(db, {
          userId: application.user_id,
          type: 'deadline_reminder',
          title: 'Application deadline approaching',
          message: `${job.title} closes soon.`,
          link: '/applications',
          jobId: job.id,
          applicationId: application.id,
        });
      }
    }
  }
}