# PLAN_entries-pagination-mylink — infostore

## Title
Add server-side pagination to Entries lists and replace raw &lt;Link&gt; usage with MyLink

## Plan
- [x] Create `src/lib/constants.ts` with `ENTRIES_ITEMS_PER_PAGE = 20` and `RECENT_ENTRIES_LIMIT = 5`.
- [x] `src/lib/entries.ts`: add `fetchFilteredEntries(filters, page, itemsPerPage)` and
      `getEntriesPageCount(filters, itemsPerPage)` using nextjs-shared's `fetchFiltered`/
      `fetchTotalPages`, building a shared `Filter[]` from title (`LIKE` on `ent_title`), categories
      (`ARRAY_OVERLAP` on `ent_categories` — new nextjs-shared operator, see
      `PLAN_array-overlap-filter-operator.md` in nextjs-shared), country (`=`/`IN` on `ent_country`),
      and date range (`>=`/`<=` on `ent_article_date`).
- [x] `src/app/dashboard/entries/page.tsx` (public list): switch from `fetchAllEntries` + client
      `.filter()` to `fetchFilteredEntries`/`getEntriesPageCount`, add `currentPage`/`rowsPerPage`
      state (`ENTRIES_ITEMS_PER_PAGE` initial, nextjs-shared's default rows-options list, no local
      override), render `MyPaginationFooter`. Replace the raw
      `<Link className='px-4 py-2 bg-blue-600...'>` "+ New Entry" with `MyLink`.
- [x] `src/app/[admin_secret]/dashboard/entries/page.tsx` (admin list): same server-pagination
      treatment, including category (multi), country (multi), and date-range filters through the
      same shared `Filter[]` builder. Replace its raw `<Link>` "+ New Entry" with `MyLink`.
- [x] `src/app/dashboard/page.tsx` and `src/app/[admin_secret]/dashboard/page.tsx`: replace
      `fetchAllEntries('...').slice(0, 5)` with a direct
      `fetchFiltered({ table: 'tent_entries', orderBy: 'ent_entid DESC', limit: RECENT_ENTRIES_LIMIT, caller })`
      call — a fixed-size "recent" widget, not a paginated list, so no `fetchTotalPages` needed here.
- [x] Replace the remaining raw `<Link className=...>` instances with `MyLink` (13 total across 7
      files: `dashboard/page.tsx` x3, `[admin_secret]/dashboard/page.tsx` x3,
      `dashboard/entries/page.tsx` x2, `[admin_secret]/dashboard/entries/page.tsx` x2,
      `dashboard/entries/[ent_entid]/page.tsx` x1, `[admin_secret]/dashboard/entries/[ent_entid]/page.tsx` x1,
      `[admin_secret]/page.tsx` x1), preserving each instance's existing styling via `overrideClass`.
- [x] Remove `fetchAllEntries` from `src/lib/entries.ts` once all 4 of its call sites are migrated
      (confirm no other caller remains before deleting).
- [x] Check the write-invalidation gap (pagination skill step 4): confirm `tent_entries` writers in
      `entries.ts` all go through `table_write`/`table_update`/`table_delete` (auto
      cache-invalidating) rather than raw `table_query(isupdate: true)` — add `cache_clearTable` if
      any raw-query writer is found.
- [ ] Verify (network tab or row-count log) that the entries list request scales with page size, not
      total row count, on both the public and admin pages.

## Changes

### src/lib/constants.ts (new file)
- Added `ENTRIES_ITEMS_PER_PAGE = 20` and `RECENT_ENTRIES_LIMIT = 5`.

### src/lib/entries.ts
- Removed `fetchAllEntries` (full-table load with no limit) — no longer used anywhere.
- Added `EntryFilters` type, `buildEntryFilters` (builds a `Filter[]` from title/categories/
  countries/date-range, only including filters actually set), `fetchFilteredEntries` and
  `getEntriesPageCount` (server-side pagination via `fetchFiltered`/`fetchTotalPages`, using the new
  `ARRAY_OVERLAP` operator for the `ent_categories` `text[]` column), `fetchRecentEntries` (fixed
  `limit: RECENT_ENTRIES_LIMIT` fetch for the dashboard widget), and `fetchDistinctCountries`
  (mirrors the existing `fetchDistinctCategories` pattern — needed since the admin list's country
  filter used to be derived client-side from the now-removed full-table load).
- Confirmed all `tent_entries` writers (`createEntry`, `updateEntry`, `deleteEntry`) already go
  through `table_write`/`table_update`/`table_delete` — no raw `table_query(isupdate: true)`
  writer exists, so no `cache_clearTable` addition was needed.

### src/app/dashboard/entries/page.tsx
- Switched to `fetchFilteredEntries`/`getEntriesPageCount` with `currentPage`/`rowsPerPage` state
  and `MyPaginationFooter`. Category dropdown options now come from `fetchDistinctCategories`
  (previously derived from the full loaded table). Replaced the raw `<Link>` "+ New Entry" button
  and the row "View" link with `MyLink`.

### src/app/[admin_secret]/dashboard/entries/page.tsx
- Same server-pagination treatment, with category (multi), country (multi), and date-range filters
  all passed into `fetchFilteredEntries`/`getEntriesPageCount`. Category/country checkbox options
  now come from `fetchDistinctCategories`/`fetchDistinctCountries`. Replaced the raw `<Link>`
  "+ New Entry" and row "Edit" link with `MyLink`.

### src/app/dashboard/page.tsx, src/app/[admin_secret]/dashboard/page.tsx
- Replaced `fetchAllEntries(...).slice(0, 5)` with `fetchRecentEntries` (a direct `fetchFiltered`
  call with `limit: RECENT_ENTRIES_LIMIT`) — this was loading the entire table just to show 5 rows.
  Replaced the raw `<Link>` "+ New Entry" button, each recent-entry row link, and the "View All
  Entries →" link with `MyLink`.

### src/app/[admin_secret]/page.tsx
- Replaced the raw `<Link>` "Go to Dashboard →" button with `MyLink`.

### src/app/dashboard/entries/[ent_entid]/page.tsx, src/app/[admin_secret]/dashboard/entries/[ent_entid]/page.tsx
- Replaced the raw `<Link>` "Edit" button with `MyLink`.

## Testing
- [ ] Confirmed via `npx tsc --noEmit` + `npm run build` — both pass.
- [ ] Open `/dashboard/entries`: confirm the list loads, title search and category dropdown filter
      correctly, and the pagination footer appears once there are more entries than
      `ENTRIES_ITEMS_PER_PAGE` (20).
- [ ] Open `/[admin_secret]/dashboard/entries`: confirm title search, category/country multi-select,
      and date-range filters all narrow the list correctly, delete still works via the confirm
      dialog, and pagination behaves the same as the public list.
- [ ] Open `/dashboard` and `/[admin_secret]/dashboard`: confirm the "Recent Entries" widget still
      shows the 5 most recent entries.
- [ ] Open the browser's network tab on both entries list pages, change the page size / apply a
      filter, and confirm the rows request payload scales with `rowsPerPage`, not the total number
      of entries in the table.
- [ ] Click through each replaced `MyLink` (New Entry, View/Edit, View All Entries, Go to Dashboard,
      recent-entry rows) and confirm styling looks the same as before and navigation still works.
