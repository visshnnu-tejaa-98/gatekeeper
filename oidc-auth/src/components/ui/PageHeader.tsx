import * as React from 'react'
import { cn } from '@/lib/utils'

export interface PageHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 pb-5 mb-5 border-b border-white/6', className)}>
      <div className="min-w-0">
        <h1 className="text-[20px] font-semibold text-white tracking-tight leading-tight">{title}</h1>
        {description && <p className="text-[13px] text-white/45 mt-1 max-w-xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}

export function SectionHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-3', className)}>
      <div>
        <h2 className="text-[13px] font-semibold text-white tracking-tight uppercase letter-spacing-wider" style={{ letterSpacing: '0.04em' }}>
          {title}
        </h2>
        {description && <p className="text-[12px] text-white/40 mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
