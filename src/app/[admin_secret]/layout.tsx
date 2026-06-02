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
