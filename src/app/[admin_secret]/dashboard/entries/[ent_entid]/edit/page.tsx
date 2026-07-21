'use client'

import { useState, useEffect } from 'react'
import { fetchEntryById, updateEntry, deleteEntry } from '@/src/lib/entries'
import { fetchArgumentsByEntry, deleteArgument } from '@/src/lib/arguments'
import { fetchSourcesByEntry, deleteSource } from '@/src/lib/sources'
import { fetchDistinctCategories } from '@/src/lib/categories'
import { normalizeCategory } from '@/src/lib/utils'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { EntryRow } from '@/src/lib/entries'
import type { ArgumentRow } from '@/src/lib/arguments'
import type { SourceRow } from '@/src/lib/sources'
import { MyInput } from 'nextjs-shared/MyInput'
import { MyTextarea } from 'nextjs-shared/MyTextarea'
import MySelect from 'nextjs-shared/MySelect'
import { MyButton } from 'nextjs-shared/MyButton'

export default function AdminEntryEditPage() {
  const params = useParams()
  const router = useRouter()
  const adminSecret = params?.admin_secret as string
  const entid = parseInt(params?.ent_entid as string)

  const [entry, setEntry] = useState<EntryRow | null>(null)
  const [arguments_, setArguments] = useState<ArgumentRow[]>([])
  const [sources, setSources] = useState<SourceRow[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    async function load() {
      const [e, args, srcs, cats] = await Promise.all([
        fetchEntryById(entid, 'AdminEntryEditPage'),
        fetchArgumentsByEntry(entid, 'AdminEntryEditPage'),
        fetchSourcesByEntry(entid, 'AdminEntryEditPage'),
        fetchDistinctCategories('AdminEntryEditPage')
      ])

      if (e) {
        setEntry(e)
        setArguments(args)
        setSources(srcs)
      }
      setAvailableCategories(cats)
      setLoading(false)
    }
    load()
  }, [entid])

  if (loading || !entry) {
    return <div className='text-center py-8'>Loading...</div>
  }

  async function handleSave() {
    if (!entry) return
    setSaving(true)
    const normalizedCategories = entry.ent_categories.map(normalizeCategory)
    const updated = await updateEntry(
      entid,
      entry.ent_title,
      entry.ent_summary,
      normalizedCategories,
      entry.ent_source_url,
      entry.ent_article_date,
      entry.ent_country,
      entry.ent_author,
      entry.ent_publication,
      'AdminEntryEditPage'
    )
    setSaving(false)
    if (updated) {
      router.push(`/${adminSecret}/dashboard/entries/${entid}`)
    }
  }

  async function handleDelete() {
    const success = await deleteEntry(entid, 'AdminEntryEditPage')
    if (success) {
      router.push(`/${adminSecret}/dashboard/entries`)
    }
  }

  return (
    <div className='max-w-4xl mx-auto space-y-8'>
      <div className='flex items-center justify-between'>
        <Link href={`/${adminSecret}/dashboard/entries/${entid}`} className='text-blue-600 hover:underline'>
          ← Back to Entry
        </Link>
        <h1 className='text-3xl font-bold'>Edit Entry</h1>
      </div>

      <div className='bg-white border border-gray-200 rounded-lg p-6 space-y-6'>
        <div>
          <label className='block text-sm font-semibold text-gray-900 mb-2'>Title</label>
          <MyInput
            type='text'
            value={entry.ent_title}
            onChange={(e) => setEntry({ ...entry, ent_title: e.target.value })}
            overrideClass='w-full h-auto md:h-auto px-4 md:px-4 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-semibold text-gray-900 mb-2'>Summary</label>
          <MyTextarea
            value={entry.ent_summary}
            onChange={(e) => setEntry({ ...entry, ent_summary: e.target.value })}
            rows={4}
            overrideClass='w-full h-auto px-4 md:px-4 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-semibold text-gray-900 mb-2'>Categories</label>
          <div className='flex gap-2 flex-wrap mb-3'>
            {entry.ent_categories.map((cat) => (
              <div key={cat} className='inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded'>
                {cat}
                <MyButton
                  onClick={() => setEntry({
                    ...entry,
                    ent_categories: entry.ent_categories.filter(c => c !== cat)
                  })}
                  overrideClass='h-auto md:h-auto px-0 md:px-0 bg-transparent hover:bg-transparent text-blue-600 hover:text-blue-900 font-bold'
                >
                  ×
                </MyButton>
              </div>
            ))}
          </div>
          <MySelect
            onChange={(e) => {
              if (e.target.value && !entry.ent_categories.includes(e.target.value)) {
                setEntry({
                  ...entry,
                  ent_categories: [...entry.ent_categories, e.target.value]
                })
              }
              e.target.value = ''
            }}
            overrideClass='w-auto md:w-auto h-auto md:h-auto px-4 md:px-4 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value=''>Add category...</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </MySelect>
        </div>

        <div>
          <label className='block text-sm font-semibold text-gray-900 mb-2'>Source URL</label>
          <MyInput
            type='url'
            value={entry.ent_source_url || ''}
            onChange={(e) => setEntry({ ...entry, ent_source_url: e.target.value || null })}
            overrideClass='w-full h-auto md:h-auto px-4 md:px-4 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>Article Date</label>
            <MyInput
              type='date'
              value={entry.ent_article_date || ''}
              onChange={(e) => setEntry({ ...entry, ent_article_date: e.target.value || null })}
              overrideClass='w-full h-auto md:h-auto px-4 md:px-4 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>Country</label>
            <MyInput
              type='text'
              value={entry.ent_country || ''}
              onChange={(e) => setEntry({ ...entry, ent_country: e.target.value || null })}
              placeholder='e.g., United States, UK'
              overrideClass='w-full h-auto md:h-auto px-4 md:px-4 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>Author</label>
            <MyInput
              type='text'
              value={entry.ent_author || ''}
              onChange={(e) => setEntry({ ...entry, ent_author: e.target.value || null })}
              placeholder='e.g., John Smith'
              overrideClass='w-full h-auto md:h-auto px-4 md:px-4 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>Publication</label>
            <MyInput
              type='text'
              value={entry.ent_publication || ''}
              onChange={(e) => setEntry({ ...entry, ent_publication: e.target.value || null })}
              placeholder='e.g., BBC News, Reuters'
              overrideClass='w-full h-auto md:h-auto px-4 md:px-4 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        <div className='flex gap-2'>
          <MyButton
            onClick={handleSave}
            disabled={saving}
            overrideClass='h-auto md:h-auto px-6 md:px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
          >
            {saving ? 'Saving...' : 'Save'}
          </MyButton>
          <MyButton
            onClick={() => router.push(`/${adminSecret}/dashboard/entries/${entid}`)}
            overrideClass='h-auto md:h-auto px-6 md:px-6 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-900'
          >
            Cancel
          </MyButton>
        </div>
      </div>

      <div className='bg-white border border-gray-200 rounded-lg p-6 space-y-4'>
        <h2 className='text-xl font-bold'>Arguments</h2>
        <div className='space-y-2'>
          {arguments_.map((arg) => (
            <div key={arg.arg_argid} className='flex items-center justify-between p-3 border border-gray-200 rounded'>
              <div className='flex-1'>
                <div className='text-gray-900'>{arg.arg_text}</div>
                <div className='text-xs text-gray-500'>Relevance: {arg.arg_relevance}</div>
              </div>
              <MyButton
                onClick={async () => {
                  await deleteArgument(arg.arg_argid, 'AdminEntryEditPage')
                  setArguments(arguments_.filter(a => a.arg_argid !== arg.arg_argid))
                }}
                overrideClass='h-auto md:h-auto px-0 md:px-0 ml-2 bg-transparent hover:bg-transparent text-red-600 hover:text-red-900'
              >
                Delete
              </MyButton>
            </div>
          ))}
        </div>
      </div>

      <div className='bg-white border border-gray-200 rounded-lg p-6 space-y-4'>
        <h2 className='text-xl font-bold'>Sources</h2>
        <div className='space-y-2'>
          {sources.map((source) => (
            <div key={source.src_srcid} className='flex items-center justify-between p-3 border border-gray-200 rounded'>
              <div className='flex-1 min-w-0'>
                {source.src_title && <div className='font-semibold text-gray-900'>{source.src_title}</div>}
                <a href={source.src_url} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline text-sm break-all'>
                  {source.src_url}
                </a>
              </div>
              <MyButton
                onClick={async () => {
                  await deleteSource(source.src_srcid, 'AdminEntryEditPage')
                  setSources(sources.filter(s => s.src_srcid !== source.src_srcid))
                }}
                overrideClass='h-auto md:h-auto px-0 md:px-0 ml-2 shrink-0 bg-transparent hover:bg-transparent text-red-600 hover:text-red-900'
              >
                Delete
              </MyButton>
            </div>
          ))}
        </div>
      </div>

      <div className='border-t pt-6'>
        <MyButton
          onClick={() => setShowDeleteConfirm(true)}
          overrideClass='h-auto md:h-auto px-6 md:px-6 py-2 rounded bg-red-600 hover:bg-red-700'
        >
          Delete Entry
        </MyButton>

        {showDeleteConfirm && (
          <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded'>
            <p className='text-red-900 mb-4'>Are you sure? This will delete the entry and all its arguments and sources.</p>
            <div className='flex gap-2'>
              <MyButton
                onClick={handleDelete}
                overrideClass='h-auto md:h-auto px-4 md:px-4 py-2 rounded bg-red-600 hover:bg-red-700'
              >
                Yes, Delete
              </MyButton>
              <MyButton
                onClick={() => setShowDeleteConfirm(false)}
                overrideClass='h-auto md:h-auto px-4 md:px-4 py-2 rounded bg-gray-300 hover:bg-gray-400'
              >
                Cancel
              </MyButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
