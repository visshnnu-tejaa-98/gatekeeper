import { cn } from '@/lib/utils'

export interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
  glow?: boolean
}

export function Logo({ size = 28, showText = true, className, glow = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        className={cn(glow && 'logo-glow')}
      >
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        {/* Outer rounded square frame */}
        <rect
          x="1.5"
          y="1.5"
          width="29"
          height="29"
          rx="8"
          fill="url(#logo-grad)"
          fillOpacity="0.08"
          stroke="url(#logo-grad)"
          strokeWidth="1.4"
          strokeOpacity="0.7"
        />
        {/* Inner accent — stylised lock + i */}
        <path
          d="M11 14V11a5 5 0 0 1 10 0v3"
          stroke="url(#logo-grad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        <rect x="8" y="14" width="16" height="10" rx="2.5" fill="url(#logo-grad)" fillOpacity="0.9" />
        <circle cx="16" cy="18.5" r="1.8" fill="#fff" fillOpacity="0.95" />
        <rect x="15.25" y="19.6" width="1.5" height="2.4" rx="0.75" fill="#fff" fillOpacity="0.95" />
      </svg>
      {showText && (
        <span
          className="font-bold tracking-tight gradient-text-primary"
          style={{ fontSize: size * 0.55, lineHeight: 1 }}
        >
          iLogin
        </span>
      )}
    </div>
  )
}
