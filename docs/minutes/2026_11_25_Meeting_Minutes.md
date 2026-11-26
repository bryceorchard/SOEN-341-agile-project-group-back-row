# Meeting Minutes — CareerConnect

**Date:** 2026-11-25
**Time:** 18:00–18:30
**Location / medium:** Online (Discord)
**Scribe:** Gene

## Attendance

| Member  | Present |
| ------- | :-----: |
| Bryce   | Present*|
| Gene    | Present*| 
| Zohair  | Present |
| Mahmoud | Present |
| Gabriel | Present |
| Luca    | Present |
*Briefly Present. Provided input and left
## Agenda

-Determine Unique feature

## Discussion

- Brainstorm and decide unique feature by end of session
- Potential features were the following 4 listed bullet points:
    - Blind Resume Mode: A one-click toggle that masks candidate names, emails, and photos with anonymous IDs until they reach the interview stage to reduce hiring bias.
    -  Recruiter "Ghosting" SLA & Auto-Nudge: Tracks employer average response times on job cards and auto-nudges recruiters (plus unlocks a candidate ping button) if an application sits untouched for 14 days.
    - Application Version Snapshots: Freezes an exact copy of a candidate's profile and resume at the moment they apply so future profile edits never alter past applications.
    - Kanban Pipeline with WIP Limits: A drag-and-drop hiring board (Applied → Interview → Offer) that caps how many candidates can sit in a stage at once to prevent recruiter bottlenecks. 
- Applicaton Version prefered. Implementation suggestions included a version controlled/ stored tree on the users profile and document that contained a page appended onto the user's resume.  


## Decisions

- Chosen Implementation feature: Application Snapshots. General design fucntionality, provides the recruiter with a document with an appended page with the job seeker's information at the time. Simpler and more effective, alongside less waste of db storage.

## Action items

- Complete Sprint 4 board issues assigned to each user

## Next meeting

**Date:** 2026-11-26
