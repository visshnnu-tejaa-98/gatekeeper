import * as React from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon
  iconRight?: React.ReactNode
  error?: boolean
  invalid?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon: Icon, iconRight, error, invalid, ...props }, ref) => {
    const isErr = error || invalid
    return (
      <div className="relative w-full">
        {Icon && (
          <Icon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-white/35" />
        )}
        <input
          ref={ref}
          className={cn(
            'flex h-9 w-full rounded-md bg-white/[0.03] px-2.5 text-[13.5px]',
            'border border-white/10 text-white placeholder:text-white/30',
            'transition-[border-color,background,box-shadow] duration-150',
            'hover:border-white/18',
            'focus:outline-none focus:border-violet-500/55 focus:bg-violet-500/[0.05] focus:ring-2 focus:ring-violet-500/15',
            'disabled:cursor-not-allowed disabled:opacity-50',
            Icon && 'pl-8',
            iconRight && 'pr-8',
            isErr && 'border-red-500/45 focus:border-red-500/60 focus:ring-red-500/15',
            className,
          )}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center text-white/40">
            {iconRight}
          </div>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }
>(({ className, error, ...props }, ref) => (
  <textarea
    ref={ref}
    wrap="soft"
    className={cn(
      'block w-full max-w-full box-border rounded-md bg-white/[0.03] px-2.5 py-2 text-[13.5px]',
      'border border-white/10 text-white placeholder:text-white/30',
      'transition-[border-color,background,box-shadow] duration-150',
      'hover:border-white/18',
      'focus:outline-none focus:border-violet-500/55 focus:bg-violet-500/[0.05] focus:ring-2 focus:ring-violet-500/15',
      'disabled:cursor-not-allowed disabled:opacity-50 resize-y min-h-[88px]',
      'overflow-y-auto overflow-x-hidden break-words',
      'whitespace-pre-wrap [overflow-wrap:anywhere]',
      error && 'border-red-500/45 focus:border-red-500/60 focus:ring-red-500/15',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export interface FieldProps {
  label?: React.ReactNode
  hint?: React.ReactNode
  error?: React.ReactNode
  optional?: boolean
  required?: boolean
  htmlFor?: string
  children: React.ReactNode
  className?: string
}

export function Field({ label, hint, error, optional, htmlFor, children, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={htmlFor} className="text-[12.5px] font-medium text-white/70">
            {label}
          </label>
          {optional && <span className="text-[11px] text-white/35">Optional</span>}
        </div>
      )}
      {children}
      {error ? (
        <p className="text-[12px] text-red-400 flex items-center gap-1 mt-0.5">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-white/40 mt-0.5">{hint}</p>
      ) : null}
    </div>
  )
}
