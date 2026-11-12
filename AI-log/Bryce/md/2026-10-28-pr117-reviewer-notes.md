
## Correction (later the same day)
A later audit found the branch `lucamancini2005-design-frontend-failed-test-fix`, which hasn't been
opened as a PR yet. It adds `<h1>Hello, CareerConnect</h1>` to `app.html` so the stale test passes.
This is most likely the "separate PR" #117 refers to, not #112. It conflicts with #112's
`app.html`, and #112 fixes the test itself.
