'use client'

import { Suspense } from 'react'

export default function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ admin_secret: string }>
}) {
  return (
    <div className='max-w-7xl mx-auto'>
      <Suspense>
        {children}
      </Suspense>
    </div>
  )
}
