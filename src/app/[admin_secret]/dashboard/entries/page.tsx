'use client'

import { useState, useEffect } from 'react'
import { fetchAllEntries, deleteEntry } from '@/src/lib/entries'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { EntryRow } from '@/src/lib/entries'

export default function AdminEntriesListPage() {
  const params = useParams()
  const adminSecret = params?.admin_secret as string
  const [entries, setEntries] = useState<EntryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      const data = await fetchAllEntries('AdminEntriesListPage')
      setEntries(data)
      setLoading(false)
    }
    load()
  }, [])

  async function handleDelete(entid: number) {
    setDeleting(true)
    const success = await deleteEntry(entid, 'AdminEntriesListPage')
    setDeleting(false)
    if (success) {
      setEntries(entries.filter(e => e.ent_entid !== entid))
      setDeleteConfirmId(null)
    } else {
      alert('Failed to delete entry')
    }
  }

  const allCategories = [...new Set(entries.flatMap(e => e.ent_categories))].sort()
  const allCountries = [...new Set(entries.map(e => e.ent_country).filter(Boolean))].sort() as string[]

  const [selectedCountries, setSelectedCountries] = useState<string[]>([])

  const filtered = entries.filter((entry) => {
    const matchesSearch = entry.ent_title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategories = selectedCategories.length === 0 ||
      selectedCategories.some(cat => entry.ent_categories.includes(cat))
    const matchesCountries = selectedCountries.length === 0 ||
      (entry.ent_country && selectedCountries.includes(entry.ent_country))
    const matchesDateFrom = !dateFrom || (entry.ent_article_date && entry.ent_article_date >= dateFrom)
    const matchesDateTo = !dateTo || (entry.ent_article_date && entry.ent_article_date <= dateTo)
    return matchesSearch && matchesCategories && matchesCountries && matchesDateFrom && matchesDateTo
  })

  if (loading) {
    return <div className='text-center py-8'>Loading...</div>
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Entries</h1>
        <Link href={`/${adminSecret}/dashboard/entries/new`} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
          + New Entry
        </Link>
      </div>

      <div className='space-y-4'>
        <input
          type='text'
          placeholder='Search by title...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
        />

        <div className='grid grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>Categories</label>
            <div className='border border-gray-300 rounded p-2 max-h-40 overflow-y-auto'>
              {allCategories.length === 0 ? (
                <p className='text-gray-500 text-sm'>No categories</p>
              ) : (
                allCategories.map((cat) => (
                  <label key={cat} className='flex items-center gap-2 mb-2'>
                    <input
                      type='checkbox'
                      checked={selectedCategories.includes(cat)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, cat])
                        } else {
                          setSelectedCategories(selectedCategories.filter(c => c !== cat))
                        }
                      }}
                      className='cursor-pointer'
                    />
                    <span className='text-sm'>{cat}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>Countries</label>
            <div className='border border-gray-300 rounded p-2 max-h-40 overflow-y-auto'>
              {allCountries.length === 0 ? (
                <p className='text-gray-500 text-sm'>No countries</p>
              ) : (
                allCountries.map((country) => (
                  <label key={country} className='flex items-center gap-2 mb-2'>
                    <input
                      type='checkbox'
                      checked={selectedCountries.includes(country)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCountries([...selectedCountries, country])
                        } else {
                          setSelectedCountries(selectedCountries.filter(c => c !== country))
                        }
                      }}
                      className='cursor-pointer'
                    />
                    <span className='text-sm'>{country}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>Date From</label>
            <input
              type='date'
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>Date To</label>
            <input
              type='date'
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className='text-gray-500 py-8'>No entries found</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-gray-100 border-b border-gray-300'>
                <th className='text-left px-4 py-3 font-semibold'>Title</th>
                <th className='text-left px-4 py-3 font-semibold w-32'>Date</th>
                <th className='text-left px-4 py-3 font-semibold w-24'>Country</th>
                <th className='text-left px-4 py-3 font-semibold'>Categories</th>
                <th className='text-center px-4 py-3 font-semibold w-32'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.ent_entid} className='border-b border-gray-200 hover:bg-gray-50'>
                  <td className='px-4 py-3'>{entry.ent_title}</td>
                  <td className='px-4 py-3 text-sm'>{entry.ent_article_date || '-'}</td>
                  <td className='px-4 py-3 text-sm'>{entry.ent_country || '-'}</td>
                  <td className='px-4 py-3'>
                    <div className='flex gap-2 flex-wrap'>
                      {entry.ent_categories.map((cat) => (
                        <span key={cat} className='inline-block px-2 py-1 text-xs bg-gray-200 rounded'>
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className='px-4 py-3 text-center space-x-2'>
                    <Link
                      href={`/${adminSecret}/dashboard/entries/${entry.ent_entid}`}
                      className='text-blue-600 hover:underline'
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteConfirmId(entry.ent_entid)}
                      className='text-red-600 hover:underline'
                    >
                      Delete
                    </button>

                    {deleteConfirmId === entry.ent_entid && (
                      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                        <div className='bg-white rounded-lg p-6 max-w-sm mx-4'>
                          <h3 className='text-lg font-bold text-gray-900 mb-2'>Delete Entry?</h3>
                          <p className='text-gray-600 mb-4'>
                            This will delete the entry and all related arguments and sources. This cannot be undone.
                          </p>
                          <p className='font-semibold text-gray-900 mb-4'>"{entry.ent_title}"</p>
                          <div className='flex gap-2'>
                            <button
                              onClick={() => handleDelete(entry.ent_entid)}
                              disabled={deleting}
                              className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50'
                            >
                              {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className='px-4 py-2 bg-gray-300 rounded hover:bg-gray-400'
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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
