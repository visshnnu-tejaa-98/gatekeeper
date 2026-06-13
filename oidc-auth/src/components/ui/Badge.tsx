import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badge = cva(
  'inline-flex items-center gap-1 px-1.5 py-0.5 text-[10.5px] font-medium rounded-full border whitespace-nowrap leading-none [&_svg]:size-2.5',
  {
    variants: {
      tone: {
        neutral: 'bg-white/[0.06] border-white/12 text-white/70',
        purple: 'bg-violet-500/12 border-violet-500/25 text-violet-300',
        blue: 'bg-blue-500/12 border-blue-500/25 text-blue-300',
        green: 'bg-emerald-500/12 border-emerald-500/25 text-emerald-300',
        red: 'bg-red-500/12 border-red-500/25 text-red-300',
        orange: 'bg-amber-500/12 border-amber-500/25 text-amber-300',
      },
      size: {
        sm: 'text-[10px] px-1.5 py-0.5',
        md: 'text-[11px] px-2 py-0.5',
        lg: 'text-[11.5px] px-2.5 py-1',
      },
    },
    defaultVariants: { tone: 'neutral', size: 'md' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badge> {}

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badge({ tone, size }), className)} {...props} />
}

export function StatusDot({ tone = 'green', glow = true, className }: { tone?: 'green' | 'red' | 'yellow' | 'gray'; glow?: boolean; className?: string }) {
  const colors = {
    green: 'bg-emerald-400',
    red: 'bg-red-400',
    yellow: 'bg-amber-400',
    gray: 'bg-white/40',
  }
  const glows = {
    green: 'shadow-[0_0_6px_0_rgb(74,222,128)]',
    red: 'shadow-[0_0_6px_0_rgb(248,113,113)]',
    yellow: 'shadow-[0_0_6px_0_rgb(252,211,77)]',
    gray: '',
  }
  return (
    <span
      className={cn('inline-block size-1.5 rounded-full shrink-0', colors[tone], glow && glows[tone], className)}
    />
  )
}
