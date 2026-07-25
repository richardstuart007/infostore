# PLAN_adopt-mybackhomenav — infostore

## Title
Adopt nextjs-shared's MyBackHomeNav in place of the 6 hardcoded back-links

## Plan
- [x] `src/app/dashboard/entries/new/page.tsx` — replace the hardcoded `Link` back-link with `MyBackHomeNav`.
- [x] `src/app/dashboard/entries/[ent_entid]/edit/page.tsx` — same.
- [x] `src/app/dashboard/entries/[ent_entid]/page.tsx` — same.
- [x] `src/app/[admin_secret]/dashboard/entries/new/page.tsx` — same, admin route variant.
- [x] `src/app/[admin_secret]/dashboard/entries/[ent_entid]/edit/page.tsx` — same, admin route variant.
- [x] `src/app/[admin_secret]/dashboard/entries/[ent_entid]/page.tsx` — same, admin route variant.
- [x] Type-check and build.

## Design decision (agreed before this plan was written)
`MyBackHomeNav` always renders a "⌂ Home" link (default `homePath='/'`) plus a conditional
"← {backLabel}" link. All 6 files currently show only a single "← Back to X" link with no Home
link — adopting the shared component **adds a new Home icon-link that doesn't exist today**. This
was raised explicitly and the user chose to accept it (rather than a back-only variant, or leaving
these as a non-fit) — every file below gains a "⌂ Home" link pointing at `/`, in addition to its
existing back-link.

To keep the visible back-link wording unchanged, `backLabel` is set to the exact current text
(e.g. `backLabel='Back to Entries'`, so the component renders "← Back to Entries", identical to
today) rather than shortening it to just the target name (as chess does, e.g. `backLabel='John'`
→ "← John"). `linkClass` is set to match each file's current `text-blue-600 hover:underline`
styling so the back-link doesn't change appearance; only the new Home link is visually new.

## Changes

All 6 files below were changed exactly as drafted in this plan. `Link` imports were removed where
the back-link was the only use in the file (`new/page.tsx` both variants, `edit/page.tsx` both
variants); kept where a second `Link` (the "Edit" button) still uses it (`[ent_entid]/page.tsx`
both variants). Verified: `npx tsc --noEmit` and `npm run build` both pass cleanly.


### src/app/dashboard/entries/new/page.tsx
Before:
```tsx
<Link href='/dashboard/entries' className='text-blue-600 hover:underline'>
  ← Back to Entries
</Link>
```
After:
```tsx
<MyBackHomeNav
  backPath='/dashboard/entries'
  backLabel='Back to Entries'
  linkClass='text-blue-600 hover:underline'
/>
```
Add `import { MyBackHomeNav } from 'nextjs-shared/MyBackHomeNav'`. Drop the `Link` import only if
this file has no other use of it.

### src/app/dashboard/entries/[ent_entid]/edit/page.tsx
Before:
```tsx
<Link href={`/dashboard/entries/${entid}`} className='text-blue-600 hover:underline'>
  ← Back to Entry
</Link>
```
After:
```tsx
<MyBackHomeNav
  backPath={`/dashboard/entries/${entid}`}
  backLabel='Back to Entry'
  linkClass='text-blue-600 hover:underline'
/>
```

### src/app/dashboard/entries/[ent_entid]/page.tsx
Before:
```tsx
<Link href='/dashboard/entries' className='text-blue-600 hover:underline mb-4 inline-block'>
  ← Back to Entries
</Link>
```
After:
```tsx
<MyBackHomeNav
  backPath='/dashboard/entries'
  backLabel='Back to Entries'
  containerClass='flex gap-3 mb-4'
  linkClass='text-blue-600 hover:underline'
/>
```
Note: the original `mb-4 inline-block` was on the link itself (bottom margin before the heading
below it); moved to `containerClass` since `MyBackHomeNav` wraps both its links in one container
div. `inline-block` is dropped since the container div is already block-level and holds both
links via flex.

### src/app/[admin_secret]/dashboard/entries/new/page.tsx
Before:
```tsx
<Link href={`/${adminSecret}/dashboard/entries`} className='text-blue-600 hover:underline'>
  ← Back to Entries
</Link>
```
After:
```tsx
<MyBackHomeNav
  backPath={`/${adminSecret}/dashboard/entries`}
  backLabel='Back to Entries'
  linkClass='text-blue-600 hover:underline'
/>
```

### src/app/[admin_secret]/dashboard/entries/[ent_entid]/edit/page.tsx
Before:
```tsx
<Link href={`/${adminSecret}/dashboard/entries/${entid}`} className='text-blue-600 hover:underline'>
  ← Back to Entry
</Link>
```
After:
```tsx
<MyBackHomeNav
  backPath={`/${adminSecret}/dashboard/entries/${entid}`}
  backLabel='Back to Entry'
  linkClass='text-blue-600 hover:underline'
/>
```

### src/app/[admin_secret]/dashboard/entries/[ent_entid]/page.tsx
Before:
```tsx
<Link href={`/${admin_secret}/dashboard/entries`} className='text-blue-600 hover:underline mb-4 inline-block'>
  ← Back to Entries
</Link>
```
After:
```tsx
<MyBackHomeNav
  backPath={`/${admin_secret}/dashboard/entries`}
  backLabel='Back to Entries'
  containerClass='flex gap-3 mb-4'
  linkClass='text-blue-600 hover:underline'
/>
```

## Testing
- [ ] Each of the 6 pages still shows a working back-link with unchanged wording, plus a new "⌂ Home" link pointing at `/`.
- [ ] `npx tsc --noEmit` and `npm run build` pass.
