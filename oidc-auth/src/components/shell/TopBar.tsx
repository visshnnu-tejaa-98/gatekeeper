import { Link, useLocation } from '@tanstack/react-router'
import { Search, Bell, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const PATH_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  applications: 'Applications',
  users: 'Users',
  profile: 'Profile',
  settings: 'Settings',
  tokens: 'Token Lab',
  new: 'New',
}

function buildCrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  return segments.map((seg, i) => ({
    label: PATH_LABELS[seg] || seg,
    href: '/' + segments.slice(0, i + 1).join('/'),
  }))
}

export function TopBar() {
  const location = useLocation()
  const crumbs = buildCrumbs(location.pathname)

  return (
    <header className="sticky top-0 z-30 h-12 border-b border-white/6 bg-[#08080c]/85 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-5 gap-4">
        <nav className="flex items-center gap-1 text-[13px] min-w-0">
          {crumbs.map((c, i) => (
            <span key={c.href} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight className="size-3 text-white/25 shrink-0" />}
              <Link
                to={c.href}
                className={cn(
                  'truncate transition-colors',
                  i === crumbs.length - 1
                    ? 'text-white font-medium'
                    : 'text-white/45 hover:text-white/80',
                )}
              >
                {c.label}
              </Link>
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button className="hidden md:flex items-center gap-2 h-7 px-2.5 rounded-md bg-white/[0.04] border border-white/8 text-white/45 hover:text-white hover:bg-white/[0.07] hover:border-white/14 transition-colors text-[12px]">
            <Search className="size-3" />
            <span>Search</span>
            <span className="flex items-center gap-0.5 ml-3">
              <kbd>⌘</kbd>
              <kbd>K</kbd>
            </span>
          </button>
          <button className="size-7 rounded-md text-white/45 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors">
            <Bell className="size-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
