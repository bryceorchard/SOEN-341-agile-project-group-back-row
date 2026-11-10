const TYPES = ['status_update', 'interview_invite', 'new_application', 'deadline_reminder'];

// The one place every notification gets created, so triggers (status changes, new
// applications, deadline reminders) all produce rows with the same shape.
export function notify(db, { userId, type, title, message, link = null, jobId = null, applicationId = null }) {
  if (!TYPES.includes(type)) throw new Error(`Unknown notification type: ${type}`);

  db.prepare(
    `INSERT INTO notifications (user_id, type, title, message, link, job_id, application_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(userId, type, title, message, link, jobId, applicationId);
}
