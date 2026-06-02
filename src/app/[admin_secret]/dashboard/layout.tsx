'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const adminSecret = params?.admin_secret as string

  return (
    <div className='max-w-7xl mx-auto'>
      <header className='border-b border-gray-200 bg-white mb-6'>
        <div className='flex items-center px-4 py-3 gap-8'>
          <h1 className='text-lg font-bold text-gray-900 shrink-0'>WokeWatch Admin</h1>
          <nav className='flex items-center gap-6 text-sm'>
            <a href={`/${adminSecret}/dashboard`} className='text-gray-600 hover:text-gray-900'>Dashboard</a>
            <a href={`/${adminSecret}/dashboard/entries`} className='text-gray-600 hover:text-gray-900'>Entries</a>
          </nav>
        </div>
      </header>
      <Suspense>
        {children}
      </Suspense>
    </div>
  )
}
