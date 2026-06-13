import * as React from 'react'
import { cn } from '@/lib/utils'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

function initials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const SIZES: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'size-5 text-[9px]',
  sm: 'size-6 text-[10px]',
  md: 'size-8 text-[12px]',
  lg: 'size-10 text-[13px]',
  xl: 'size-16 text-[18px]',
}

export function Avatar({ src, name, size = 'md', className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 font-semibold text-white',
        'bg-gradient-to-br from-violet-500/40 to-blue-500/40 border border-violet-500/30',
        SIZES[size],
        className,
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={name || ''} className="size-full object-cover" />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  )
}
