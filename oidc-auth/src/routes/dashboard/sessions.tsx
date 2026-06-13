import { createFileRoute, Link } from '@tanstack/react-router'
import { DashboardLayout } from '@/components/shell/DashboardLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge, StatusDot } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Monitor,
  Smartphone,
  Globe,
  MapPin,
  Sparkles,
  CheckCircle2,
  Bell,
  ArrowUpRight,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/sessions')({ component: SessionsPage })

function SessionsPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            Sessions <Badge tone="purple" size="md">Coming soon</Badge>
          </span>
        }
        description="Track every device that's signed in to your account — and revoke any of them in one click."
      />

      {/* Hero card */}
      <div className="max-w-5xl mb-6">
        <Card glow className="border-violet-500/20 anim-up overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.08] via-transparent to-blue-500/[0.04] pointer-events-none" />
            <CardBody className="relative pt-6">
              <div className="flex items-start gap-4">
                <div className="size-11 rounded-lg bg-gradient-to-br from-violet-500/30 to-blue-500/30 border border-violet-500/30 flex items-center justify-center shrink-0">
                  <Sparkles className="size-5 text-violet-200" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[18px] font-semibold text-white mb-1 tracking-tight">
                    Session management is on the roadmap
                  </h2>
                  <p className="text-[13.5px] text-white/55 leading-relaxed max-w-2xl">
                    Soon you'll be able to see every active session — device, browser, IP, last
                    activity — and revoke them individually or all at once. Want to be notified
                    when it ships?
                  </p>
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <Button variant="primary" size="sm" className="gap-1.5" disabled>
                      <Bell className="size-3.5" /> Notify me
                    </Button>
                    <Link to="/docs">
                      <Button variant="outline" size="sm" className="gap-1">
                        View roadmap <ArrowUpRight className="size-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardBody>
          </div>
        </Card>
      </div>

      {/* Preview grid */}
      <div className="max-w-5xl">
        <p className="text-[11px] uppercase tracking-widest text-white/35 font-semibold mb-3">
          Preview
        </p>
        <p className="text-[13px] text-white/45 mb-4 max-w-2xl">
          A glimpse of what's coming. Live session data, geo lookup, device fingerprinting,
          and one-click revocation per device.
        </p>

        <div className="space-y-2">
          {PREVIEW_SESSIONS.map((s, i) => (
            <SessionRowPreview key={i} {...s} />
          ))}
        </div>
      </div>

      {/* What's included */}
      <div className="max-w-5xl mt-10">
        <p className="text-[11px] uppercase tracking-widest text-white/35 font-semibold mb-3">
          What's included
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((f) => (
            <Card key={f.title} interactive>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <f.icon className="size-4 text-violet-300" /> {f.title}
                  </CardTitle>
                  <CardDescription>{f.desc}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

const FEATURES = [
  {
    icon: Monitor,
    title: 'Device tracking',
    desc: 'Browser, OS, device class detected from User-Agent on every session.',
  },
  {
    icon: MapPin,
    title: 'Geo + IP',
    desc: 'Approximate city + country resolved server-side from request IP.',
  },
  {
    icon: CheckCircle2,
    title: 'One-click revoke',
    desc: 'Kill any individual session, or all sessions except current.',
  },
  {
    icon: Globe,
    title: 'Last activity',
    desc: 'Live "Active now" indicators and last-seen timestamps.',
  },
  {
    icon: Smartphone,
    title: 'Per-application view',
    desc: 'See which OAuth2 clients hold active tokens per session.',
  },
  {
    icon: Bell,
    title: 'Security alerts',
    desc: 'Get notified when a new sign-in happens from an unfamiliar device.',
  },
]

const PREVIEW_SESSIONS = [
  {
    device: 'MacBook Pro',
    icon: Monitor,
    browser: 'Chrome 142',
    location: 'San Francisco, US',
    ip: '24.118.···.··',
    lastActive: 'Active now',
    current: true,
  },
  {
    device: 'iPhone 15 Pro',
    icon: Smartphone,
    browser: 'Safari Mobile',
    location: 'San Francisco, US',
    ip: '172.58.···.··',
    lastActive: '2 hours ago',
    current: false,
  },
  {
    device: 'Linux Workstation',
    icon: Monitor,
    browser: 'Firefox 138',
    location: 'Berlin, DE',
    ip: '95.91.···.···',
    lastActive: 'Yesterday',
    current: false,
  },
]

function SessionRowPreview({
  device,
  icon: Icon,
  browser,
  location,
  ip,
  lastActive,
  current,
}: (typeof PREVIEW_SESSIONS)[number]) {
  return (
    <div className="relative rounded-lg border border-white/8 bg-white/[0.02] px-4 py-3 flex items-center gap-4 opacity-70 hover:opacity-100 hover:border-white/16 transition-all group">
      <div className="size-9 rounded-md bg-white/[0.04] border border-white/8 flex items-center justify-center shrink-0">
        <Icon className="size-4 text-white/55" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[13.5px] font-semibold text-white truncate">{device}</p>
          {current && <Badge tone="green" size="sm">Current</Badge>}
        </div>
        <div className="flex items-center gap-2 text-[11.5px] text-white/45 flex-wrap">
          <span>{browser}</span>
          <span className="text-white/20">·</span>
          <span className="flex items-center gap-0.5"><MapPin className="size-2.5" /> {location}</span>
          <span className="text-white/20">·</span>
          <span className="font-mono text-white/40">{ip}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <StatusDot tone={current ? 'green' : 'gray'} />
          <span className="text-[11.5px] text-white/45">{lastActive}</span>
        </div>
        <Button variant="ghost" size="xs" disabled className="opacity-50">
          {current ? 'This device' : 'Revoke'}
        </Button>
      </div>
      {/* Pinned coming-soon overlay */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <Badge tone="purple" size="sm">Soon</Badge>
      </div>
    </div>
  )
}
