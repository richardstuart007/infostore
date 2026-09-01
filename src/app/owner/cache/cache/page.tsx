//==============================================================================================
//  1) DESCRIPTION
//    Page — the /owner/cache/cache route: renders nextjs-shared's OwnerTableCache panel in a
//    full-width container. Sets the page <title> to "Cache".
//==============================================================================================

import OwnerTableCache from 'nextjs-shared/OwnerTableCache'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cache' }

export default function Page() {
  return (
    <div className='w-full md:p-6'>
      <OwnerTableCache />
    </div>
  )
}
