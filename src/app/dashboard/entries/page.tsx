'use client'

import { useState, useEffect } from 'react'
import { fetchFilteredEntries, getEntriesPageCount } from '@/src/lib/entries'
import { fetchDistinctCategories } from '@/src/lib/categories'
import type { EntryRow } from '@/src/lib/entries'
import { MyInput } from 'nextjs-shared/MyInput'
import MySelect from 'nextjs-shared/MySelect'
import { MyLink } from 'nextjs-shared/MyLink'
import MyPaginationFooter from 'nextjs-shared/MyPaginationFooter'
import { ENTRIES_ITEMS_PER_PAGE } from '@/src/lib/constants'

export default function EntriesListPage() {
  const [entries, setEntries] = useState<EntryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [allCategories, setAllCategories] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(ENTRIES_ITEMS_PER_PAGE)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    async function loadCategories() {
      const cats = await fetchDistinctCategories('EntriesListPage')
      setAllCategories(cats)
    }
    loadCategories()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function load() {
      const filters = {
        searchTerm: searchTerm || undefined,
        categories: selectedCategory ? [selectedCategory] : undefined
      }
      const [rows, pages] = await Promise.all([
        fetchFilteredEntries(filters, currentPage, 'EntriesListPage', rowsPerPage),
        getEntriesPageCount(filters, 'EntriesListPage', rowsPerPage)
      ])
      if (!cancelled) {
        setEntries(rows)
        setTotalPages(pages)
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [searchTerm, selectedCategory, currentPage, rowsPerPage])

  if (loading && entries.length === 0) {
    return <div className='text-center py-8'>Loading...</div>
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Entries</h1>
        <MyLink
          href={{ pathname: '/dashboard/entries/new', reference: 'new-entry' }}
          overrideClass='h-auto md:h-auto px-4 md:px-4 py-2 rounded bg-blue-600 hover:bg-blue-700'
        >
          + New Entry
        </MyLink>
      </div>

      <div className='flex gap-4'>
        <MyInput
          type='text'
          placeholder='Search by title...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          overrideClass='flex-1 h-auto md:h-auto px-4 md:px-4 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
        <MySelect
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          overrideClass='w-auto md:w-auto h-auto md:h-auto px-4 md:px-4 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          <option value=''>All Categories</option>
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </MySelect>
      </div>

      {entries.length === 0 ? (
        <p className='text-gray-500 py-8'>No entries found</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-gray-100 border-b border-gray-300'>
                <th className='text-left px-4 py-3 font-semibold'>Title</th>
                <th className='text-left px-4 py-3 font-semibold'>Categories</th>
                <th className='text-center px-4 py-3 font-semibold w-20'>Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.ent_entid} className='border-b border-gray-200 hover:bg-gray-50'>
                  <td className='px-4 py-3'>{entry.ent_title}</td>
                  <td className='px-4 py-3'>
                    <div className='flex gap-2 flex-wrap'>
                      {entry.ent_categories.map((cat) => (
                        <span key={cat} className='inline-block px-2 py-1 text-xs bg-gray-200 rounded'>
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className='px-4 py-3 text-center'>
                    <MyLink
                      href={{
                        pathname: `/dashboard/entries/${entry.ent_entid}`,
                        reference: 'entry-detail',
                        segment: String(entry.ent_entid)
                      }}
                      overrideClass='h-auto md:h-auto px-0 md:px-0 bg-transparent hover:bg-transparent text-blue-600 hover:underline'
                    >
                      View
                    </MyLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <MyPaginationFooter
          totalPages={totalPages}
          statecurrentPage={currentPage}
          setStateCurrentPage={setCurrentPage}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={(v) => { setRowsPerPage(v); setCurrentPage(1) }}
        />
      )}
    </div>
  )
}
