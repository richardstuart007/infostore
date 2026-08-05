'use client'

import { useState, useEffect } from 'react'
import { fetchFilteredEntries, getEntriesPageCount, deleteEntry, fetchDistinctCountries } from '@/src/lib/entries'
import { fetchDistinctCategories } from '@/src/lib/categories'
import { useParams } from 'next/navigation'
import type { EntryRow } from '@/src/lib/entries'
import { MyInput } from 'nextjs-shared/MyInput'
import { MyButton } from 'nextjs-shared/MyButton'
import { MyLink } from 'nextjs-shared/MyLink'
import { MyConfirmDialog, type ConfirmDialogInt } from 'nextjs-shared/MyConfirmDialog'
import MyCheckBox from 'nextjs-shared/MyCheckbox'
import MyPaginationFooter from 'nextjs-shared/MyPaginationFooter'
import { ENTRIES_ITEMS_PER_PAGE } from '@/src/lib/constants'

const CONFIRM_DIALOG_INITIAL: ConfirmDialogInt = {
  isOpen: false,
  title: '',
  subTitle: '',
  onConfirm: () => {}
}

export default function AdminEntriesListPage() {
  const params = useParams()
  const adminSecret = params?.admin_secret as string
  const [entries, setEntries] = useState<EntryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogInt>(CONFIRM_DIALOG_INITIAL)
  const [allCategories, setAllCategories] = useState<string[]>([])
  const [allCountries, setAllCountries] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(ENTRIES_ITEMS_PER_PAGE)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    async function loadOptions() {
      const [cats, countries] = await Promise.all([
        fetchDistinctCategories('AdminEntriesListPage'),
        fetchDistinctCountries('AdminEntriesListPage')
      ])
      setAllCategories(cats)
      setAllCountries(countries)
    }
    loadOptions()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategories, selectedCountries, dateFrom, dateTo])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function load() {
      const filters = {
        searchTerm: searchTerm || undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        countries: selectedCountries.length > 0 ? selectedCountries : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined
      }
      const [rows, pages] = await Promise.all([
        fetchFilteredEntries(filters, currentPage, 'AdminEntriesListPage', rowsPerPage),
        getEntriesPageCount(filters, 'AdminEntriesListPage', rowsPerPage)
      ])
      if (!cancelled) {
        setEntries(rows)
        setTotalPages(pages)
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [searchTerm, selectedCategories, selectedCountries, dateFrom, dateTo, currentPage, rowsPerPage])

  async function handleDelete(entid: number) {
    const success = await deleteEntry(entid, 'AdminEntriesListPage')
    if (success) {
      setEntries(entries.filter(e => e.ent_entid !== entid))
    } else {
      alert('Failed to delete entry')
    }
  }

  function openDeleteConfirm(entry: EntryRow) {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Entry?',
      subTitle: 'This will delete the entry and all related arguments and sources. This cannot be undone.',
      line1: `"${entry.ent_title}"`,
      onConfirm: async () => {
        setConfirmDialog(d => ({ ...d, isOpen: false }))
        await handleDelete(entry.ent_entid)
      }
    })
  }

  if (loading && entries.length === 0) {
    return <div className='text-center py-8'>Loading...</div>
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Entries</h1>
        <MyLink
          href={{ pathname: `/${adminSecret}/dashboard/entries/new`, reference: 'new-entry' }}
          overrideClass='h-auto md:h-auto px-4 md:px-4 py-2 rounded bg-blue-600 hover:bg-blue-700'
        >
          + New Entry
        </MyLink>
      </div>

      <div className='space-y-4'>
        <MyInput
          type='text'
          placeholder='Search by title...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          overrideClass='w-full h-auto md:h-auto px-4 md:px-4 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
        />

        <div className='grid grid-cols-4 gap-4'>
          <div>
            <MyCheckBox
              label='Categories'
              name='categories'
              selectedOptions={selectedCategories}
              setSelectedOptions={(v) => setSelectedCategories(v as string[])}
              options={allCategories.map(cat => ({ value: cat, label: cat }))}
              searchEnabled={false}
              showSelectedCount={false}
              showResortButton={false}
              defaultClass_Container='border border-gray-300 rounded p-2 max-h-40 overflow-y-auto w-full'
            />
          </div>

          <div>
            <MyCheckBox
              label='Countries'
              name='countries'
              selectedOptions={selectedCountries}
              setSelectedOptions={(v) => setSelectedCountries(v as string[])}
              options={allCountries.map(country => ({ value: country, label: country }))}
              searchEnabled={false}
              showSelectedCount={false}
              showResortButton={false}
              defaultClass_Container='border border-gray-300 rounded p-2 max-h-40 overflow-y-auto w-full'
            />
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>Date From</label>
            <MyInput
              type='date'
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              overrideClass='w-full h-auto md:h-auto px-4 md:px-4 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>Date To</label>
            <MyInput
              type='date'
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              overrideClass='w-full h-auto md:h-auto px-4 md:px-4 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
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
              {entries.map((entry) => (
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
                    <MyLink
                      href={{
                        pathname: `/${adminSecret}/dashboard/entries/${entry.ent_entid}`,
                        reference: 'edit-entry',
                        segment: String(entry.ent_entid)
                      }}
                      overrideClass='h-auto md:h-auto px-0 md:px-0 bg-transparent hover:bg-transparent text-blue-600 hover:underline'
                    >
                      Edit
                    </MyLink>
                    <MyButton
                      onClick={() => openDeleteConfirm(entry)}
                      overrideClass='h-auto md:h-auto px-0 md:px-0 bg-transparent hover:bg-transparent text-red-600 hover:underline'
                    >
                      Delete
                    </MyButton>
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

      <MyConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />
    </div>
  )
}
