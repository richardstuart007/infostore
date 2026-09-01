# PLAN_nextjs-shared-cleanup — infostore

## Title
Full nextjs-shared cleanup across src/ (TableResult return shape, table names, function order, function headers)

## Context / findings from pre-plan audit

- `#reinstall` ran: `node_modules` + `package-lock.json` + `.next` wiped, `npm install --legacy-peer-deps`
  done, `nextjs-shared` force-resolved to **2.1.84 (commit f4f1fafe)**. The `npx tsc --noEmit` gate
  then failed with 17 errors — all from the new `TableResult<T>` return shape — which is exactly
  what steps 1–2 below fix. `npm run build` not yet run (blocked behind tsc).
- Confirmed `nextjs-shared@2.1.84` return shapes: `table_fetch` / `table_query` / `fetchFiltered` /
  `table_write` / `table_update` / `table_delete` / `table_upsert` → `TableResult<any[]>`;
  `table_count` / `fetchTotalPages` → `TableResult<number>`; `table_check` →
  `TableResult<{found, message}>`. `TableResult<T> = { ok: boolean; data: T; error: string | null }`,
  never throws.
- **All raw DB access is confined to 4 lib files**: `src/lib/entries.ts`, `src/lib/arguments.ts`,
  `src/lib/sources.ts`, `src/lib/categories.ts`. Every `.tsx` page and the `/api/analyze` route
  consume only the domain-typed wrappers (`EntryRow[]`, `number`, `boolean`, …), so steps 1–2 touch
  only those 4 files and no call sites elsewhere change.
- No direct `table_*` calls anywhere in `src/app/**`. No client `.tsx` `table_delete` fire-and-forget
  calls exist — the "leave as-is" clause has nothing to apply to here.
- `table_check` / `table_fetch_join` / `table_upsert` are **not used** in this project.

## Judgement calls (agreed via the prescriptive #reinstall instruction; recorded here for review)

- **JC1 — entries.ts functions with no existing try/catch** (`fetchFilteredEntries`,
  `getEntriesPageCount`, `fetchRecentEntries`): on `!ok`, add `write_logging('E', …)` with
  `result.error` then `return` the empty fallback (`[]` / `0`) — matching the 7 other functions in
  the same file. (Alternative rejected: `throw`.)
- **JC2 — delete functions capturing a result for the first time** (`deleteEntry` ×3 `table_delete`,
  `deleteArgument`, `deleteSource`): introduce new locals to hold each `table_delete` result
  (`deleteEntry`: `argsDeleted` / `sourcesDeleted` / `entryDeleted`; `deleteArgument`:`deleted`;
  `deleteSource`: `deleted`), check `.ok`, on `!ok` `write_logging` + `return false`. Now-dead
  `try/catch` wrappers are **kept** (instruction: preserve control-flow shape).
- **JC3 — multi-export server files** (`entries.ts`, `arguments.ts`, `sources.ts`): these have no
  single "main" export — all functions are peer CRUD operations that already carry plain single-dash
  headers. The numbered `1)/2)/3)` double-equals main header applies to a file's single main
  export; for these, follow whatever the `function-headers` skill dictates for peer-export files
  (likely: leave the existing dash headers, add no numbered header). Resolve during step 4 and
  record the outcome in Changes.

## Plan

### Step 1 — TableResult unwrap ("capture result, check `.ok`, read `.data`")

- [x] `src/lib/arguments.ts` — `fetchArgumentsByEntry` (`table_fetch`), `createArgument`
      (`table_write`), `updateArgument` (`table_update`), `deleteArgument` (`table_delete`): capture
      result, `if (!result.ok)` → `write_logging('E', lg_functionname = <fn>, lg_caller = caller)`
      with `result.error` then `return` the file's existing fallback; success path reads
      `result.data` / `result.data[0]`.
- [x] `src/lib/sources.ts` — same treatment for `fetchSourcesByEntry`, `createSource`,
      `updateSource`, `deleteSource`.
- [x] `src/lib/entries.ts` — `fetchFilteredEntries` (`fetchFiltered`), `getEntriesPageCount`
      (`fetchTotalPages`), `fetchRecentEntries` (`fetchFiltered`), `fetchDistinctCountries`
      (`table_query`), `fetchEntryById` (`table_fetch`), `fetchEntriesCount` (`table_count`),
      `fetchBySourceUrl` (`table_fetch`; catch just returns null — no `write_logging` on `!ok`,
      match existing), `createEntry` (`table_write`), `updateEntry` (`table_update`), `deleteEntry`
      (`table_delete` ×3). Apply JC1/JC2. `getEntriesPageCount` also stops returning the call result
      directly (assign to a `const` first, per convention).
- [x] `src/lib/categories.ts` — `fetchDistinctCategories` (`table_query`): capture result, `!ok` →
      `write_logging` + `return []`; success reads `result.data.map(...)`.
- [x] Preserve every comment, variable name, and control-flow shape; no renames, no restructure.

### Step 2 — table name on every call

- [x] `src/lib/categories.ts` — add `table: 'tent_entries'` to the `table_query` call.
- [x] `src/lib/entries.ts` — add `table: 'tent_entries'` to the `table_query` call in
      `fetchDistinctCountries`.
- [x] Re-audit all other `table_*` calls in the 4 lib files — every one already passes `table:`
      (verified in pre-plan audit); confirm nothing was missed.

`npx tsc --noEmit` clean after steps 1–2.

### Step 3 — function-order skill over the whole src/ tree

- [x] Invoke the `function-order` skill; run it across every `.ts` / `.tsx` file under `src/`.
- [x] Expectation from the audit: near no-op. All named helpers/handlers are already `function`
      declarations; every arrow is an inline JSX-prop / `.map` / callback that correctly stays an
      arrow. Be conservative — convert in place, do not wholesale-reorder coherent files. Record any
      actual change (or "no changes") in Changes.

`npx tsc --noEmit` clean after step 3.

### Step 4 — function-headers skill over the whole src/ tree

- [x] Invoke the `function-headers` skill; run it across every `.ts` / `.tsx` file under `src/`.
- [x] Add the numbered `1) DESCRIPTION` (+ `2)`/`3)` only with real content) double-equals main
      header between the directive and the imports for each file's single main export (the page /
      layout / route component). Add plain single-dash titled headers to any helper lacking one.
      Leave already-canonical headers untouched. No fabricated `2) NOTES` / `3) CHANGE HISTORY`.
- [x] Skip `src/lib/constants.ts` (pure constants module). Resolve JC3 for the multi-export server
      files and record the decision.

### Step 5 — gate

- [x] `npx tsc --noEmit` clean — run after each of steps 1, 2, 3, 4 (per-directory / per-batch),
      not only at the end.
- [x] `npm run build` clean.
- [x] Write the `## Testing` checklist of concrete user-verification steps.

## Changes

### src/lib/categories.ts
- `fetchDistinctCategories`: `table_query` now returns `TableResult<any[]>` — capture as `result`,
  `if (!result.ok)` → `write_logging('E', …, result.error)` + `return []`, success path reads
  `result.data.map(...)`. Added `table: 'tent_entries'` to the `table_query` call (step 2).

### src/lib/arguments.ts
- `fetchArgumentsByEntry`: `table_fetch` → `result`; `!ok` → `write_logging` + `return []`; success
  assigns `const rows = result.data` (variable name preserved) then `return rows as ArgumentRow[]`.
- `createArgument` / `updateArgument`: `table_write` / `table_update` → `result`; `!ok` →
  `write_logging` + `return null`; success `return (result.data[0] as ArgumentRow) || null`.
- `deleteArgument`: `table_delete` result now captured as `deleted` (JC2); `!ok` → `write_logging` +
  `return false`; success `return true`. Now-dead `try/catch` kept (JC3 — control-flow shape).

### src/lib/sources.ts
- Identical treatment to arguments.ts for `fetchSourcesByEntry` (`table_fetch`), `createSource`
  (`table_write`), `updateSource` (`table_update`), `deleteSource` (`table_delete`, result captured
  as `deleted`).

### src/lib/entries.ts
- `fetchFilteredEntries` (`fetchFiltered`), `getEntriesPageCount` (`fetchTotalPages`),
  `fetchRecentEntries` (`fetchFiltered`): these had no prior `try/catch`; on `!ok` now
  `write_logging('E', …, result.error)` + return the file-consistent empty fallback (`[]` / `0`)
  — JC1. Success paths read `result.data` (`const rows` / `const pageCount` names preserved where
  they existed).
- `getEntriesPageCount` no longer returns the call result directly — assigned to `const pageCount`
  first, per the "never return a function call result directly" convention.
- `fetchDistinctCountries` (`table_query`): `!ok` → `write_logging` + `return []`; success reads
  `result.data.map(...)`. Added `table: 'tent_entries'` (step 2).
- `fetchEntryById` (`table_fetch`), `fetchEntriesCount` (`table_count`): `!ok` → `write_logging` +
  return fallback (`null` / `0`); success reads `result.data` (`const rows` / `const count`).
- `fetchBySourceUrl` (`table_fetch`): matches its existing catch (returns `null`, no logging) — on
  `!ok` just `return null`; success reads `const rows = result.data`.
- `createEntry` (`table_write`), `updateEntry` (`table_update`): `!ok` → `write_logging` +
  `return null`; success `return (result.data[0] as EntryRow) || null`.
- `deleteEntry`: the three `table_delete` calls now captured as `argsDeleted` / `sourcesDeleted` /
  `entryDeleted` (JC2); each `!ok` → `write_logging('E', 'Failed to delete entry: ' + <r>.error)` +
  `return false`. Now-dead `try/catch` kept.
- All comments, existing variable names, and control-flow shapes preserved. No call sites outside
  these 4 files needed changes (all `.tsx`/route consumers use the domain-typed wrappers).

### Step 3 — function-order (whole src/ tree)
- **Conversion pass: zero conversions.** Every named function across `src/` is already a `function`
  declaration; every arrow is an inline JSX-prop / event-handler / `.map` / `onConfirm` object-prop
  callback that correctly stays an arrow.
- **Ordering pass: 1 change.** `src/app/[admin_secret]/dashboard/entries/page.tsx` — swapped
  `handleDelete` and `openDeleteConfirm` so the helper called directly from JSX (`openDeleteConfirm`)
  precedes the helper it calls (`handleDelete`), per "helpers by first use". Both are hoisted
  `function` declarations so behavior is unchanged.
- **Left conservatively as-is:** the 4 `src/lib/*.ts` files — helpers already `function` declarations
  in a coherent, use-ordered layout (`buildEntryFilters` / `fetchBySourceUrl` sit correctly relative
  to their callers); no reorder. All other `.tsx` pages already have hooks → guard → handlers (in
  first-use order) → `return`.

### Step 4 — function-headers (whole src/ tree)
- **JC3 resolved:** `src/lib/entries.ts`, `arguments.ts`, `sources.ts` are multi-export server
  modules with no single "main" export — per the `function-headers` skill they keep their existing
  plain single-dash per-function headers and get **no** numbered `1)/2)/3)` header. Left untouched.
- **No `3) CHANGE HISTORY` added anywhere** — the header rollout is a documentation-only pass
  (explicitly excluded from change-history entries) and the step-1 `TableResult` migration is a
  mechanical shared-package-driven change, not a deliberate per-function API change; forward-only
  rule applies.
- **Numbered `1) DESCRIPTION` main header added** (double-equals border, between directive/top and
  imports) to: `src/lib/categories.ts` (`fetchDistinctCategories` — its old dash header removed),
  `src/lib/utils.ts` (`normalizeCategory`), `src/app/api/analyze/route.ts` (`POST`),
  `src/app/layout.tsx` (`RootLayout`, + `2) NOTES`), `src/app/page.tsx` (`HomePage`),
  `src/app/dashboard/layout.tsx`, `src/app/dashboard/page.tsx`,
  `src/app/dashboard/entries/page.tsx` (`EntriesListPage`, + `2) NOTES`),
  `src/app/dashboard/entries/new/page.tsx` (`NewEntryPage`, + `2) NOTES`),
  `src/app/dashboard/entries/[ent_entid]/page.tsx`,
  `src/app/dashboard/entries/[ent_entid]/edit/page.tsx`,
  `src/app/[admin_secret]/layout.tsx`, `src/app/[admin_secret]/page.tsx`,
  `src/app/[admin_secret]/dashboard/layout.tsx`, `src/app/[admin_secret]/dashboard/page.tsx`,
  `src/app/[admin_secret]/dashboard/entries/page.tsx` (`AdminEntriesListPage`, + `2) NOTES`),
  `src/app/[admin_secret]/dashboard/entries/new/page.tsx` (`AdminNewEntryPage`, + `2) NOTES`),
  `src/app/[admin_secret]/dashboard/entries/[ent_entid]/page.tsx`,
  `src/app/[admin_secret]/dashboard/entries/[ent_entid]/edit/page.tsx` (+ `2) NOTES`),
  `src/app/owner/layout.tsx`, `src/app/owner/page.tsx`, `src/app/owner/logging/page.tsx`,
  `src/app/owner/cache/layout.tsx`, `src/app/owner/cache/cache/page.tsx`.
- **Plain 94-dash indented helper headers added** to the component-level handlers that had none:
  `handleAnalyze` / `handleSave` (both new-entry pages), `handleSave` / `handleDelete` (both
  edit pages), `openDeleteConfirm` / `handleDelete` (`AdminEntriesListPage`).
- **Judgment call — inner `useEffect` `load()` / `loadOptions()` / `loadCategories()` wrappers left
  header-less:** these are the async-in-`useEffect` idiom shown verbatim (with no header) in the
  `### Async` section of `~/.claude/CLAUDE.md`; self-explanatory, so no dash title added.
- **Skipped:** `src/lib/constants.ts` (pure constants module).

### Step 5 — gate
- `npx tsc --noEmit` clean after each of steps 1–2, 3, and 4.
- `npm run build` clean (Next.js 16.2.9, all 17 routes compiled; TypeScript pass clean).

## Testing

Pure internal cleanup — no intended behaviour change. All verification is about confirming nothing
broke. Pick the right environment first (`.env.locallocal` vs `.env.localprod`); the steps below
assume `npm run locallocal` on port 3040.

- [ ] `npx tsc --noEmit` and `npm run build` both clean (already confirmed during `#code`).
- [ ] Start the dev server and open `/dashboard` — total entry count and the recent-5 list render
      as before.
- [ ] `/dashboard/entries` — list loads; type in the title search and pick a category — results
      and the paginator update; page through and change rows-per-page.
- [ ] Open an entry detail page — metadata, arguments (relevance-ordered) and sources all show.
- [ ] `/dashboard/entries/new` — paste an article URL, Analyze (needs Ollama running), edit a
      field, Create — the new entry saves with its arguments and sources and you land on its detail
      page. Try a known-duplicate URL and confirm the duplicate warning still fires.
- [ ] Edit that entry, save, and confirm the change persists; delete an argument and a source
      inline; then delete the entry and confirm it (and its arguments/sources) are gone.
- [ ] Repeat the list / new / edit / delete checks under `/[admin_secret]/dashboard/entries…`
      (admin route tree) — including the multi-category / multi-country / date-range filters and
      the MyConfirmDialog delete on the admin list.
- [ ] `/owner`, `/owner/logging`, `/owner/cache/cache` — panels render.
- [ ] Spot-check `xlg_logging`: force one failure path if convenient (e.g. stop the DB briefly) and
      confirm a `'Failed to …'` row is written with the new `result.error` text and severity `E`.
