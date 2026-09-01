//==============================================================================================
//  1) DESCRIPTION
//    EntryDetailPage — the public /dashboard/entries/[ent_entid] detail view: entry
//    metadata, arguments ordered by relevance, and source links. Calls notFound() when the
//    entry id doesn't resolve.
//
//    Parameters:
//      params — route params promise resolving to { ent_entid } (the entry id as a string)
//==============================================================================================

import { fetchEntryById } from '@/src/lib/entries'
import { fetchArgumentsByEntry } from '@/src/lib/arguments'
import { fetchSourcesByEntry } from '@/src/lib/sources'
import { notFound } from 'next/navigation'
import { MyBackHomeNav } from 'nextjs-shared/MyBackHomeNav'
import { MyLink } from 'nextjs-shared/MyLink'

export default async function EntryDetailPage({
  params
}: {
  params: Promise<{ ent_entid: string }>
}) {
  const { ent_entid } = await params
  const entid = parseInt(ent_entid)

  const entry = await fetchEntryById(entid, 'EntryDetailPage')
  if (!entry) {
    notFound()
  }

  const [arguments_, sources] = await Promise.all([
    fetchArgumentsByEntry(entid, 'EntryDetailPage'),
    fetchSourcesByEntry(entid, 'EntryDetailPage')
  ])

  return (
    <div className='max-w-4xl mx-auto space-y-8'>
      <div className='flex items-start justify-between'>
        <div>
          <MyBackHomeNav
            backPath='/dashboard/entries'
            backLabel='Back to Entries'
            containerClass='flex gap-3 mb-4'
            linkClass='text-blue-600 hover:underline'
          />
          <h1 className='text-3xl font-bold mt-2'>{entry.ent_title}</h1>
        </div>
        <div className='flex gap-2'>
          <MyLink
            href={{
              pathname: `/dashboard/entries/${entid}/edit`,
              reference: 'edit-entry',
              segment: String(entid)
            }}
            overrideClass='h-auto md:h-auto px-4 md:px-4 py-2 rounded bg-blue-600 hover:bg-blue-700'
          >
            Edit
          </MyLink>
        </div>
      </div>

      <div className='bg-gray-50 border border-gray-200 rounded-lg p-6'>
        <h2 className='font-semibold text-gray-900 mb-2'>Summary</h2>
        <p className='text-gray-700'>{entry.ent_summary}</p>
      </div>

      {entry.ent_categories.length > 0 && (
        <div>
          <h2 className='font-semibold text-gray-900 mb-3'>Categories</h2>
          <div className='flex gap-2 flex-wrap'>
            {entry.ent_categories.map((cat) => (
              <span key={cat} className='px-3 py-1 bg-blue-100 text-blue-800 rounded'>
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className='grid grid-cols-2 gap-6'>
        {entry.ent_article_date && (
          <div>
            <h2 className='font-semibold text-gray-900 mb-2'>Article Date</h2>
            <p className='text-gray-700'>{entry.ent_article_date}</p>
          </div>
        )}
        {entry.ent_country && (
          <div>
            <h2 className='font-semibold text-gray-900 mb-2'>Country</h2>
            <p className='text-gray-700'>{entry.ent_country}</p>
          </div>
        )}
        {entry.ent_author && (
          <div>
            <h2 className='font-semibold text-gray-900 mb-2'>Author</h2>
            <p className='text-gray-700'>{entry.ent_author}</p>
          </div>
        )}
        {entry.ent_publication && (
          <div>
            <h2 className='font-semibold text-gray-900 mb-2'>Publication</h2>
            <p className='text-gray-700'>{entry.ent_publication}</p>
          </div>
        )}
      </div>

      {entry.ent_source_url && (
        <div>
          <h2 className='font-semibold text-gray-900 mb-2'>Source URL</h2>
          <a
            href={entry.ent_source_url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 hover:underline break-all'
          >
            {entry.ent_source_url}
          </a>
        </div>
      )}

      {arguments_.length > 0 && (
        <div>
          <h2 className='font-semibold text-gray-900 mb-4'>Arguments (by relevance)</h2>
          <div className='space-y-3'>
            {arguments_.map((arg) => (
              <div key={arg.arg_argid} className='border border-gray-200 rounded-lg p-4'>
                <div className='text-gray-900'>{arg.arg_text}</div>
                <div className='text-xs text-gray-500 mt-2'>Relevance: {arg.arg_relevance}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sources.length > 0 && (
        <div>
          <h2 className='font-semibold text-gray-900 mb-4'>Sources</h2>
          <div className='space-y-2'>
            {sources.map((source) => (
              <div key={source.src_srcid} className='border border-gray-200 rounded-lg p-4'>
                {source.src_title && (
                  <div className='font-semibold text-gray-900 mb-1'>{source.src_title}</div>
                )}
                <a
                  href={source.src_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:underline break-all text-sm'
                >
                  {source.src_url}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
