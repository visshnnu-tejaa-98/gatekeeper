import { createFileRoute, Link } from '@tanstack/react-router'
import { MarketingLayout } from '@/components/shell/MarketingLayout'
import { Button } from '@/components/ui/Button'
import { ArrowUpRight, ShieldCheck, Sparkles, Heart, Lock } from 'lucide-react'

export const Route = createFileRoute('/about')({ component: AboutPage })

function AboutPage() {
  return (
    <MarketingLayout bg="grid-only">
      {/* Hero */}
      <section className="px-6 pt-20 pb-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-[12px] uppercase tracking-widest text-violet-300/80 font-semibold mb-3 anim-up">
            About
          </p>
          <h1 className="text-5xl font-semibold tracking-[-0.03em] text-white leading-[1.05] mb-5 anim-up-1">
            Auth shouldn't be<br />a subscription.
          </h1>
          <p className="text-[16px] text-white/55 leading-relaxed anim-up-2">
            iLogin exists because identity is too critical to outsource to a third party that
            can change pricing, deprecate features, or get acquired. We built the platform
            we wanted to use.
          </p>
        </div>
      </section>

      {/* Principles */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-widest text-violet-300/80 font-semibold mb-2">
              Principles
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.02em] text-white leading-tight">
              What we believe.
            </h2>
            <p className="text-[14px] text-white/55 mt-2 max-w-2xl">
              Four ideas that shape every line of code in iLogin.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {[
              {
                icon: Lock,
                title: 'Own your data',
                desc: 'User data never leaves your infrastructure. Postgres lives on your hardware, in your VPC, under your compliance regime.',
              },
              {
                icon: ShieldCheck,
                title: 'Standards before features',
                desc: 'RFC 6749, 7009, 7636, 7662. We implement specs as written. Custom extensions create lock-in we don\'t want and you don\'t need.',
              },
              {
                icon: Heart,
                title: 'Open source forever',
                desc: 'MIT licensed. You can fork it, audit it, modify it, and self-host it without telling anyone. That\'s the whole point.',
              },
              {
                icon: Sparkles,
                title: 'Developer first',
                desc: 'Type-safe APIs. Zod validation. Cohesive errors. A dashboard that respects your time. We\'re developers building for developers.',
              },
            ].map((p) => (
              <div
                key={p.title}
                className="relative rounded-lg border border-white/8 bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-white/16 transition-all duration-150"
              >
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-md bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <p.icon className="size-4 text-violet-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-semibold text-white tracking-tight mb-1.5">
                      {p.title}
                    </h3>
                    <p className="text-[13px] text-white/55 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EngineeringStack />


      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white mb-3">
            Ready to deploy?
          </h2>
          <p className="text-[15px] text-white/55 mb-6">
            Start with a free account. Self-host whenever you're ready.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/signup">
              <Button variant="primary" size="lg" className="gap-1.5">
                Get started <ArrowUpRight className="size-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">Contact us</Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Engineering stack — brand-styled cards
// Logos approximated as small SVG marks tinted in each tool's brand color.
// ───────────────────────────────────────────────────────────────────────

interface StackEntry {
  name: string
  role: string
  href: string
  tagline: string
  color: string
  glyph: React.ReactNode
}

interface StackCategory {
  label: string
  items: StackEntry[]
}

const CATEGORIES: StackCategory[] = [
  {
    label: 'Backend',
    items: [
      {
        name: 'Express 5',
        role: 'HTTP framework',
        href: 'https://expressjs.com',
        tagline: 'Minimal, fast, unopinionated routing',
        color: '#cbd5e1',
        glyph: <span style={{ color: '#cbd5e1' }} className="font-extrabold tracking-tight">ex</span>,
      },
      {
        name: 'PostgreSQL',
        role: 'Database',
        href: 'https://www.postgresql.org/docs',
        tagline: 'Battle-tested relational store',
        color: '#4169e1',
        glyph: (
          <svg viewBox="0 0 24 24" fill="none" className="size-5">
            <path
              d="M19.8 9.2c-.6-3.6-3.7-5.7-7.4-5.7C8.7 3.5 5.5 5.7 5 9.3 4.2 13.6 6 17.3 9.2 18.6c.5.2.8 0 .9-.4l.5-1.6c.1-.4 0-.5-.2-.6-.4-.2-1.6-.7-1.6-3.2 0-1.8 1.4-3.7 3.4-3.7s3.2 1.4 3.2 3.5c0 2.3-1 4.3-2.4 4.3-.8 0-1.4-.7-1.2-1.5.3-1 .8-2.1.8-2.8 0-.6-.4-1.2-1.1-1.2-.9 0-1.6.9-1.6 2.2 0 .8.3 1.4.3 1.4s-1 4.2-1.1 4.7c-.3 1.4 0 3 0 3.2 0 .1.2.1.2.1.1-.1 1.4-1.7 1.8-3.1.1-.4.7-2.7.7-2.7.4.7 1.4 1.2 2.5 1.2 3.3 0 5.5-3 5.5-7.1z"
              fill="#60a5fa"
            />
          </svg>
        ),
      },
      {
        name: 'Drizzle ORM',
        role: 'Type-safe queries',
        href: 'https://orm.drizzle.team',
        tagline: 'Headless TypeScript ORM, no decorators',
        color: '#c5f74f',
        glyph: (
          <svg viewBox="0 0 24 24" className="size-5">
            <path d="M5 8h2.5L5.5 16H3L5 8z" fill="#c5f74f" />
            <path d="M10 8h2.5L10.5 16H8L10 8z" fill="#c5f74f" />
            <path d="M15 8h2.5L15.5 16H13L15 8z" fill="#c5f74f" />
          </svg>
        ),
      },
      {
        name: 'Zod',
        role: 'Validation',
        href: 'https://zod.dev',
        tagline: 'TS-first schema validation with static type inference',
        color: '#3068b7',
        glyph: (
          <svg viewBox="0 0 24 24" className="size-5">
            <path d="M4 4h16l-4 4h8l-16 12 4-4H4L20 4H4z" fill="#3068b7" opacity="0.85" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Frontend',
    items: [
      {
        name: 'React 19',
        role: 'UI runtime',
        href: 'https://react.dev',
        tagline: 'Component model with concurrent rendering',
        color: '#61dafb',
        glyph: (
          <svg viewBox="0 0 24 24" className="size-5">
            <circle cx="12" cy="12" r="2" fill="#61dafb" />
            <g stroke="#61dafb" strokeWidth="1" fill="none" opacity="0.85">
              <ellipse cx="12" cy="12" rx="10" ry="4" />
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
            </g>
          </svg>
        ),
      },
      {
        name: 'TanStack',
        role: 'Router + Query',
        href: 'https://tanstack.com',
        tagline: 'Type-safe routing, async data, devtools',
        color: '#ff5b1f',
        glyph: (
          <svg viewBox="0 0 24 24" className="size-5">
            <path d="M6 16 12 6l6 10H6z" fill="#ff5b1f" />
            <path d="M9 16h6l-3-5-3 5z" fill="#fb7185" opacity="0.8" />
          </svg>
        ),
      },
      {
        name: 'SnapCSS',
        role: 'Utility CSS engine',
        href: 'https://snapcss.in',
        tagline: 'Runtime utility-first CSS, no build step',
        color: '#a78bfa',
        glyph: (
          <svg viewBox="0 0 24 24" className="size-5">
            <path d="M13 3 5 14h6l-2 7 9-12h-6l1-6z" fill="#a78bfa" />
          </svg>
        ),
      },
      {
        name: 'Lucide',
        role: 'Icon library',
        href: 'https://lucide.dev',
        tagline: 'Open-source SVG icon set',
        color: '#f97316',
        glyph: (
          <svg viewBox="0 0 24 24" fill="none" className="size-5">
            <path d="M12 2 4 6v6c0 5 3.5 9.4 8 10 4.5-.6 8-5 8-10V6l-8-4z" stroke="#f97316" strokeWidth="1.6" />
            <path d="m9 12 2 2 4-4" stroke="#f97316" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Security',
    items: [
      {
        name: 'jsonwebtoken',
        role: 'JWT signing',
        href: 'https://github.com/auth0/node-jsonwebtoken',
        tagline: 'RFC 7519-compliant JSON Web Tokens',
        color: '#fb7185',
        glyph: (
          <svg viewBox="0 0 24 24" className="size-5">
            <path d="M12 2v6m0 8v6M4.93 4.93l4.24 4.24m5.66 5.66 4.24 4.24M2 12h6m8 0h6M4.93 19.07l4.24-4.24m5.66-5.66 4.24-4.24" stroke="#fb7185" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        name: 'bcryptjs',
        role: 'Password hashing',
        href: 'https://github.com/dcodeIO/bcrypt.js',
        tagline: 'Adaptive password hashing with salts',
        color: '#fbbf24',
        glyph: (
          <svg viewBox="0 0 24 24" fill="none" className="size-5">
            <rect x="5" y="11" width="14" height="9" rx="2" fill="#fbbf24" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#fbbf24" strokeWidth="1.6" />
          </svg>
        ),
      },
    ],
  },
]

function EngineeringStack() {
  return (
    <section className="px-6 py-20 border-t border-white/6 relative overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent pointer-events-none"
        aria-hidden
      />
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 max-w-2xl">
          <p className="text-[11px] uppercase tracking-widest text-violet-300/80 font-semibold mb-2">
            Engineering
          </p>
          <h2 className="text-3xl md:text-[34px] font-semibold tracking-[-0.02em] text-white leading-tight mb-3">
            The stack we'd pick<br />for our own product.
          </h2>
          <p className="text-[14px] text-white/55 leading-relaxed">
            Boring where it counts. Modern where it matters. Every dependency has earned its spot —
            no rewrites mid-flight, no untested betas in production.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          {CATEGORIES.map((cat) => (
            <div key={cat.label}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10.5px] uppercase tracking-widest font-bold text-white/35">
                  {cat.label}
                </span>
                <div className="flex-1 h-px bg-white/6" />
                <span className="text-[10.5px] text-white/25 tabular-nums">
                  {String(cat.items.length).padStart(2, '0')}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {cat.items.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative overflow-hidden rounded-lg border border-white/8 bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-white/16 transition-all duration-150"
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${s.color}80, transparent)`,
                      }}
                      aria-hidden
                    />
                    <div className="flex items-center justify-between mb-2.5">
                      <div
                        className="size-9 rounded-md flex items-center justify-center border"
                        style={{
                          background: `${s.color}10`,
                          borderColor: `${s.color}30`,
                        }}
                      >
                        {s.glyph}
                      </div>
                      <ArrowUpRight className="size-3.5 text-white/25 group-hover:text-white/70 transition-colors" />
                    </div>
                    <p className="text-[13.5px] font-semibold text-white tracking-tight leading-tight">
                      {s.name}
                    </p>
                    <p className="text-[11px] uppercase tracking-wider text-white/35 font-medium mt-0.5 mb-1.5">
                      {s.role}
                    </p>
                    <p className="text-[11.5px] text-white/45 leading-relaxed line-clamp-2">
                      {s.tagline}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center gap-2 text-[12px] text-white/35">
          <Sparkles className="size-3 text-violet-300/60" />
          <span>Click any tool to jump to its official documentation.</span>
        </div>
      </div>
    </section>
  )
}

