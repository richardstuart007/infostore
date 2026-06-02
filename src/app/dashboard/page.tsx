import { fetchEntriesCount, fetchAllEntries } from '@/src/lib/entries'
import Link from 'next/link'

export default async function DashboardPage() {
  const count = await fetchEntriesCount('DashboardPage')
  const entries = await fetchAllEntries('DashboardPage')
  const recent = entries.slice(0, 5)

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Dashboard</h1>
        <Link href='/dashboard/entries/new' className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
          + New Entry
        </Link>
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
              <Link
                key={entry.ent_entid}
                href={`/dashboard/entries/${entry.ent_entid}`}
                className='block p-4 border border-gray-200 rounded hover:bg-gray-50 transition'
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
              </Link>
            ))
          )}
        </div>
      </div>

      <div>
        <Link href='/dashboard/entries' className='text-blue-600 hover:underline'>
          View All Entries →
        </Link>
      </div>
    </div>
  )
}
