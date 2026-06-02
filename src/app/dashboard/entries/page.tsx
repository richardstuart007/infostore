'use client'

import { useState, useEffect } from 'react'
import { fetchAllEntries } from '@/src/lib/entries'
import Link from 'next/link'
import type { EntryRow } from '@/src/lib/entries'

export default function EntriesListPage() {
  const [entries, setEntries] = useState<EntryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    async function load() {
      const data = await fetchAllEntries('EntriesListPage')
      setEntries(data)
      setLoading(false)
    }
    load()
  }, [])

  const allCategories = [...new Set(entries.flatMap(e => e.ent_categories))].sort()

  const filtered = entries.filter((entry) => {
    const matchesSearch = entry.ent_title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || entry.ent_categories.includes(selectedCategory)
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return <div className='text-center py-8'>Loading...</div>
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Entries</h1>
        <Link href='/dashboard/entries/new' className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
          + New Entry
        </Link>
      </div>

      <div className='flex gap-4'>
        <input
          type='text'
          placeholder='Search by title...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className='px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          <option value=''>All Categories</option>
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
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
              {filtered.map((entry) => (
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
                    <Link
                      href={`/dashboard/entries/${entry.ent_entid}`}
                      className='text-blue-600 hover:underline'
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
