import { Link } from '@tanstack/react-router'
import { Logo } from '@/components/ui/Logo'

const groups = [
  {
    title: 'Product',
    links: [
      { to: '/', label: 'Overview' },
      { to: '/docs', label: 'Documentation' },
      { to: '/dashboard', label: 'Dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Get started',
    links: [
      { to: '/signup', label: 'Create account' },
      { to: '/login', label: 'Sign in' },
    ],
  },
]

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/6 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Logo size={24} />
            <p className="text-[12.5px] text-white/40 mt-3 leading-relaxed max-w-[220px]">
              Self-hosted identity infrastructure. OAuth2 + OIDC + PKCE.
            </p>
          </div>
          {groups.map((g) => (
            <div key={g.title}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/35 mb-3">
                {g.title}
              </p>
              <ul className="space-y-1.5">
                {g.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-[13px] text-white/55 hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-white/6 flex items-center justify-between flex-wrap gap-3">
          <p className="text-[12px] text-white/35">
            © {new Date().getFullYear()} iLogin. Open source identity platform.
          </p>
          <div className="flex items-center gap-4 text-[12px] text-white/35">
            <span>Built with Express · Drizzle · React</span>
            <span className="size-1 rounded-full bg-emerald-400 shadow-[0_0_6px_0_rgb(74,222,128)]" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
