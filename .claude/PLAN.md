# Plan — infostore

## Current task: Update write_Logging → write_logging (consume nextjs-shared v2.0.2)

**Why:** nextjs-shared renamed the exported function from `write_Logging` (capital L) to `write_logging` (lowercase) to match the `table_*` convention and fix a Turbopack case-sensitive module resolution error. All consuming projects must update their import names and call sites to match.

- [x] Global search/replace `write_Logging` → `write_logging` in all `.ts` files (4 files)
- [x] `npm install --force` (updated package imported)
- [ ] `npx tsc --noEmit` — verify clean
- [ ] Commit all changes (code + PLAN.md + CHANGES.md), then clear CHANGES.md

## Completed tasks
_(none yet)_
