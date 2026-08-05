'use server'

import { table_fetch } from 'nextjs-shared/table_fetch'
import { table_write } from 'nextjs-shared/table_write'
import { table_update } from 'nextjs-shared/table_update'
import { table_delete } from 'nextjs-shared/table_delete'
import { table_count } from 'nextjs-shared/table_count'
import { table_query } from 'nextjs-shared/table_query'
import { write_logging } from 'nextjs-shared/write_logging'
import { fetchFiltered } from 'nextjs-shared/fetchFiltered'
import { fetchTotalPages } from 'nextjs-shared/fetchTotalPages'
import type { WriteColumnValuePair, Filter } from 'nextjs-shared/structures'
import { ENTRIES_ITEMS_PER_PAGE, RECENT_ENTRIES_LIMIT } from './constants'

export interface EntryRow {
  ent_entid: number
  ent_title: string
  ent_summary: string
  ent_categories: string[]
  ent_source_url: string | null
  ent_article_date: string | null
  ent_country: string | null
  ent_author: string | null
  ent_publication: string | null
}

export type EntryFilters = {
  searchTerm?: string
  categories?: string[]
  countries?: string[]
  dateFrom?: string
  dateTo?: string
}

//----------------------------------------------------------------------------------
//  buildEntryFilters — EntryFilters -> Filter[], only including filters actually set
//----------------------------------------------------------------------------------
function buildEntryFilters(filters: EntryFilters): Filter[] {
  const result: Filter[] = []
  if (filters.searchTerm) {
    result.push({ column: 'ent_title', operator: 'LIKE', value: filters.searchTerm })
  }
  if (filters.categories && filters.categories.length > 0) {
    result.push({ column: 'ent_categories', operator: 'ARRAY_OVERLAP', value: filters.categories })
  }
  if (filters.countries && filters.countries.length > 0) {
    result.push({ column: 'ent_country', operator: 'IN', value: filters.countries })
  }
  if (filters.dateFrom) {
    result.push({ column: 'ent_article_date', operator: '>=', value: filters.dateFrom })
  }
  if (filters.dateTo) {
    result.push({ column: 'ent_article_date', operator: '<=', value: filters.dateTo })
  }
  return result
}

//----------------------------------------------------------------------------------
//  fetchFilteredEntries — rows for the current page of a filtered entries list
//----------------------------------------------------------------------------------
export async function fetchFilteredEntries(
  filters: EntryFilters,
  page: number,
  caller: string,
  itemsPerPage: number = ENTRIES_ITEMS_PER_PAGE
): Promise<EntryRow[]> {
  const offset = (page - 1) * itemsPerPage
  const rows = await fetchFiltered({
    caller,
    table: 'tent_entries',
    filters: buildEntryFilters(filters),
    orderBy: 'ent_entid DESC',
    limit: itemsPerPage,
    offset
  })
  return rows as EntryRow[]
}

//----------------------------------------------------------------------------------
//  getEntriesPageCount — total page count for fetchFilteredEntries' same filter set
//----------------------------------------------------------------------------------
export async function getEntriesPageCount(
  filters: EntryFilters,
  caller: string,
  itemsPerPage: number = ENTRIES_ITEMS_PER_PAGE
): Promise<number> {
  return fetchTotalPages({
    caller,
    table: 'tent_entries',
    filters: buildEntryFilters(filters),
    items_per_page: itemsPerPage
  })
}

//----------------------------------------------------------------------------------
//  fetchRecentEntries — most recent entries for a dashboard widget
//----------------------------------------------------------------------------------
export async function fetchRecentEntries(caller: string): Promise<EntryRow[]> {
  const rows = await fetchFiltered({
    caller,
    table: 'tent_entries',
    orderBy: 'ent_entid DESC',
    limit: RECENT_ENTRIES_LIMIT
  })
  return rows as EntryRow[]
}

//----------------------------------------------------------------------------------
//  fetchDistinctCountries — get all unique countries across entries
//----------------------------------------------------------------------------------
export async function fetchDistinctCountries(caller: string): Promise<string[]> {
  try {
    const result = await table_query({
      caller,
      query: `SELECT DISTINCT ent_country FROM tent_entries WHERE ent_country IS NOT NULL ORDER BY ent_country`,
      params: []
    })
    return result.map((row: { ent_country: string }) => row.ent_country).filter(Boolean)
  } catch (error) {
    await write_logging({
      lg_functionname: 'fetchDistinctCountries',
      lg_msg: 'Failed to fetch countries: ' + (error as Error).message,
      lg_caller: caller,
      lg_severity: 'E'
    })
    return []
  }
}

//----------------------------------------------------------------------------------
//  fetchEntryById — fetch single entry by ID
//----------------------------------------------------------------------------------
export async function fetchEntryById(entid: number, caller: string): Promise<EntryRow | null> {
  try {
    const rows = await table_fetch({
      caller,
      table: 'tent_entries',
      whereColumnValuePairs: [{ column: 'ent_entid', value: entid, operator: '=' }],
      skipCache: false
    })
    return (rows[0] as EntryRow) || null
  } catch (error) {
    await write_logging({
      lg_functionname: 'fetchEntryById',
      lg_msg: 'Failed to fetch entry: ' + (error as Error).message,
      lg_caller: caller,
      lg_severity: 'E'
    })
    return null
  }
}

//----------------------------------------------------------------------------------
//  fetchEntriesCount — get total entry count
//----------------------------------------------------------------------------------
export async function fetchEntriesCount(caller: string): Promise<number> {
  try {
    const count = await table_count({
      caller,
      table: 'tent_entries'
    })
    return count
  } catch (error) {
    await write_logging({
      lg_functionname: 'fetchEntriesCount',
      lg_msg: 'Failed to count entries: ' + (error as Error).message,
      lg_caller: caller,
      lg_severity: 'E'
    })
    return 0
  }
}

//----------------------------------------------------------------------------------
//  checkDuplicateUrl — check if URL already exists
//----------------------------------------------------------------------------------
export async function checkDuplicateUrl(sourceUrl: string, caller: string): Promise<boolean> {
  if (!sourceUrl) return false
  try {
    const existing = await fetchBySourceUrl(sourceUrl, caller)
    return existing !== null
  } catch {
    return false
  }
}

//----------------------------------------------------------------------------------
//  fetchBySourceUrl — fetch entry by source URL
//----------------------------------------------------------------------------------
async function fetchBySourceUrl(sourceUrl: string, caller: string): Promise<EntryRow | null> {
  try {
    const rows = await table_fetch({
      caller,
      table: 'tent_entries',
      whereColumnValuePairs: [{ column: 'ent_source_url', value: sourceUrl, operator: '=' }],
      skipCache: true
    })
    return (rows[0] as EntryRow) || null
  } catch (error) {
    return null
  }
}

//----------------------------------------------------------------------------------
//  createEntry — insert new entry
//----------------------------------------------------------------------------------
export async function createEntry(
  title: string,
  summary: string,
  categories: string[],
  sourceUrl: string | null,
  articleDate: string | null,
  country: string | null,
  author: string | null,
  publication: string | null,
  caller: string
): Promise<EntryRow | null> {
  try {
    if (sourceUrl && await checkDuplicateUrl(sourceUrl, caller)) {
      await write_logging({
        lg_functionname: 'createEntry',
        lg_msg: 'Duplicate URL rejected: ' + sourceUrl,
        lg_caller: caller,
        lg_severity: 'W'
      })
      return null
    }

    const pairs: WriteColumnValuePair[] = [
      { column: 'ent_title', value: title },
      { column: 'ent_summary', value: summary },
      { column: 'ent_categories', value: categories },
    ]
    if (sourceUrl) {
      pairs.push({ column: 'ent_source_url', value: sourceUrl })
    }
    if (articleDate) {
      pairs.push({ column: 'ent_article_date', value: articleDate })
    }
    if (country) {
      pairs.push({ column: 'ent_country', value: country })
    }
    if (author) {
      pairs.push({ column: 'ent_author', value: author })
    }
    if (publication) {
      pairs.push({ column: 'ent_publication', value: publication })
    }

    const result = await table_write({
      caller,
      table: 'tent_entries',
      columnValuePairs: pairs
    })
    return (result[0] as EntryRow) || null
  } catch (error) {
    await write_logging({
      lg_functionname: 'createEntry',
      lg_msg: 'Failed to create entry: ' + (error as Error).message,
      lg_caller: caller,
      lg_severity: 'E'
    })
    return null
  }
}

//----------------------------------------------------------------------------------
//  updateEntry — update entry
//----------------------------------------------------------------------------------
export async function updateEntry(
  entid: number,
  title: string,
  summary: string,
  categories: string[],
  sourceUrl: string | null,
  articleDate: string | null,
  country: string | null,
  author: string | null,
  publication: string | null,
  caller: string
): Promise<EntryRow | null> {
  try {
    const pairs: WriteColumnValuePair[] = [
      { column: 'ent_title', value: title },
      { column: 'ent_summary', value: summary },
      { column: 'ent_categories', value: categories }
    ]
    if (sourceUrl) {
      pairs.push({ column: 'ent_source_url', value: sourceUrl })
    }
    if (articleDate) {
      pairs.push({ column: 'ent_article_date', value: articleDate })
    }
    if (country) {
      pairs.push({ column: 'ent_country', value: country })
    }
    if (author) {
      pairs.push({ column: 'ent_author', value: author })
    }
    if (publication) {
      pairs.push({ column: 'ent_publication', value: publication })
    }

    const result = await table_update({
      caller,
      table: 'tent_entries',
      columnValuePairs: pairs,
      whereColumnValuePairs: [{ column: 'ent_entid', value: entid }]
    })
    return (result[0] as EntryRow) || null
  } catch (error) {
    await write_logging({
      lg_functionname: 'updateEntry',
      lg_msg: 'Failed to update entry: ' + (error as Error).message,
      lg_caller: caller,
      lg_severity: 'E'
    })
    return null
  }
}

//----------------------------------------------------------------------------------
//  deleteEntry — delete entry and cascade delete arguments and sources
//----------------------------------------------------------------------------------
export async function deleteEntry(entid: number, caller: string): Promise<boolean> {
  try {
    await table_delete({
      caller,
      table: 'targ_arguments',
      whereColumnValuePairs: [{ column: 'arg_entid', value: entid, operator: '=' }]
    })

    await table_delete({
      caller,
      table: 'tsrc_sources',
      whereColumnValuePairs: [{ column: 'src_entid', value: entid, operator: '=' }]
    })

    await table_delete({
      caller,
      table: 'tent_entries',
      whereColumnValuePairs: [{ column: 'ent_entid', value: entid, operator: '=' }]
    })

    return true
  } catch (error) {
    await write_logging({
      lg_functionname: 'deleteEntry',
      lg_msg: 'Failed to delete entry: ' + (error as Error).message,
      lg_caller: caller,
      lg_severity: 'E'
    })
    return false
  }
}
