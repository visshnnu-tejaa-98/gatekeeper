import * as React from 'react'
import { cn } from '@/lib/utils'

export function AuroraCanvas({
  children,
  variant = 'glow-grid',
  className,
}: {
  children: React.ReactNode
  variant?: 'glow-grid' | 'glow-dots' | 'grid-only' | 'dots-only' | 'none'
  className?: string
}) {
  const showGlow = variant === 'glow-grid' || variant === 'glow-dots'
  const showGrid = variant === 'glow-grid' || variant === 'grid-only'
  const showDots = variant === 'glow-dots' || variant === 'dots-only'

  return (
    <div
      className={cn(
        'canvas-base',
        showGlow && 'canvas-glow',
        showGrid && 'canvas-grid',
        showDots && 'canvas-dots',
        className,
      )}
    >
      {showGlow && (
        <>
          <div className="glow glow-1" aria-hidden />
          <div className="glow glow-2" aria-hidden />
          <div className="glow glow-3" aria-hidden />
        </>
      )}
      <div className="canvas-content">{children}</div>
    </div>
  )
}
