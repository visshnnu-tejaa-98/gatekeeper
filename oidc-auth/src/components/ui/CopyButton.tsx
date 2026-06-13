import * as React from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  silent?: boolean
}

export function CopyButton({ value, silent, className, children, ...props }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)

  const handle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(value)
    setCopied(true)
    if (!silent) toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button
      onClick={handle}
      className={cn(
        'inline-flex items-center justify-center size-7 rounded-md text-white/45',
        'hover:bg-white/[0.06] hover:text-white transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50',
        copied && 'text-emerald-400 hover:text-emerald-400',
        className,
      )}
      title={copied ? 'Copied' : 'Copy'}
      {...props}
    >
      {children || (copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />)}
    </button>
  )
}

export function CodeReveal({
  value,
  label,
  className,
  mono = true,
}: {
  value: string
  label?: string
  className?: string
  mono?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 h-9 rounded-md border border-white/8 bg-white/[0.025]',
        'group transition-colors hover:border-white/15',
        className,
      )}
    >
      {label && <span className="text-[10.5px] uppercase tracking-wider text-white/35 font-semibold shrink-0">{label}</span>}
      <code
        className={cn(
          'flex-1 truncate text-[12.5px] text-white/75',
          mono && 'font-mono',
        )}
      >
        {value}
      </code>
      <CopyButton value={value} className="size-6" />
    </div>
  )
}
