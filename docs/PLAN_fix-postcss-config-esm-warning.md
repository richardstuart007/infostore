# PLAN_fix-postcss-config-esm-warning — infostore

## Title
Fix MODULE_TYPELESS_PACKAGE_JSON warning by renaming postcss.config.js to .mjs

## Plan
- [x] Rename `postcss.config.js` to `postcss.config.mjs` (same content, no changes needed) — matches the pattern used in every other project (chess, next-bridge, next-bridgeschool, next-dbadmin, nextjs-shared, richard-dashboard)
- [x] Delete the old `postcss.config.js`
- [x] Confirm `.next` cache doesn't need clearing; restart dev server if needed for testing

## Changes
### postcss.config.mjs / postcss.config.js
- Created `postcss.config.mjs` with the same content as the old `postcss.config.js` (ESM `export default` syntax), then deleted `postcss.config.js`. The `.mjs` extension tells Node the file is an ES module unambiguously, eliminating the `MODULE_TYPELESS_PACKAGE_JSON` warning without needing `"type": "module"` in `package.json` — matches how every other project in the workspace already handles this file.

## Testing
- [x] Run `npm run locallocal` (or `npm run localprod`) and confirm the `MODULE_TYPELESS_PACKAGE_JSON` warning for `postcss.config.js` no longer appears in the console output
- [x] Confirm Tailwind styles still render correctly on any page (e.g. `/dashboard`) — proves PostCSS/Tailwind config is still being picked up correctly from the renamed file
