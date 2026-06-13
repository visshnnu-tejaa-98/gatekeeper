import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  compact?: boolean
}

export function EmptyState({ icon: Icon, title, description, action, className, compact }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center rounded-lg border border-dashed border-white/10',
        compact ? 'p-8' : 'p-12',
        className,
      )}
    >
      {Icon && (
        <div className="size-10 rounded-lg bg-gradient-to-br from-violet-500/15 to-blue-500/15 border border-violet-500/20 flex items-center justify-center mb-3">
          <Icon className="size-4.5 text-violet-300" />
        </div>
      )}
      <p className="text-sm font-semibold text-white">{title}</p>
      {description && <p className="text-[12.5px] text-white/45 mt-1 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
