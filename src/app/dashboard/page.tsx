//==============================================================================================
//  1) DESCRIPTION
//    DashboardPage — the /dashboard overview: total entry count plus the five most recent
//    entries, each linking to its detail page, and a "View All Entries" link.
//==============================================================================================

import { fetchEntriesCount, fetchRecentEntries } from '@/src/lib/entries'
import { MyLink } from 'nextjs-shared/MyLink'

export default async function DashboardPage() {
  const count = await fetchEntriesCount('DashboardPage')
  const recent = await fetchRecentEntries('DashboardPage')

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Dashboard</h1>
        <MyLink
          href={{ pathname: '/dashboard/entries/new', reference: 'new-entry' }}
          overrideClass='h-auto md:h-auto px-4 md:px-4 py-2 rounded bg-blue-600 hover:bg-blue-700'
        >
          + New Entry
        </MyLink>
      </div>

      <div className='bg-gray-50 border border-gray-200 rounded-lg p-6'>
        <div className='text-4xl font-bold text-gray-900'>{count}</div>
        <div className='text-gray-600'>Total Entries</div>
      </div>

      <div>
        <h2 className='text-xl font-bold mb-4'>Recent Entries</h2>
        <div className='space-y-2'>
          {recent.length === 0 ? (
            <p className='text-gray-500'>No entries yet</p>
          ) : (
            recent.map((entry) => (
              <MyLink
                key={entry.ent_entid}
                href={{
                  pathname: `/dashboard/entries/${entry.ent_entid}`,
                  reference: 'entry-detail',
                  segment: String(entry.ent_entid)
                }}
                overrideClass='h-auto md:h-auto px-4 md:px-4 py-4 justify-start block bg-transparent hover:bg-gray-50 text-gray-900 rounded border border-gray-200 transition'
              >
                <div className='font-semibold text-gray-900'>{entry.ent_title}</div>
                <div className='text-sm text-gray-600'>{entry.ent_summary}</div>
                {entry.ent_categories.length > 0 && (
                  <div className='mt-2 flex gap-2 flex-wrap'>
                    {entry.ent_categories.map((cat) => (
                      <span key={cat} className='inline-block px-2 py-1 text-xs bg-gray-200 rounded'>
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </MyLink>
            ))
          )}
        </div>
      </div>

      <div>
        <MyLink
          href={{ pathname: '/dashboard/entries', reference: 'view-all-entries' }}
          overrideClass='h-auto md:h-auto px-0 md:px-0 bg-transparent hover:bg-transparent text-blue-600 hover:underline'
        >
          View All Entries →
        </MyLink>
      </div>
    </div>
  )
}
