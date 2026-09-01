'use client'

//==============================================================================================
//  1) DESCRIPTION
//    Layout — full-bleed wrapper for /owner/cache routes: breaks out to full viewport width
//    and wraps the routed content in a <Suspense> boundary.
//
//    Parameters:
//      children — the routed /owner/cache page content
//==============================================================================================

import { Suspense } from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='relative left-1/2 w-screen -translate-x-1/2 -my-6'>
      <Suspense>
        {children}
      </Suspense>
    </div>
  )
}
