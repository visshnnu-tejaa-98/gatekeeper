import { Link } from '@tanstack/react-router'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { Github, ArrowUpRight, LayoutDashboard } from 'lucide-react'
import { useAuthState } from '@/lib/useAuthState'

const links = [
  { to: '/', label: 'Product' },
  { to: '/about', label: 'About' },
  { to: '/docs', label: 'Docs' },
  { to: '/contact', label: 'Contact' },
]

export function MarketingNav() {
  const loggedIn = useAuthState()

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#08080c]/70 border-b border-white/6">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-6">
        <Link to="/" className="flex items-center gap-6" title="Home">
          <Logo size={28} />
          <span className="hidden md:inline-block text-[11px] font-medium px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-white/55 leading-none">
            v1.0 beta
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-1.5 text-[13px] font-medium text-white/55 hover:text-white rounded-md hover:bg-white/[0.05] transition-colors"
              activeProps={{ className: 'text-white bg-white/[0.05]' }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <Github className="size-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </Button>
          {loggedIn ? (
            <Link to="/dashboard">
              <Button variant="primary" size="sm" className="gap-1.5">
                <LayoutDashboard className="size-3.5" />
                <span>Dashboard</span>
                <ArrowUpRight className="size-3.5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm" className="gap-1">
                  Get started <ArrowUpRight className="size-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
