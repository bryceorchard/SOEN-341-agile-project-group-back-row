# AI Interaction Log

**Author:** Bryce
**Date:** 2026-10-29
**AI Tool:** Claude (Cowork)

## Task / Prompt
Go through every comment on PR #112 and do all the remaining work, so every checkbox can be
ticked. Commit to the PR's branch (as with Gabriel's part).

## Context / Findings
- **Bryce's review comment (2026-10-25)**, items still open:
  - Zohair: login 401/409/400 unit tests; #88 AT-4.
  - Bryce: closed-posting banner, already-applied link, 404 vs other errors, tests;
    #91 AT-3 and #92 AT-1/AT-2.
  - Gene: posting-closed badge, status counts, load error, tests; #93 AT-1 to AT-3.
  - Luca: #95 AT-1 to AT-3.
  - Gabriel's section was already done in `ea78132`.
- **Zohair's comment (2026-10-26):** the same two pending items as his section.
- **Gaps found while checking the acceptance tests against the code:**
  - #93 AT-1 needs the deadline and resume filename on the dashboard, and AT-2 needs a "last
    updated" date (also an open #83 item).
  - #95 AT-1 needs the resume filename on the applicants page.
  - #87 still needed the posting's details on that page.
  - #75 needed the 2000-character check and load/save tests (the backend rejects fields over
    2000 characters).
- **Test fix:** the first version of the login tests set form values directly, so the zoneless
  view didn't update; the tests now type into the inputs. A missing route in the test caused an
  unhandled navigation error; real routes were added and the redirect is now asserted.

## AI Output / Actions
Seven commits on `recruiter-postings-ui` (authored as Bryce), on top of `ea78132`:
- `1c712df` (#74): login/register tests:
  - 401, 409 and 400 messages;
  - invalid email and short password keep Register disabled and send nothing;
  - signing up with a role redirects to the right page.
- `beaffb6` (#75): 2000-character limit on profile fields (inline message, save blocked), plus
  tests for loading and saving the profile.
- `34baf5e` (#81): cherry-picked the apply confirmation from `feature/81-apply-confirmation`.
- `3129d87` (#80, #81):
  - `status` on `JobSummary`;
  - a closed-posting banner, with no Apply form or login prompt;
  - a 404 now says "This job no longer exists", and other errors say "Could not load this job";
  - tests for each.
- `22c2abb` (#83), dashboard:
  - "Posting closed" badge;
  - counts on the status filters and a total for the selected status (filtered on the loaded list);
  - error and loading states;
  - deadline, last updated and resume on each row;
  - tests.
- `591b830` (#87): posting details (title, location, category, deadline, status) and resume
  filenames on the applicants page. Luca's spec now also answers the posting request.
- `0c18bf1` (#79): empty-search wording changed to "No jobs match your search" (#90 AT-3).

Checks:
- `ng test`: 63/63 pass. The development build compiles. The production build fails only in the
  sandbox, because Google Fonts can't be reached from there (same as the 2026-10-22 review).
- Browser run (headless Chromium, seeded backend):
  - Every acceptance test named in the comments passes: #88 AT-4/AT-5/AT-6, #90 AT-2/AT-3,
    #91 AT-2/AT-3, #92 AT-1/AT-2, #93 AT-1/AT-2/AT-3, #95 AT-1/AT-2/AT-3.
  - Also passing: the closed-posting banner, and the dashboard's closed badge and counts.
- Fast-forwarded the local `recruiter-postings-ui` to `0c18bf1`. Not pushed.
- No GitHub issues or comments were edited.

## Decision
**Bryce:**

## Reflection
**Bryce:**
