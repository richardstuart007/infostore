'use server'

import { table_fetch } from 'nextjs-shared/table_fetch'
import { table_write } from 'nextjs-shared/table_write'
import { table_update } from 'nextjs-shared/table_update'
import { table_delete } from 'nextjs-shared/table_delete'
import { table_count } from 'nextjs-shared/table_count'
import { table_query } from 'nextjs-shared/table_query'
import { write_Logging } from 'nextjs-shared/write_logging'
import type { ColumnValuePair } from 'nextjs-shared/structures'

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

//----------------------------------------------------------------------------------
//  fetchAllEntries — fetch all entries
//----------------------------------------------------------------------------------
export async function fetchAllEntries(caller: string): Promise<EntryRow[]> {
  try {
    const rows = await table_fetch({
      caller,
      table: 'tent_entries',
      skipCache: false
    })
    return rows as EntryRow[]
  } catch (error) {
    await write_Logging({
      lg_functionname: 'fetchAllEntries',
      lg_msg: 'Failed to fetch entries: ' + (error as Error).message,
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
    await write_Logging({
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
    await write_Logging({
      lg_functionname: 'fetchEntriesCount',
      lg_msg: 'Failed to count entries: ' + (error as Error).message,
      lg_caller: caller,
      lg_severity: 'E'
    })
    return 0
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
    const pairs: ColumnValuePair[] = [
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
    await write_Logging({
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
    const pairs: ColumnValuePair[] = [
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
      whereColumnValuePairs: [{ column: 'ent_entid', value: entid, operator: '=' }]
    })
    return (result[0] as EntryRow) || null
  } catch (error) {
    await write_Logging({
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
    await write_Logging({
      lg_functionname: 'deleteEntry',
      lg_msg: 'Failed to delete entry: ' + (error as Error).message,
      lg_caller: caller,
      lg_severity: 'E'
    })
    return false
  }
}
