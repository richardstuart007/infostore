# PLAN_devlayoutheader-migration — infostore

## Title
Migrate to shared DevLayoutHeader from nextjs-shared@2.1.37

## Plan
- [x] User runs:
  Remove-Item -Recurse -Force node_modules
- [x] User runs:
  Remove-Item -Force package-lock.json
- [x] User runs:
  npm install
- [x] User runs:
  Remove-Item -Recurse -Force .next
- [x] User runs:
  npx tsc --noEmit
- [x] In `src/app/layout.tsx`, replace the local `DevHeader` import with:
  `import { DevLayoutHeader } from 'nextjs-shared/DevLayoutHeader'`
- [x] In `src/app/layout.tsx`, change `<DevHeader dbLocation={DB_LOCATION} />` to `<DevLayoutHeader dbLocation={DB_LOCATION} />`, leaving the surrounding `{IS_DEV && ...}` / `{NEXT_PUBLIC_APPENV_ISDEV && ...}` wrapper as-is (harmless double-guard since `DevLayoutHeader` self-gates internally). No `extraLinks` prop passed — defaults to `[]`, matching current behavior.
- [x] Delete the now-unused local `DevHeader.tsx`
- [x] User runs:
  npx tsc --noEmit
- [x] User runs:
  npm run build

## Changes
### package.json / package-lock.json / node_modules
- Clean reinstall to pull nextjs-shared@2.1.37, which now exports `DevLayoutHeader`.

### src/app/layout.tsx
- Replaced local `DevHeader` import/usage with the shared `nextjs-shared/DevLayoutHeader`, same `dbLocation` prop, no `extraLinks` passed (defaults to `[]`). Existing `IS_DEV` wrapper left in place as a harmless double-guard alongside `DevLayoutHeader`'s internal self-gating.

### src/ui/DevHeader.tsx
- Deleted — fully superseded by the shared `DevLayoutHeader`, which has identical markup/behavior plus an optional `extraLinks` prop.

## Testing
- [ ] Run `npm run locallocal` (or `localprod`), open any page (e.g. `/dashboard`), and confirm the dev header still appears at the top with the "Owner" link and the yellow DB-location badge, identical in appearance to before.
- [ ] Click "Owner" from a non-`/owner` page, then click the back-link from `/owner` — confirm it returns to the page you started from (verifies the `sessionStorage.setItem('ownerFrom', pathname)` behavior still works via the shared component).
- [ ] Confirm the dev header does not render when `NEXT_PUBLIC_APPENV_ISDEV` is not `'true'` (e.g. in a prod-env build), since `DevLayoutHeader` now self-gates in addition to the existing `IS_DEV` wrapper.
