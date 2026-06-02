'use client'

import { useState, useEffect } from 'react'
import { createEntry } from '@/src/lib/entries'
import { createArgument } from '@/src/lib/arguments'
import { createSource } from '@/src/lib/sources'
import { fetchDistinctCategories } from '@/src/lib/categories'
import { normalizeCategory } from '@/src/lib/utils'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface AnalysisResult {
  title: string
  summary: string
  categories: string[]
  arguments: Array<{ text: string; relevance: number }>
  sources: string[]
  article_date?: string
  country?: string
}

export default function AdminNewEntryPage() {
  const params = useParams()
  const router = useRouter()
  const adminSecret = params?.admin_secret as string

  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [sourceUrl, setSourceUrl] = useState('')
  const [articleDate, setArticleDate] = useState('')
  const [country, setCountry] = useState('')
  const [arguments_, setArguments] = useState<Array<{ text: string; relevance: number }>>([])
  const [sources, setSources] = useState<Array<{ url: string; title: string | null }>>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeUrl, setAnalyzeUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const cats = await fetchDistinctCategories('AdminNewEntryPage')
      setAvailableCategories(cats)
    }
    load()
  }, [])

  async function handleAnalyze() {
    if (!analyzeUrl) return

    setAnalyzing(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: analyzeUrl })
      })

      const data = await response.json()

      if (!response.ok) {
        alert('Analysis failed: ' + (data.error || 'Unknown error'))
        setAnalyzing(false)
        return
      }

      const analysis: AnalysisResult = data

      setTitle(analysis.title || '')
      setSummary(analysis.summary || '')
      setCategories((analysis.categories || []).map(normalizeCategory))
      setArguments(analysis.arguments || [])
      setSources((analysis.sources || [analyzeUrl]).map((url, i) => ({
        url,
        title: i === 0 ? 'Original Article' : null
      })))
      setArticleDate(analysis.article_date || '')
      setCountry(analysis.country || '')
      setSourceUrl(analyzeUrl)
      setAnalyzeUrl('')
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Failed to analyze URL: ' + (error as Error).message)
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleSave() {
    if (!title || !summary) {
      alert('Title and summary are required')
      return
    }

    setSaving(true)
    const normalizedCategories = categories.map(normalizeCategory)

    const entry = await createEntry(title, summary, normalizedCategories, sourceUrl, articleDate || null, country || null, 'AdminNewEntryPage')
    if (!entry) {
      setSaving(false)
      alert('Failed to create entry')
      return
    }

    const entid = entry.ent_entid

    for (const arg of arguments_) {
      await createArgument(entid, arg.text, arg.relevance, 'AdminNewEntryPage')
    }

    for (const src of sources) {
      await createSource(entid, src.url, src.title, 'AdminNewEntryPage')
    }

    setSaving(false)
    router.push(`/${adminSecret}/dashboard/entries/${entid}`)
  }

  return (
    <div className='max-w-4xl mx-auto space-y-8'>
      <div className='flex items-center justify-between'>
        <Link href={`/${adminSecret}/dashboard/entries`} className='text-blue-600 hover:underline'>
          ← Back to Entries
        </Link>
        <h1 className='text-3xl font-bold'>New Entry</h1>
      </div>

      <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
        <h2 className='font-semibold text-blue-900 mb-4'>Analyze Article URL</h2>
        <div className='flex gap-2'>
          <input
            type='url'
            value={analyzeUrl}
            onChange={(e) => setAnalyzeUrl(e.target.value)}
            placeholder='https://example.com/article'
            className='flex-1 px-4 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className='px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
          >
            {analyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      <div className='bg-white border border-gray-200 rounded-lg p-6 space-y-6'>
        <div>
          <label className='block text-sm font-semibold text-gray-900 mb-2'>Title *</label>
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-semibold text-gray-900 mb-2'>Summary *</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-semibold text-gray-900 mb-2'>Categories</label>
          <div className='flex gap-2 flex-wrap mb-3'>
            {categories.map((cat) => (
              <div key={cat} className='inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded'>
                {cat}
                <button
                  onClick={() => setCategories(categories.filter(c => c !== cat))}
                  className='text-blue-600 hover:text-blue-900 font-bold'
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <select
            onChange={(e) => {
              if (e.target.value && !categories.includes(e.target.value)) {
                setCategories([...categories, e.target.value])
              }
              e.target.value = ''
            }}
            className='px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value=''>Add category...</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className='block text-sm font-semibold text-gray-900 mb-2'>Source URL</label>
          <input
            type='url'
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>Article Date</label>
            <input
              type='date'
              value={articleDate}
              onChange={(e) => setArticleDate(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>Country</label>
            <input
              type='text'
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder='e.g., United States, UK'
              className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        <div className='flex gap-2'>
          <button
            onClick={handleSave}
            disabled={saving}
            className='px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
          >
            {saving ? 'Creating...' : 'Create Entry'}
          </button>
          <button
            onClick={() => router.push(`/${adminSecret}/dashboard/entries`)}
            className='px-6 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400'
          >
            Cancel
          </button>
        </div>
      </div>

      {arguments_.length > 0 && (
        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <h2 className='text-lg font-bold mb-4'>Arguments</h2>
          <div className='space-y-2'>
            {arguments_.map((arg, i) => (
              <div key={i} className='p-3 border border-gray-200 rounded'>
                <div className='text-gray-900'>{arg.text}</div>
                <div className='text-xs text-gray-500 mt-1'>Relevance: {arg.relevance}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sources.length > 0 && (
        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <h2 className='text-lg font-bold mb-4'>Sources</h2>
          <div className='space-y-2'>
            {sources.map((src, i) => (
              <div key={i} className='p-3 border border-gray-200 rounded'>
                {src.title && <div className='font-semibold text-gray-900'>{src.title}</div>}
                <a href={src.url} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline text-sm break-all'>
                  {src.url}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
