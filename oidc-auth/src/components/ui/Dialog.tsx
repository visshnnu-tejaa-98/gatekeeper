import * as React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  closable?: boolean
}

export function Dialog({ open, onOpenChange, children, title, description, size = 'md', closable = true }: DialogProps) {
  React.useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable) onOpenChange(false)
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, closable, onOpenChange])

  if (!open || typeof window === 'undefined') return null

  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 anim-in">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => closable && onOpenChange(false)}
      />
      <div
        className={cn(
          'relative w-full bg-[#0c0c14] border border-white/10 rounded-xl shadow-2xl anim-up',
          'before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-violet-500/50 before:to-transparent',
          sizes[size],
        )}
      >
        {(title || closable) && (
          <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-white/6">
            <div className="min-w-0">
              {title && <h2 className="text-[15px] font-semibold text-white tracking-tight">{title}</h2>}
              {description && <p className="text-[12.5px] text-white/45 mt-0.5">{description}</p>}
            </div>
            {closable && (
              <button
                onClick={() => onOpenChange(false)}
                className="size-7 rounded-md text-white/45 hover:text-white hover:bg-white/[0.06] flex items-center justify-center shrink-0"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-end gap-2 pt-3 mt-3 border-t border-white/6', className)}
      {...props}
    />
  )
}
