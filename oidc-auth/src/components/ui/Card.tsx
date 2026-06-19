import * as React from 'react'
import { cn } from '@/lib/utils'

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean
  inset?: boolean
  glow?: boolean
}>(({ className, interactive, inset, glow, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative rounded-lg border border-white/8 bg-white/[0.025] backdrop-blur-xl',
      'before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/12 before:to-transparent',
      interactive && 'transition-[border-color,background] duration-150 hover:border-white/16 hover:bg-white/[0.035] cursor-pointer',
      inset && 'bg-white/[0.015] border-white/6',
      glow && 'shadow-[0_0_30px_-12px_rgba(139,92,246,0.4)]',
      className,
    )}
    {...props}
  />
))
Card.displayName = 'Card'

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-start justify-between gap-3 px-5 pt-4 pb-3', className)} {...props} />
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-[14.5px] font-semibold text-white tracking-tight', className)} {...props} />
)
CardTitle.displayName = 'CardTitle'

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-[12.5px] text-white/45 mt-0.5', className)} {...props} />
)
CardDescription.displayName = 'CardDescription'

export const CardBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-5 py-3', className)} {...props} />
)
CardBody.displayName = 'CardBody'

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex items-center justify-between gap-3 px-5 py-3 border-t border-white/6',
      className,
    )}
    {...props}
  />
)
CardFooter.displayName = 'CardFooter'
