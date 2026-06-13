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

      {/* Stack */}
      <section className="px-6 py-16 border-t border-white/6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] uppercase tracking-widest text-white/35 font-semibold mb-2">
            Engineering
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">The stack</h2>
          <p className="text-[13.5px] text-white/45 mb-7">Chosen for reliability and speed, not novelty.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { name: 'Express 5', role: 'HTTP framework', emoji: '⚡' },
              { name: 'PostgreSQL', role: 'Persistent storage', emoji: '🗄️' },
              { name: 'Drizzle ORM', role: 'Type-safe queries', emoji: '🌧️' },
              { name: 'Zod', role: 'Schema validation', emoji: '✅' },
              { name: 'jsonwebtoken', role: 'JWT signing', emoji: '🔐' },
              { name: 'bcryptjs', role: 'Password hashing', emoji: '🔒' },
              { name: 'React 19', role: 'Frontend', emoji: '⚛️' },
              { name: 'TanStack', role: 'Routing + queries', emoji: '🧭' },
              { name: 'SnapCSS', role: 'Runtime utility CSS', emoji: '🎨' },
              { name: 'Lucide', role: 'Icon set', emoji: '✨' },
            ].map((s) => (
              <div key={s.name} className="p-4 rounded-lg border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/14 transition-all">
                <div className="text-lg mb-2">{s.emoji}</div>
                <p className="text-[13px] font-semibold text-white">{s.name}</p>
                <p className="text-[11.5px] text-white/40 mt-0.5">{s.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
