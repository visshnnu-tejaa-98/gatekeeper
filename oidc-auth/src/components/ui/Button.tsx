import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const button = cva(
  [
    'inline-flex items-center justify-center gap-1.5 whitespace-nowrap',
    'font-medium select-none relative overflow-hidden cursor-pointer',
    'transition-[transform,opacity,background,border-color,box-shadow] duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080c]',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 text-white',
          'shadow-[0_1px_0_0_rgba(255,255,255,0.16)_inset,0_-1px_0_0_rgba(0,0,0,0.25)_inset]',
          'hover:opacity-95 hover:-translate-y-px hover:shadow-[0_6px_20px_-4px_rgba(139,92,246,0.5)]',
          'active:translate-y-0',
        ],
        secondary: [
          'bg-white/[0.06] text-white/85 border border-white/10',
          'hover:bg-white/[0.09] hover:border-white/20 hover:text-white',
          'active:bg-white/[0.05]',
        ],
        ghost: [
          'bg-transparent text-white/65',
          'hover:bg-white/[0.06] hover:text-white',
        ],
        danger: [
          'bg-red-500/10 text-red-300 border border-red-500/25',
          'hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-200',
        ],
        outline: [
          'bg-transparent text-white/75 border border-white/12',
          'hover:bg-white/[0.04] hover:border-white/22 hover:text-white',
        ],
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-md [&_svg]:size-3',
        sm: 'h-8 px-3 text-[13px] rounded-md [&_svg]:size-3.5',
        md: 'h-9 px-3.5 text-[13.5px] rounded-md [&_svg]:size-4',
        lg: 'h-10 px-4 text-sm rounded-lg [&_svg]:size-4',
        icon: 'h-8 w-8 rounded-md [&_svg]:size-4',
        'icon-sm': 'h-7 w-7 rounded-md [&_svg]:size-3.5',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'secondary', size: 'md', block: false },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(button({ variant, size, block }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="anim-spin inline-flex">
            <svg viewBox="0 0 24 24" fill="none" className="size-3.5">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
              <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
        )}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
