import * as React from 'react'
import { MarketingNav } from './MarketingNav'
import { MarketingFooter } from './MarketingFooter'
import { AuroraCanvas } from './AuroraCanvas'

export function MarketingLayout({
  children,
  showFooter = true,
  bg = 'glow-grid' as 'glow-grid' | 'glow-dots' | 'grid-only',
}: {
  children: React.ReactNode
  showFooter?: boolean
  bg?: 'glow-grid' | 'glow-dots' | 'grid-only'
}) {
  return (
    <AuroraCanvas variant={bg}>
      <MarketingNav />
      <main>{children}</main>
      {showFooter && <MarketingFooter />}
    </AuroraCanvas>
  )
}
