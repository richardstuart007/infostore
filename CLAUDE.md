# infostore — Claude guidance

## nextjs-shared reference
Read `node_modules/nextjs-shared/CONSUMING_PROJECTS.md` before implementing any feature from nextjs-shared. It contains all component APIs, database function signatures, coding conventions, and setup instructions.

## Purpose

InfoStore is a database of documented examples of harmful societal actions. Users can browse entries, submit new entries via URL (AI-assisted extraction using Ollama), attach arguments with relevance scores, and link source URLs. An admin route provides the same capabilities behind a secret URL segment.

## Running locally

```
npm run locallocal   # port 3040, local DB
npm run localprod    # port 3042, prod DB
```

Env files: `.env.locallocal` and `.env.localprod`. The selected env is copied to `.env` before `next dev` starts.

## Routes

| Route | Purpose |
|---|---|
| `/` | Welcome page — link to /dashboard |
| `/dashboard` | Overview: entry count, recent 5 entries |
| `/dashboard/entries` | Paginated entry list with search and category filter |
| `/dashboard/entries/new` | New entry form — paste URL to AI-analyse, then edit and save |
| `/dashboard/entries/[ent_entid]` | Entry detail — metadata, arguments (by relevance), sources |
| `/dashboard/entries/[ent_entid]/edit` | Edit entry |
| `/[admin_secret]/dashboard/...` | Admin mirror of all dashboard routes (same UI, protected by secret URL segment) |
| `/owner` | Logging + Cache tabs |
| `/owner/logging` | OwnerTableLogging panel |
| `/owner/cache/cache` | OwnerTableCache panel |
| `/api/analyze` | POST — analyses a URL via local Ollama (`qwen3:8b`) and returns structured JSON |

## Database tables

| Table | Columns | Purpose |
|---|---|---|
| `tent_entries` | `ent_*` | Core entries — title, summary, categories (TEXT[]), source URL, date, country, author, publication |
| `targ_arguments` | `arg_*` | Arguments linked to entries — text and relevance score (0–100) |
| `tsrc_sources` | `src_*` | Source URLs linked to entries |
| `xlg_logging` | `lg_*` | Application logging (nextjs-shared) |

## Key library files

| File | Purpose |
|---|---|
| `src/lib/entries.ts` | CRUD for `tent_entries` — fetch, create, update, delete, duplicate-URL check |
| `src/lib/arguments.ts` | CRUD for `targ_arguments` — fetched ordered by `arg_relevance DESC` |
| `src/lib/sources.ts` | CRUD for `tsrc_sources` |
| `src/lib/categories.ts` | `fetchDistinctCategories()` — uses `unnest()` to get unique values from `ent_categories` array |
| `src/lib/utils.ts` | `normalizeCategory()` — lowercase, trim, first word only (categories are single-word) |

## nextjs-shared usage

`table_fetch`, `table_write`, `table_update`, `table_delete`, `table_count`, `table_query`, `write_Logging`, `OwnerTableLogging`, `OwnerTableCache`

## AI analysis (Ollama)

`/api/analyze` calls a local Ollama instance at `localhost:11434` using model `qwen3:8b`. It extracts title, summary, single-word categories, arguments with relevance scores, sources, article date, country, author, and publication. Ollama must be running locally for this feature to work.

## Project conventions

- Categories are enforced as single-word lowercase strings via `normalizeCategory()`
- `ent_categories` is a Postgres `TEXT[]` column — use `unnest()` for distinct value queries
- Admin access is via a dynamic route segment `[admin_secret]` — the secret value comes from an env var
- Duplicate URL detection runs on entry creation (`checkDuplicateUrl()`)
