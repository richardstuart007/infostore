import Link from 'next/link'

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
      <Link href={`/${admin_secret}/dashboard`} className='inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
        Go to Dashboard →
      </Link>
    </div>
  )
}
