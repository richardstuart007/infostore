//==============================================================================================
//  1) DESCRIPTION
//    RootLayout — the app-wide HTML shell: sets the Geist font variables on <html>, renders
//    the shared DevLayoutHeader (dev only) above a full-width <main> that wraps every page.
//
//    Parameters:
//      children — the routed page content to render inside <main>
//
//  2) NOTES
//    DB_LOCATION comes from POSTGRES_DATABASE_LOCATION; the DevLayoutHeader only renders
//    when NEXT_PUBLIC_APPENV_ISDEV === 'true'.
//==============================================================================================

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { DevLayoutHeader } from 'nextjs-shared/DevLayoutHeader'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'InfoStore',
  description: 'Database of documented examples of harmful societal actions'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const DB_LOCATION = process.env.POSTGRES_DATABASE_LOCATION ?? 'unknown'
  const IS_DEV = process.env.NEXT_PUBLIC_APPENV_ISDEV === 'true'

  return (
    <html
      lang='en'
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className='min-h-full flex flex-col bg-white text-gray-900'>
        {IS_DEV && <DevLayoutHeader dbLocation={DB_LOCATION} />}
        <main className='w-full flex-1 px-4 py-6'>
          {children}
        </main>
      </body>
    </html>
  )
}
