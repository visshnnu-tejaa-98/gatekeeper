import { createFileRoute, Link } from '@tanstack/react-router'
import { MarketingLayout } from '@/components/shell/MarketingLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Logo } from '@/components/ui/Logo'
import {
  ShieldCheck,
  Zap,
  Lock,
  Users,
  Code2,
  Globe,
  ArrowUpRight,
  GitBranch,
  Sparkles,
  Database,
  Terminal,
  CheckCircle2,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react'
import { useAuthState } from '@/lib/useAuthState'

export const Route = createFileRoute('/')({ component: LandingPage })

function LandingPage() {
  return (
    <MarketingLayout bg="glow-grid">
      <Hero />
      <SocialProof />
      <FeatureGrid />
      <CodeShowcase />
      <Standards />
      <CTA />
    </MarketingLayout>
  )
}

function Hero() {
  const loggedIn = useAuthState()
  return (
    <section className="relative pt-20 pb-24 px-6">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="anim-up inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/8 mb-6">
          <Sparkles className="size-3 text-violet-300" />
          <span className="text-[12px] text-white/70 font-medium">Open source · v1.0 now in beta</span>
          <Link to="/about" className="text-[12px] text-violet-300 hover:text-violet-200 font-semibold flex items-center gap-0.5">
            Read more <ArrowUpRight className="size-3" />
          </Link>
        </div>

        <h1 className="anim-up-1 text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.03em] text-white leading-[1.05] mb-6">
          The auth platform
          <br />
          <span className="gradient-text-aurora">you actually own.</span>
        </h1>

        <p className="anim-up-2 text-[16px] md:text-[17px] text-white/55 max-w-2xl mx-auto leading-relaxed mb-9">
          Self-hosted OAuth2 + OIDC identity provider with PKCE support, refresh token rotation,
          and a developer dashboard. No per-seat pricing. No vendor lock-in. Just spec-compliant infrastructure.
        </p>

        <div className="anim-up-3 flex items-center justify-center gap-3 flex-wrap mb-12">
          {loggedIn ? (
            <Link to="/dashboard">
              <Button variant="primary" size="lg" className="gap-1.5 px-5">
                <LayoutDashboard className="size-4" /> Go to dashboard <ArrowUpRight className="size-4" />
              </Button>
            </Link>
          ) : (
            <Link to="/signup">
              <Button variant="primary" size="lg" className="gap-1.5 px-5">
                Start free <ArrowUpRight className="size-4" />
              </Button>
            </Link>
          )}
          <Link to="/docs">
            <Button variant="outline" size="lg" className="gap-1.5 px-5">
              <Terminal className="size-4" /> View docs
            </Button>
          </Link>
        </div>

        {/* Showcase card */}
        <div className="anim-up-4 mt-4 relative">
          <div className="absolute inset-x-12 -top-6 bottom-0 bg-gradient-to-b from-violet-500/20 via-blue-500/10 to-transparent blur-3xl -z-10" />
          <div className="relative max-w-3xl mx-auto rounded-xl border border-white/8 bg-[#0a0a14]/80 backdrop-blur-xl overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-violet-400/70 before:to-transparent">
            <div className="flex items-center gap-2 px-3.5 h-9 border-b border-white/6 bg-white/[0.02]">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="size-2.5 rounded-full bg-white/15" />
              </div>
              <span className="text-[11px] text-white/40 font-mono ml-2">https://auth.acme.com/o/token</span>
            </div>
            <div className="grid md:grid-cols-2 divide-x divide-white/6">
              <div className="p-5 text-left">
                <p className="text-[10.5px] uppercase tracking-wider text-white/35 font-semibold mb-2">Request</p>
                <pre className="text-[12px] font-mono text-white/70 leading-relaxed">{`POST /o/token
{
  "code": "9f3a2b1c...",
  "client_id": "abc123",
  "code_verifier": "dBjftJeZ...",
  "algorithm": "SHA-256"
}`}</pre>
              </div>
              <div className="p-5 text-left">
                <p className="text-[10.5px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-2 flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> 200 OK
                </p>
                <pre className="text-[12px] font-mono text-white/70 leading-relaxed">{`{
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SocialProof() {
  const items = ['Express 5', 'PostgreSQL', 'Drizzle ORM', 'React 19', 'TanStack', 'SnapCSS', 'OAuth 2.0', 'PKCE', 'OIDC']
  return (
    <section className="py-8 border-y border-white/6 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-[11px] uppercase tracking-widest text-white/35 font-semibold mb-5">
          Built on open standards & open source
        </p>
        <div className="flex items-center justify-center flex-wrap gap-x-8 gap-y-3">
          {items.map((i) => (
            <span key={i} className="text-[13px] font-medium text-white/40 hover:text-white/70 transition-colors">
              {i}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

interface FeatureItem {
  icon: LucideIcon
  title: string
  desc: string
  color: string
}

const FEATURES: FeatureItem[] = [
  {
    icon: ShieldCheck,
    title: 'OAuth 2.0 + OIDC',
    desc: 'Complete OpenID Connect provider with JWKS, token introspection (RFC 7662), and revocation (RFC 7009).',
    color: 'violet',
  },
  {
    icon: Zap,
    title: 'PKCE for SPAs',
    desc: 'Public clients without secrets. Authorization codes with SHA-256 code challenges and 5-minute TTL.',
    color: 'blue',
  },
  {
    icon: Lock,
    title: 'Instant revocation',
    desc: 'JTI-based access token blacklist. Logout invalidates tokens immediately — not at expiry.',
    color: 'emerald',
  },
  {
    icon: Users,
    title: 'RBAC built-in',
    desc: 'Three-tier role hierarchy with field-level enforcement: super_admin, admin, user.',
    color: 'pink',
  },
  {
    icon: Code2,
    title: 'Developer first',
    desc: 'Type-safe REST API, Zod validation, comprehensive errors. A dashboard you actually want to use.',
    color: 'amber',
  },
  {
    icon: Database,
    title: 'Self-hosted',
    desc: 'Bring your own PostgreSQL. Deploy anywhere. Your user data never leaves your infrastructure.',
    color: 'cyan',
  },
]

function FeatureGrid() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-12">
          <p className="text-[12px] uppercase tracking-widest text-violet-300/80 font-semibold mb-2">
            What's inside
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-white leading-tight mb-3">
            Everything you need.<br />
            <span className="text-white/45">Nothing you don't.</span>
          </h2>
          <p className="text-[15px] text-white/55 leading-relaxed">
            A focused identity platform. Not a low-code maze. Not a billing trap.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="group relative p-5 rounded-lg border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/16 transition-all duration-200 hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="size-9 rounded-md bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/15 flex items-center justify-center mb-4">
                <f.icon className="size-4 text-violet-300" />
              </div>
              <h3 className="text-[14.5px] font-semibold text-white mb-1.5 tracking-tight">{f.title}</h3>
              <p className="text-[13px] text-white/50 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CodeShowcase() {
  return (
    <section className="py-24 px-6 border-t border-white/6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-[12px] uppercase tracking-widest text-violet-300/80 font-semibold mb-2">
            Drop-in integration
          </p>
          <h2 className="text-4xl font-semibold tracking-[-0.02em] text-white leading-tight mb-4">
            From signup to tokens<br />
            in <span className="gradient-text-primary">5 minutes</span>.
          </h2>
          <p className="text-[15px] text-white/55 leading-relaxed mb-6">
            Use any compliant OAuth2 library. We're spec-compliant, so client SDKs from
            Auth0, Okta, or openid-client work out of the box.
          </p>
          <ul className="space-y-2.5 mb-7">
            {[
              'Standard /authorize → /consent → /token flow',
              'PKCE code challenge with SHA-256',
              'Refresh token rotation built-in',
              'JWKS endpoint for signature verification',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[13.5px] text-white/65">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link to="/docs">
            <Button variant="primary" className="gap-1.5">
              Browse API reference <ArrowUpRight className="size-3.5" />
            </Button>
          </Link>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-br from-violet-500/20 via-blue-500/10 to-transparent blur-2xl -z-10 rounded-2xl" />
          <div className="rounded-xl border border-white/8 bg-[#0a0a14] overflow-hidden">
            <div className="flex items-center justify-between px-4 h-9 border-b border-white/6 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Terminal className="size-3 text-white/40" />
                <span className="text-[12px] font-mono text-white/55">curl • PKCE flow</span>
              </div>
              <Badge tone="purple" size="sm">POST /o/token</Badge>
            </div>
            <pre className="text-[12.5px] font-mono leading-relaxed text-white/70 p-5 overflow-x-auto">
{`# 1. Generate PKCE pair
verifier=$(openssl rand -hex 32)
challenge=$(echo -n $verifier | openssl sha256 | xxd -p)

# 2. Redirect user to /authorize
open "$AUTH_URL/o/authorize?
  client_id=$CLIENT_ID
  &code_challange=$challenge
  &algorithm=SHA-256"

# 3. After consent, exchange code for tokens
curl -X POST $AUTH_URL/o/token \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "'$CODE'",
    "client_id": "'$CLIENT_ID'",
    "code_verifier": "'$verifier'",
    "algorithm": "SHA-256"
  }'`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  )
}

function Standards() {
  const specs = [
    { label: 'OAuth 2.0', rfc: 'RFC 6749' },
    { label: 'PKCE', rfc: 'RFC 7636' },
    { label: 'Token Introspection', rfc: 'RFC 7662' },
    { label: 'Token Revocation', rfc: 'RFC 7009' },
    { label: 'JWT', rfc: 'RFC 7519' },
    { label: 'OpenID Connect', rfc: 'OIDC Core 1.0' },
  ]
  return (
    <section className="py-20 px-6 border-t border-white/6">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-[12px] uppercase tracking-widest text-violet-300/80 font-semibold mb-2">
          Standards compliant
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-3">
          Built on specs, not opinions
        </h2>
        <p className="text-[14.5px] text-white/55 mb-10 max-w-xl mx-auto">
          We implement the IETF / OpenID specs as written. Any compliant client works.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {specs.map((s) => (
            <div key={s.rfc} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/8 bg-white/[0.02]">
              <GitBranch className="size-4 text-violet-300 shrink-0" />
              <div className="text-left">
                <p className="text-[13px] font-medium text-white">{s.label}</p>
                <p className="text-[11px] text-white/40 font-mono">{s.rfc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  const loggedIn = useAuthState()
  return (
    <section className="py-24 px-6 relative">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-64 bg-gradient-to-r from-violet-500/10 via-blue-500/5 to-transparent blur-3xl -z-10" />
      <div className="max-w-4xl mx-auto rounded-2xl border border-white/8 bg-gradient-to-br from-violet-500/8 to-transparent p-10 md:p-14 text-center relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-violet-500/60 before:to-transparent">
        <Logo size={36} showText={false} className="mx-auto mb-4" glow />
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-3">
          {loggedIn ? 'Welcome back, builder.' : 'Stop renting your auth.'}
        </h2>
        <p className="text-[15px] text-white/55 mb-7 max-w-xl mx-auto">
          {loggedIn
            ? 'Jump back into your workspace, or browse the docs to find what you need next.'
            : 'Sign up free. Self-host in minutes. Production-ready from day one.'}
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {loggedIn ? (
            <Link to="/dashboard">
              <Button variant="primary" size="lg" className="gap-1.5 px-5">
                <LayoutDashboard className="size-4" /> Open dashboard <ArrowUpRight className="size-4" />
              </Button>
            </Link>
          ) : (
            <Link to="/signup">
              <Button variant="primary" size="lg" className="gap-1.5 px-5">
                Create your account <ArrowUpRight className="size-4" />
              </Button>
            </Link>
          )}
          <Link to="/docs">
            <Button variant="outline" size="lg" className="gap-1.5">
              <Globe className="size-4" /> Self-host guide
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
