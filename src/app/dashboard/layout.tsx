'use client'

import { Suspense } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='max-w-7xl mx-auto'>
      <Suspense>
        {children}
      </Suspense>
    </div>
  )
}
