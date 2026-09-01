'use server'

//==============================================================================================
//  1) DESCRIPTION
//    fetchDistinctCategories — sorted list of unique single-word categories across every
//    entry, via unnest() over the ent_categories TEXT[] column.
//
//    Parameters:
//      caller — identifier of the calling code, passed through for logging
//
//    Returns:
//      string[] — sorted distinct category values; [] on any query failure (logged 'E')
//==============================================================================================

import { table_query } from 'nextjs-shared/table_query'
import { write_logging } from 'nextjs-shared/write_logging'

export async function fetchDistinctCategories(caller: string): Promise<string[]> {
  try {
    const result = await table_query({
      caller,
      table: 'tent_entries',
      query: `SELECT DISTINCT unnest(ent_categories) as category FROM tent_entries WHERE ent_categories != '{}' ORDER BY category`,
      params: []
    })
    if (!result.ok) {
      await write_logging({
        lg_functionname: 'fetchDistinctCategories',
        lg_msg: 'Failed to fetch categories: ' + result.error,
        lg_caller: caller,
        lg_severity: 'E'
      })
      return []
    }
    return result.data.map((row: { category: string }) => row.category).filter(Boolean)
  } catch (error) {
    await write_logging({
      lg_functionname: 'fetchDistinctCategories',
      lg_msg: 'Failed to fetch categories: ' + (error as Error).message,
      lg_caller: caller,
      lg_severity: 'E'
    })
    return []
  }
}
