'use client'

import { useState, useEffect } from 'react'
import { createEntry } from '@/src/lib/entries'
import { createArgument } from '@/src/lib/arguments'
import { createSource } from '@/src/lib/sources'
import { fetchDistinctCategories } from '@/src/lib/categories'
import { normalizeCategory } from '@/src/lib/utils'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { MyInput } from 'nextjs-shared/MyInput'
import { MyTextarea } from 'nextjs-shared/MyTextarea'
import MySelect from 'nextjs-shared/MySelect'
import { MyButton } from 'nextjs-shared/MyButton'

interface AnalysisResult {
  title: string
  summary: string
  categories: string[]
  arguments: Array<{ text: string; relevance: number }>
  sources: string[]
  article_date?: string
  country?: string
  author?: string
  publication?: string
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
  const [author, setAuthor] = useState('')
  const [publication, setPublication] = useState('')
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
      const { checkDuplicateUrl } = await import('@/src/lib/entries')
      const isDuplicate = await checkDuplicateUrl(analyzeUrl, 'AdminNewEntryPage')

      if (isDuplicate) {
        alert('This URL already exists in the database. Please use a different URL.')
        setAnalyzing(false)
        return
      }

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
      setAuthor(analysis.author || '')
      setPublication(analysis.publication || '')
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

    const entry = await createEntry(title, summary, normalizedCategories, sourceUrl, articleDate || null, country || null, author || null, publication || null, 'AdminNewEntryPage')
    if (!entry) {
      setSaving(false)
      if (sourceUrl) {
        alert('Entry with this URL already exists. Please use a different URL.')
      } else {
        alert('Failed to create entry')
      }
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
          <MyInput
            type='url'
            value={analyzeUrl}
            onChange={(e) => setAnalyzeUrl(e.target.value)}
            placeholder='https://example.com/article'
            overrideClass='flex-1 h-auto md:h-auto px-4 md:px-4 py-2 rounded border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <MyButton
            onClick={handleAnalyze}
            disabled={analyzing}
            overrideClass='h-auto md:h-auto px-6 md:px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
          >
            {analyzing ? 'Analyzing...' : 'Analyze'}
          </MyButton>
        </div>
      </div>

      <div className='bg-white border border-gray-200 rounded-lg p-6 space-y-6'>
        <div>
          <label className='block text-sm font-semibold text-gray-900 mb-2'>Title *</label>
          <MyInput
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            overrideClass='w-full h-auto md:h-auto px-4 md:px-4 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-semibold text-gray-900 mb-2'>Summary *</label>
          <MyTextarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            overrideClass='w-full h-auto px-4 md:px-4 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-semibold text-gray-900 mb-2'>Categories</label>
          <div className='flex gap-2 flex-wrap mb-3'>
            {categories.map((cat) => (
              <div key={cat} className='inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded'>
                {cat}
                <MyButton
                  onClick={() => setCategories(categories.filter(c => c !== cat))}
                  overrideClass='h-auto md:h-auto px-0 md:px-0 bg-transparent hover:bg-transparent text-blue-600 hover:text-blue-900 font-bold'
                >
                  ×
                </MyButton>
              </div>
            ))}
          </div>
          <MySelect
            onChange={(e) => {
              if (e.target.value && !categories.includes(e.target.value)) {
                setCategories([...categories, e.target.value])
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
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            overrideClass='w-full h-auto md:h-auto px-4 md:px-4 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>Article Date</label>
            <MyInput
              type='date'
              value={articleDate}
              onChange={(e) => setArticleDate(e.target.value)}
              overrideClass='w-full h-auto md:h-auto px-4 md:px-4 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>Country</label>
            <MyInput
              type='text'
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder='e.g., United States, UK'
              overrideClass='w-full h-auto md:h-auto px-4 md:px-4 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>Author</label>
            <MyInput
              type='text'
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder='e.g., John Smith'
              overrideClass='w-full h-auto md:h-auto px-4 md:px-4 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>Publication</label>
            <MyInput
              type='text'
              value={publication}
              onChange={(e) => setPublication(e.target.value)}
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
            {saving ? 'Creating...' : 'Create Entry'}
          </MyButton>
          <MyButton
            onClick={() => router.push(`/${adminSecret}/dashboard/entries`)}
            overrideClass='h-auto md:h-auto px-6 md:px-6 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-900'
          >
            Cancel
          </MyButton>
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
