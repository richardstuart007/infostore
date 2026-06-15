import OwnerPage from 'nextjs-shared/OwnerPage'
import OwnerTableLogging from 'nextjs-shared/OwnerTableLogging'
import OwnerTableCache from 'nextjs-shared/OwnerTableCache'

export default function Page() {
  return (
    <OwnerPage
      tabs={[
        { label: 'Logging', content: <OwnerTableLogging /> },
        { label: 'Cache', content: <OwnerTableCache /> },
      ]}
    />
  )
}
