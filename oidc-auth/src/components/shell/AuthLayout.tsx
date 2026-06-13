import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { Logo } from '@/components/ui/Logo'
import { AuroraCanvas } from './AuroraCanvas'

export interface AuthLayoutProps {
  children: React.ReactNode
  hero?: {
    eyebrow?: string
    title: React.ReactNode
    description?: string
    footer?: React.ReactNode
  }
}

export function AuthLayout({ children, hero }: AuthLayoutProps) {
  return (
    <AuroraCanvas variant="glow-dots">
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left side — hero */}
        {hero && (
          <div className="hidden lg:flex flex-col justify-between p-10 border-r border-white/6 relative overflow-hidden">
            <Link to="/" className="relative z-10">
              <Logo size={30} />
            </Link>

            <div className="relative z-10 max-w-md">
              {hero.eyebrow && (
                <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-300 mb-3">
                  {hero.eyebrow}
                </p>
              )}
              <h2 className="text-3xl font-semibold tracking-tight text-white leading-tight mb-3">
                {hero.title}
              </h2>
              {hero.description && (
                <p className="text-[14px] text-white/55 leading-relaxed">{hero.description}</p>
              )}

              {hero.footer && <div className="mt-8">{hero.footer}</div>}
            </div>

            <p className="relative z-10 text-[11.5px] text-white/35">
              © {new Date().getFullYear()} iLogin · Open source identity platform
            </p>
          </div>
        )}

        {/* Right side — form */}
        <div className="flex flex-col items-center justify-center p-6 lg:p-10 relative">
          {!hero && (
            <div className="lg:absolute lg:top-8 lg:left-1/2 lg:-translate-x-1/2 mb-8 lg:mb-0">
              <Link to="/"><Logo size={32} /></Link>
            </div>
          )}
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>
    </AuroraCanvas>
  )
}
