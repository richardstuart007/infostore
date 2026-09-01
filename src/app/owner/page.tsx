//==============================================================================================
//  1) DESCRIPTION
//    Page — the /owner index: a nextjs-shared OwnerPage with Logging, Cache and Session
//    Storage tabs.
//==============================================================================================

import OwnerPage from 'nextjs-shared/OwnerPage'
import OwnerTableLogging from 'nextjs-shared/OwnerTableLogging'
import OwnerTableCache from 'nextjs-shared/OwnerTableCache'
import OwnerTableSessionStorage from 'nextjs-shared/OwnerTableSessionStorage'

export default function Page() {
  return (
    <OwnerPage
      tabs={[
        { label: 'Logging', content: <OwnerTableLogging /> },
        { label: 'Cache', content: <OwnerTableCache /> },
        { label: 'Session Storage', content: <OwnerTableSessionStorage /> },
      ]}
    />
  )
}
