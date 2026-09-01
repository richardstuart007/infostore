//==============================================================================================
//  1) DESCRIPTION
//    AdminHomePage — the /[admin_secret] landing page: confirms admin access and links
//    through to the admin dashboard.
//
//    Parameters:
//      params — route params promise resolving to { admin_secret } (the secret URL segment)
//==============================================================================================

import { MyLink } from 'nextjs-shared/MyLink'

export default async function AdminHomePage({
  params
}: {
  params: Promise<{ admin_secret: string }>
}) {
  const { admin_secret } = await params

  return (
    <div className='space-y-6'>
      <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800'>
        Admin access verified
      </div>
      <MyLink
        href={{ pathname: `/${admin_secret}/dashboard`, reference: 'go-to-dashboard' }}
        overrideClass='h-auto md:h-auto px-4 md:px-4 py-2 inline-block rounded bg-blue-600 hover:bg-blue-700'
      >
        Go to Dashboard →
      </MyLink>
    </div>
  )
}
