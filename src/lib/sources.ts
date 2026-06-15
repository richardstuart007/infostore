'use server'

import { table_fetch } from 'nextjs-shared/table_fetch'
import { table_write } from 'nextjs-shared/table_write'
import { table_update } from 'nextjs-shared/table_update'
import { table_delete } from 'nextjs-shared/table_delete'
import { write_logging } from 'nextjs-shared/write_logging'
import type { WriteColumnValuePair } from 'nextjs-shared/structures'

export interface SourceRow {
  src_srcid: number
  src_entid: number
  src_url: string
  src_title: string | null
}

//----------------------------------------------------------------------------------
//  fetchSourcesByEntry — fetch all sources for an entry
//----------------------------------------------------------------------------------
export async function fetchSourcesByEntry(entid: number, caller: string): Promise<SourceRow[]> {
  try {
    const rows = await table_fetch({
      caller,
      table: 'tsrc_sources',
      whereColumnValuePairs: [{ column: 'src_entid', value: entid, operator: '=' }],
      skipCache: false
    })
    return rows as SourceRow[]
  } catch (error) {
    await write_logging({
      lg_functionname: 'fetchSourcesByEntry',
      lg_msg: 'Failed to fetch sources: ' + (error as Error).message,
      lg_caller: caller,
      lg_severity: 'E'
    })
    return []
  }
}

//----------------------------------------------------------------------------------
//  createSource — insert new source
//----------------------------------------------------------------------------------
export async function createSource(
  entid: number,
  url: string,
  title: string | null,
  caller: string
): Promise<SourceRow | null> {
  try {
    const pairs: WriteColumnValuePair[] = [
      { column: 'src_entid', value: entid },
      { column: 'src_url', value: url }
    ]
    if (title) {
      pairs.push({ column: 'src_title', value: title })
    }

    const result = await table_write({
      caller,
      table: 'tsrc_sources',
      columnValuePairs: pairs
    })
    return (result[0] as SourceRow) || null
  } catch (error) {
    await write_logging({
      lg_functionname: 'createSource',
      lg_msg: 'Failed to create source: ' + (error as Error).message,
      lg_caller: caller,
      lg_severity: 'E'
    })
    return null
  }
}

//----------------------------------------------------------------------------------
//  updateSource — update source
//----------------------------------------------------------------------------------
export async function updateSource(
  srcid: number,
  url: string,
  title: string | null,
  caller: string
): Promise<SourceRow | null> {
  try {
    const pairs: WriteColumnValuePair[] = [
      { column: 'src_url', value: url }
    ]
    if (title) {
      pairs.push({ column: 'src_title', value: title })
    }

    const result = await table_update({
      caller,
      table: 'tsrc_sources',
      columnValuePairs: pairs,
      whereColumnValuePairs: [{ column: 'src_srcid', value: srcid }]
    })
    return (result[0] as SourceRow) || null
  } catch (error) {
    await write_logging({
      lg_functionname: 'updateSource',
      lg_msg: 'Failed to update source: ' + (error as Error).message,
      lg_caller: caller,
      lg_severity: 'E'
    })
    return null
  }
}

//----------------------------------------------------------------------------------
//  deleteSource — delete source
//----------------------------------------------------------------------------------
export async function deleteSource(srcid: number, caller: string): Promise<boolean> {
  try {
    await table_delete({
      caller,
      table: 'tsrc_sources',
      whereColumnValuePairs: [{ column: 'src_srcid', value: srcid, operator: '=' }]
    })
    return true
  } catch (error) {
    await write_logging({
      lg_functionname: 'deleteSource',
      lg_msg: 'Failed to delete source: ' + (error as Error).message,
      lg_caller: caller,
      lg_severity: 'E'
    })
    return false
  }
}
