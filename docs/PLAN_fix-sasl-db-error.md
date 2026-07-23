# PLAN_fix-sasl-db-error — infostore

## Title
Fix SASL: SCRAM-SERVER-FIRST-MESSAGE db error caused by next.config.mjs

## Plan
- [x] Edit `next.config.mjs`: remove the `env: { POSTGRES_URL: process.env.POSTGRES_URL }` block, add `serverExternalPackages: ['pg', '@neondatabase/serverless']`
- [ ] User runs:
  Remove-Item -Recurse -Force .next
- [ ] User runs:
  npm run locallocal
- [ ] Visit /dashboard and confirm the SASL error is gone from the terminal and data loads normally

**Follow-up: SASL error still occurs intermittently, but only when this dev server is launched via
richard-dashboard's "Start" button (`wt new-tab -- cmd /k "npm run locallocal"` via
`child_process.exec`) — not when `npm run locallocal` is typed directly into a plain `cmd.exe`
window. Env vars and `.env` file contents have been byte-verified identical between the two launch
paths. Goal: get direct evidence of `process.env.POSTGRES_URL` at the moment of the failing call in
the failing (dashboard-launched) process.**

- [x] In `src/lib/entries.ts`, add a temporary diagnostic line at the top of the `try` block in
  `fetchEntriesCount` (around line 72-77), before the `table_count` call:
  `console.log('DIAGNOSTIC POSTGRES_URL =', JSON.stringify(process.env.POSTGRES_URL))`
- [x] User runs:
  Remove-Item -Recurse -Force .next
- [x] User starts the app via richard-dashboard's "Start" button (failing path), visits /dashboard,
  and copies the exact `DIAGNOSTIC POSTGRES_URL =` line from that terminal
- [x] User stops the app, then starts it by typing `npm run locallocal` directly in a plain
  `cmd.exe` window (working path), visits /dashboard, and copies that terminal's
  `DIAGNOSTIC POSTGRES_URL =` line
- [x] Compare both strings and report back — **result: dashboard-launched path printed
  `DIAGNOSTIC POSTGRES_URL = undefined` (reproduced twice); plain `cmd.exe` path printed the full
  correct connection string. Confirms `process.env.POSTGRES_URL` genuinely is not set in the
  dashboard-launched process at request time — not a `pg`/SASL-parsing issue, and not a stale/wrong
  `.env` file (file contents were also independently verified correct after the copy step in both
  paths). Root cause is specific to how richard-dashboard's `child_process.exec('wt new-tab --
  cmd /k "npm run locallocal"')` launches the process — `.env`-loaded vars aren't reaching
  `process.env` for at least this one request-handling context in that launch path. Not yet
  diagnosed further within infostore; the fix likely belongs in richard-dashboard's launch
  mechanism, not in infostore's own code.**
- [x] Remove the diagnostic `console.log` line from `src/lib/entries.ts` once resolved

## Changes
### next.config.mjs
- Removed the `env: { POSTGRES_URL: process.env.POSTGRES_URL }` block — it baked `process.env.POSTGRES_URL` into the bundle at config-evaluation time, before Next.js loads `.env`, permanently inlining `undefined`.
- Added `serverExternalPackages: ['pg', '@neondatabase/serverless']` so Turbopack treats `pg` as an external package instead of bundling it via `transpilePackages: ['nextjs-shared']`, which was breaking `pg`'s internal SASL/crypto handling.

### src/lib/entries.ts
- Added a temporary `console.log('DIAGNOSTIC POSTGRES_URL =', ...)` line at the top of `fetchEntriesCount`'s `try` block to capture the exact value of `process.env.POSTGRES_URL` at the moment of the failing call, comparing the richard-dashboard launch path against a plain `cmd.exe` launch.
- Removed the diagnostic line after confirming the finding: `process.env.POSTGRES_URL` is `undefined` in the dashboard-launched process, correctly set in the plain-`cmd.exe`-launched process. This is an infostore-side dead end — the cause lives in how richard-dashboard launches the dev server, not in infostore's code, so no further infostore code change follows from this investigation.

## Testing
- [x] User runs:
  Remove-Item -Recurse -Force .next
- [x] User runs:
  npm run locallocal
- [x] Visit /dashboard and confirm the SASL error is gone from the terminal and data loads normally
