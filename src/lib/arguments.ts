'use server'

import { table_fetch } from 'nextjs-shared/table_fetch'
import { table_write } from 'nextjs-shared/table_write'
import { table_update } from 'nextjs-shared/table_update'
import { table_delete } from 'nextjs-shared/table_delete'
import { write_Logging } from 'nextjs-shared/write_logging'

export interface ArgumentRow {
  arg_argid: number
  arg_entid: number
  arg_text: string
  arg_relevance: number
}

//----------------------------------------------------------------------------------
//  fetchArgumentsByEntry — fetch all arguments for an entry
//----------------------------------------------------------------------------------
export async function fetchArgumentsByEntry(entid: number, caller: string): Promise<ArgumentRow[]> {
  try {
    const rows = await table_fetch({
      caller,
      table: 'targ_arguments',
      whereColumnValuePairs: [{ column: 'arg_entid', value: entid, operator: '=' }],
      orderBy: 'arg_relevance DESC',
      skipCache: false
    })
    return rows as ArgumentRow[]
  } catch (error) {
    await write_Logging({
      lg_functionname: 'fetchArgumentsByEntry',
      lg_msg: 'Failed to fetch arguments: ' + (error as Error).message,
      lg_caller: caller,
      lg_severity: 'E'
    })
    return []
  }
}

//----------------------------------------------------------------------------------
//  createArgument — insert new argument
//----------------------------------------------------------------------------------
export async function createArgument(
  entid: number,
  text: string,
  relevance: number,
  caller: string
): Promise<ArgumentRow | null> {
  try {
    const result = await table_write({
      caller,
      table: 'targ_arguments',
      columnValuePairs: [
        { column: 'arg_entid', value: entid },
        { column: 'arg_text', value: text },
        { column: 'arg_relevance', value: relevance }
      ]
    })
    return (result[0] as ArgumentRow) || null
  } catch (error) {
    await write_Logging({
      lg_functionname: 'createArgument',
      lg_msg: 'Failed to create argument: ' + (error as Error).message,
      lg_caller: caller,
      lg_severity: 'E'
    })
    return null
  }
}

//----------------------------------------------------------------------------------
//  updateArgument — update argument
//----------------------------------------------------------------------------------
export async function updateArgument(
  argid: number,
  text: string,
  relevance: number,
  caller: string
): Promise<ArgumentRow | null> {
  try {
    const result = await table_update({
      caller,
      table: 'targ_arguments',
      columnValuePairs: [
        { column: 'arg_text', value: text },
        { column: 'arg_relevance', value: relevance }
      ],
      whereColumnValuePairs: [{ column: 'arg_argid', value: argid }]
    })
    return (result[0] as ArgumentRow) || null
  } catch (error) {
    await write_Logging({
      lg_functionname: 'updateArgument',
      lg_msg: 'Failed to update argument: ' + (error as Error).message,
      lg_caller: caller,
      lg_severity: 'E'
    })
    return null
  }
}

//----------------------------------------------------------------------------------
//  deleteArgument — delete argument
//----------------------------------------------------------------------------------
export async function deleteArgument(argid: number, caller: string): Promise<boolean> {
  try {
    await table_delete({
      caller,
      table: 'targ_arguments',
      whereColumnValuePairs: [{ column: 'arg_argid', value: argid, operator: '=' }]
    })
    return true
  } catch (error) {
    await write_Logging({
      lg_functionname: 'deleteArgument',
      lg_msg: 'Failed to delete argument: ' + (error as Error).message,
      lg_caller: caller,
      lg_severity: 'E'
    })
    return false
  }
}
