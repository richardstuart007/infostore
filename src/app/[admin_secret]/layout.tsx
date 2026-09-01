//==============================================================================================
//  1) DESCRIPTION
//    AdminLayout — gate for the whole /[admin_secret] route tree: redirects to / unless the
//    admin_secret route segment matches process.env.ADMIN_SECRET_PATH. Otherwise renders the
//    routed content in a centred max-w-7xl column inside a <Suspense> boundary.
//
//    Parameters:
//      children — the routed admin page content
//      params   — route params promise resolving to { admin_secret } (the secret URL segment)
//==============================================================================================

import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ admin_secret: string }>
}) {
  const { admin_secret } = await params
  const expectedSecret = process.env.ADMIN_SECRET_PATH

  if (!expectedSecret || admin_secret !== expectedSecret) {
    redirect('/')
  }

  return (
    <div className='max-w-7xl mx-auto'>
      <Suspense>
        {children}
      </Suspense>
    </div>
  )
}
