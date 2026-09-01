//==============================================================================================
//  1) DESCRIPTION
//    Layout — wraps every /owner route in nextjs-shared's OwnerLayout (dev-only guard chrome).
//
//    Parameters:
//      children — the routed /owner page content
//==============================================================================================

import OwnerLayout from 'nextjs-shared/OwnerLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <OwnerLayout>{children}</OwnerLayout>
}
