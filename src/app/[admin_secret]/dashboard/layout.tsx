import { Suspense } from 'react'

export default async function AdminDashboardLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ admin_secret: string }>
}) {
  const { admin_secret } = await params

  return (
    <div className='max-w-7xl mx-auto'>
      <header className='border-b border-gray-200 bg-white mb-6'>
        <div className='flex items-center px-4 py-3 gap-8'>
          <h1 className='text-lg font-bold text-gray-900 shrink-0'>WokeWatch Admin</h1>
          <nav className='flex items-center gap-6 text-sm'>
            <a href={`/${admin_secret}/dashboard`} className='text-gray-600 hover:text-gray-900'>Dashboard</a>
            <a href={`/${admin_secret}/dashboard/entries`} className='text-gray-600 hover:text-gray-900'>Entries</a>
          </nav>
        </div>
      </header>
      <Suspense>
        {children}
      </Suspense>
    </div>
  )
}
