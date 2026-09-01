'use client'

//==============================================================================================
//  1) DESCRIPTION
//    DashboardLayout — constrains every /dashboard page to a centred max-w-7xl column and
//    wraps the routed content in a <Suspense> boundary.
//
//    Parameters:
//      children — the routed dashboard page content
//==============================================================================================

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
