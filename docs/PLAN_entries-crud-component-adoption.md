# PLAN_entries-crud-component-adoption — infostore

## Title
Adopt nextjs-shared components across the entries CRUD pages (both route trees)

## Plan
- [x] Reinstall nextjs-shared to pick up the latest version
- [x] `src/app/dashboard/entries/new/page.tsx` and its mirror `src/app/[admin_secret]/dashboard/entries/new/page.tsx`: replace every raw `<input>` (analyze-URL, Title, Source URL, Article Date, Country, Author, Publication) with `MyInput`, the raw `<textarea>` (Summary) with `MyTextarea`, the raw `<select>` (add-category) with `MySelect`, and every raw `<button>` (Analyze, remove-category ×, Create Entry, Cancel) with `MyButton`.
- [x] `src/app/dashboard/entries/[ent_entid]/edit/page.tsx` and its mirror `src/app/[admin_secret]/dashboard/entries/[ent_entid]/edit/page.tsx`: same conversions.
- [x] `src/app/dashboard/entries/page.tsx`: replace the raw search `<input>` and category-filter `<select>` with `MyInput`/`MySelect`.
- [x] `src/app/[admin_secret]/dashboard/entries/page.tsx`: replace the raw search/Date-From/Date-To `<input>`s with `MyInput`; replace the category/country checkbox filter lists with `MyCheckbox`; replace the Delete/Delete-confirm/Cancel buttons with `MyButton`; replace the hand-rolled `fixed inset-0` delete-confirmation modal with `MyConfirmDialog`.
- [x] Type-check with `npx tsc --noEmit` and build with `npm run build`

## Changes

### src/app/dashboard/entries/new/page.tsx, src/app/[admin_secret]/dashboard/entries/new/page.tsx
- All raw form elements replaced: `MyInput` (analyze-URL, Title, Source URL, Article Date, Country, Author, Publication), `MyTextarea` (Summary), `MySelect` (add-category, via `children`), `MyButton` (Analyze, remove-category ×, Create Entry, Cancel). Standardized `overrideClass` across all text/url/date inputs (`h-auto md:h-auto px-4 md:px-4 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`) to preserve the original ring-focus look, since `MyInput`'s own default uses a border-focus style instead — both apply simultaneously (a minor, harmless visual addition: the border also tints blue on focus in addition to the ring).

### src/app/dashboard/entries/[ent_entid]/edit/page.tsx, src/app/[admin_secret]/dashboard/entries/[ent_entid]/edit/page.tsx
- Same conversions as the `new` pages, plus the delete-argument/delete-source/Delete Entry/Yes-Delete/Cancel buttons converted to `MyButton`. The admin mirror's additional Date/Country/Author/Publication fields converted the same way. The inline (non-modal) delete-confirmation block was left structurally as-is per the agreed plan scope — only its buttons became `MyButton`, it was not restructured into `MyConfirmDialog` (that conversion was scoped to the admin list page's actual overlay modal only).

### src/app/dashboard/entries/page.tsx
- Search `MyInput`, category-filter `MySelect`.

### src/app/[admin_secret]/dashboard/entries/page.tsx
- Search/Date-From/Date-To → `MyInput`. Category and country checkbox filters → `MyCheckbox` (`selectedOptions`/`setSelectedOptions`/`options` as `{value,label}[]`, search/resort/count features all disabled to match the original plain list look).
- Delete trigger and Edit-row actions → `MyButton` (Edit stays a `Link`, unchanged — it's navigation, not an action button).
- Hand-rolled `fixed inset-0` modal (`deleteConfirmId` state) replaced with `MyConfirmDialog`, backed by a single page-level `confirmDialog` state (`ConfirmDialogInt`) — `openDeleteConfirm(entry)` builds the dialog with the entry's title in `line1` and an `onConfirm` closure bound to that entry's id, matching the pattern already used in `MaintenancePanel.tsx`/`StagingBar.tsx` elsewhere in this audit.
- **Behavior change worth knowing:** the original UI disabled the "Delete" confirm button and showed "Deleting..." text while the delete request was in flight (via a `deleting` state). `MyConfirmDialog`'s Yes button has no built-in loading/disabled state — it always reads "Yes" — so that in-flight feedback is gone; the button can technically be clicked again during the async delete. Not blocking, but worth testing deliberately (rapid double-click during a slow delete) since it's a real behavior change, not just a visual one.

### Not converted (intentionally, per plan scope)
- Editing the inline (non-overlay) delete confirmation in the edit pages into `MyConfirmDialog` — left as plain conditional JSX with `MyButton`s, since the plan only scoped the actual overlay modal (admin list page) for that conversion.

## Testing
- [x] `/dashboard/entries/new`: analyze a URL, fill in fields, add/remove categories, create an entry successfully.
- [x] `/[admin_secret]/dashboard/entries/new`: same check on the admin mirror.
- [x] `/dashboard/entries/[id]/edit`: edit title/summary/categories/source URL, save successfully; delete an argument and a source; use the inline delete-entry confirmation (Yes/Cancel) and confirm it still works.
- [x] `/[admin_secret]/dashboard/entries/[id]/edit`: same check, plus the additional Date/Country/Author/Publication fields.
- [x] `/dashboard/entries`: search by title and filter by category, confirm the list updates correctly.
- [x] `/[admin_secret]/dashboard/entries`: search, filter by category checkboxes, filter by country checkboxes, filter by date range — confirm all combine correctly.
- [x] On the admin entries list, click Delete on a row, confirm the `MyConfirmDialog` shows the entry's title, and both Cancel and confirming Delete work correctly (entry actually removed from the list on confirm).
- [x] Specifically test rapid double-click on the delete confirm button during the delete request, given the noted loss of the disabled/"Deleting..." state — confirm nothing breaks (e.g. no duplicate delete calls causing an error).
