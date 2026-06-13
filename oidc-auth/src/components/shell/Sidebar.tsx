import { Link, useLocation } from '@tanstack/react-router'
import {
  LayoutDashboard,
  AppWindow,
  Users,
  User,
  Settings,
  KeyRound,
  ChevronsUpDown,
  LogOut,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { useProfile, useLogout } from '@/services/auth.queries'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface NavItem {
  icon: LucideIcon
  label: string
  to: string
  badge?: string
  superAdminOnly?: boolean
}

const PRIMARY: NavItem[] = [
  { icon: LayoutDashboard, label: 'Overview', to: '/dashboard' },
  { icon: AppWindow, label: 'Applications', to: '/dashboard/applications' },
  { icon: Users, label: 'Users', to: '/dashboard/users', superAdminOnly: true },
  { icon: KeyRound, label: 'Token Lab', to: '/dashboard/tokens' },
]

const SECONDARY: NavItem[] = [
  { icon: User, label: 'Profile', to: '/dashboard/profile' },
  { icon: Settings, label: 'Settings', to: '/dashboard/settings' },
]

export function Sidebar() {
  const { data: user } = useProfile()
  const logout = useLogout()
  const isSuper = user?.role === 'super_admin'

  const handleLogout = async () => {
    await logout.mutateAsync()
    toast.success('Signed out')
    window.location.href = '/login'
  }

  return (
    <aside className="hidden lg:flex shrink-0 w-[220px] flex-col h-screen sticky top-0 border-r border-white/6 bg-[#0a0a10]">
      {/* Workspace switcher */}
      <div className="px-3 pt-3 pb-2">
        <button className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-white/[0.04] group transition-colors">
          <Logo size={22} showText={false} />
          <div className="flex-1 text-left min-w-0">
            <p className="text-[12.5px] font-semibold text-white truncate">
              {user?.name || 'iLogin'}
            </p>
            <p className="text-[10.5px] text-white/45 truncate">Personal workspace</p>
          </div>
          <ChevronsUpDown className="size-3.5 text-white/35 group-hover:text-white/60 shrink-0" />
        </button>
      </div>

      <div className="h-px bg-white/6 mx-3" />

      {/* Nav primary */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-white/30 px-2 mb-1.5">
          Workspace
        </p>
        <div className="flex flex-col gap-0.5">
          {PRIMARY.filter((i) => !i.superAdminOnly || isSuper).map((item) => (
            <NavLink key={item.to} item={item} />
          ))}
        </div>

        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-white/30 px-2 mb-1.5 mt-5">
          Account
        </p>
        <div className="flex flex-col gap-0.5">
          {SECONDARY.map((item) => (
            <NavLink key={item.to} item={item} />
          ))}
        </div>
      </nav>

      {/* User card */}
      <div className="p-3 border-t border-white/6">
        <div className="rounded-lg bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/15 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-3 text-violet-300" />
            <p className="text-[11px] font-semibold text-white">Self-hosted</p>
          </div>
          <p className="text-[11px] text-white/45 mb-2">
            Your data stays yours. Zero vendor lock-in.
          </p>
          <Link to="/docs" className="text-[11px] text-violet-300 hover:text-violet-200 font-medium">
            Read docs →
          </Link>
        </div>

        <div className="flex items-center gap-2.5 mt-3 px-1">
          <Avatar src={user?.avatar} name={user?.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-white truncate">{user?.name || '—'}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Badge tone={isSuper ? 'purple' : user?.role === 'admin' ? 'blue' : 'green'} size="sm">
                {user?.role || 'user'}
              </Badge>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="size-7 rounded-md text-white/35 hover:text-red-300 hover:bg-red-500/10 flex items-center justify-center transition-colors"
            title="Sign out"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}

function NavLink({ item }: { item: NavItem }) {
  const location = useLocation()
  const isActive = item.to === '/dashboard'
    ? location.pathname === '/dashboard'
    : location.pathname.startsWith(item.to)
  const Icon = item.icon
  return (
    <Link to={item.to}>
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] font-medium transition-colors',
          isActive
            ? 'bg-white/[0.06] text-white border border-white/8'
            : 'text-white/55 hover:text-white hover:bg-white/[0.04] border border-transparent',
        )}
      >
        <Icon className={cn('size-4 shrink-0', isActive ? 'text-violet-300' : '')} />
        <span className="flex-1">{item.label}</span>
        {item.badge && <Badge tone="purple" size="sm">{item.badge}</Badge>}
      </div>
    </Link>
  )
}
