'use server'

import { table_query } from 'nextjs-shared/table_query'
import { write_Logging } from 'nextjs-shared/write_logging'

//----------------------------------------------------------------------------------
//  fetchDistinctCategories — get all unique categories across entries
//----------------------------------------------------------------------------------
export async function fetchDistinctCategories(caller: string): Promise<string[]> {
  try {
    const result = await table_query({
      caller,
      query: `SELECT DISTINCT unnest(ent_categories) as category FROM tent_entries WHERE ent_categories != '{}' ORDER BY category`,
      params: []
    })
    return result.map((row: { category: string }) => row.category).filter(Boolean)
  } catch (error) {
    await write_Logging({
      lg_functionname: 'fetchDistinctCategories',
      lg_msg: 'Failed to fetch categories: ' + (error as Error).message,
      lg_caller: caller,
      lg_severity: 'E'
    })
    return []
  }
}

//----------------------------------------------------------------------------------
//  normalizeCategory — lowercase and trim category
//----------------------------------------------------------------------------------
export function normalizeCategory(category: string): string {
  return category.toLowerCase().trim()
}
